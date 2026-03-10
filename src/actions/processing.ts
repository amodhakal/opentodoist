"use server";

import { db } from "@/lib/db";
import { process as processTable, todoItem, account, user } from "@/lib/db/schema";
import { and, eq, isNull, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Sentry from "@sentry/nextjs";

const todoItemSchema = z.object({
  content: z.string().min(1),
  priority: z.enum(["p1", "p2", "p3", "p4"]),
  dueDate: z.string().nullable().optional(),
});

export async function createNewProcess(text: string, userId: string) {
  try {
    // Check user bypass flag
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userRecord?.bypassRateLimit) {
      // Check usage in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const usageCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(processTable)
        .where(
          and(
            eq(processTable.userId, userId),
            gte(processTable.createdAt, sevenDaysAgo)
          )
        );

      if (usageCount[0].count >= 10) {
        return { error: "Rate limit exceeded: You can only process tasks 10 times per week" };
      }
    }

    const result = await db
      .insert(processTable)
      .values({ id: crypto.randomUUID(), userId, content: text })
      .returning();

    return { process: result[0] };
  } catch (err) {
    console.error(err);
    return { error: "Couldn't create new process" };
  }
}

export async function getTodoistAccessToken(userId: string) {
  try {
    const accountRecord = await db.query.account.findFirst({
      where: and(eq(account.userId, userId), eq(account.providerId, "todoist")),
    });

    if (!accountRecord?.accessToken) {
      return { error: "No Todoist access token found" };
    }

    return { accessToken: accountRecord.accessToken };
  } catch (err) {
    console.error("Error fetching Todoist token:", err);
    return { error: "Failed to get Todoist access token" };
  }
}

export async function addTodoToTodoist(
  accessToken: string,
  content: string,
  priority: number = 4,
  dueDate?: string,
) {
  try {
    const body: Record<string, unknown> = { content };

    if (priority >= 1 && priority <= 4) {
      body.priority = priority;
    }

    if (dueDate) {
      body.due_date = dueDate;
    }

    const response = await fetch("https://api.todoist.com/api/v1/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Todoist API error:", error);
      return { error: `Failed to add task to Todoist: ${error}` };
    }

    const task = await response.json();
    return { task };
  } catch (err) {
    console.error("Error adding to Todoist:", err);
    return { error: "Failed to add task to Todoist" };
  }
}

export async function processTextWithAI(text: string, processId: string) {
  const startTime = Date.now();
  
  return await Sentry.startSpan(
    {
      name: "ai.process-text",
      op: "ai.processing",
      attributes: {
        "ai.process_id": processId,
        "ai.text_length": text.length,
      },
    },
    async (span) => {
      try {
        const apiKey = process.env.GEMINI_API!;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a task extraction assistant. Parse text and extract all actionable tasks/todos.
    Return ONLY a valid JSON array (no markdown, no explanation) with this structure:
    [{"content": "task description", "priority": "p1"|"p2"|"p3"|"p4", "dueDate": "YYYY-MM-DD"|null}]
    
    Priority rules:
    - p1: urgent, ASAP, critical, today, emergency
    - p2: soon, this week, important, high priority
    - p3: normal, sometime this month, regular task
    - p4: low priority, backlog, nice to have
    
    Text to process:
    ${text}
    
    Return empty array [] if no tasks found.
    
    The current datetime is ${ new Date().toLocaleString()}`;

        const aiStartTime = Date.now();
        const result = await model.generateContent(prompt);
        const aiEndTime = Date.now();
        const aiDuration = aiEndTime - aiStartTime;
        
        // Track AI request duration
        span.setAttribute("ai.duration_ms", aiDuration);
        Sentry.setMeasurement("ai_request_duration", aiDuration, "millisecond");

        const response = result.response;
        const content = response.text();

        let parsedData;
        try {
          const cleanedContent = content
            .replace(/```json\n?|\n?```\n?/g, "")
            .trim();
          const parsed = JSON.parse(cleanedContent);
          if (Array.isArray(parsed)) {
            parsedData = parsed;
          } else if (parsed.todos && Array.isArray(parsed.todos)) {
            parsedData = parsed.todos;
          } else if (parsed.items && Array.isArray(parsed.items)) {
            parsedData = parsed.items;
          } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
            parsedData = parsed.tasks;
          } else if (parsed.data && Array.isArray(parsed.data)) {
            parsedData = parsed.data;
          } else {
            parsedData = [];
          }
        } catch (parseErr) {
          parsedData = [];
          Sentry.captureException(parseErr, {
            tags: { process_id: processId, error_type: "ai_parse_error" },
            extra: { raw_response: content },
          });
        }

        const todoItems = todoItemSchema.array().parse(parsedData);
        
        // Track number of tasks generated
        span.setAttribute("ai.tasks_generated", todoItems.length);
        Sentry.setMeasurement("ai_tasks_generated", todoItems.length, "none");

        const insertedItems = await db
          .insert(todoItem)
          .values(
            todoItems.map((item) => ({
              id: crypto.randomUUID(),
              content: item.content,
              priority: item.priority,
              dueDate: item.dueDate ? new Date(item.dueDate) : null,
              processId,
              isApproved: null,
            })),
          )
          .returning();

        await db
          .update(processTable)
          .set({ status: "processed", updatedAt: new Date() })
          .where(eq(processTable.id, processId));

        // Track total processing time
        const totalDuration = Date.now() - startTime;
        span.setAttribute("ai.total_duration_ms", totalDuration);
        Sentry.setMeasurement("ai_total_processing_duration", totalDuration, "millisecond");

        return { todoItems: insertedItems };
      } catch (err) {
        console.error("Error processing text with AI:", err);
        
        // Capture AI generation errors in Sentry
        Sentry.captureException(err, {
          tags: { 
            process_id: processId, 
            error_type: "ai_generation_error",
            ai_provider: "gemini",
          },
          extra: { 
            text_length: text.length,
            duration_ms: Date.now() - startTime,
          },
        });
        
        await db
          .update(processTable)
          .set({
            status: "error",
            errorMessage: "AI processing failed",
            updatedAt: new Date(),
          })
          .where(eq(processTable.id, processId));
        return { error: "Failed to process text with AI" };
      }
    }
  );
}

export async function approveTodoItem(
  todoItemId: string,
  accessToken: string,
  processId: string,
) {
  return await Sentry.startSpan(
    {
      name: "task.approve",
      op: "task.action",
      attributes: {
        "task.action": "approve",
        "task.process_id": processId,
      },
    },
    async () => {
      try {
        const todo = await db.query.todoItem.findFirst({
          where: eq(todoItem.id, todoItemId),
        });

        if (!todo) {
          Sentry.captureMessage("Todo item not found for approval", {
            level: "warning",
            tags: { todo_item_id: todoItemId, process_id: processId },
          });
          return { error: "Todo item not found" };
        }

        const priorityMap = { p1: 4, p2: 3, p3: 2, p4: 1 };
        const priority =
          priorityMap[todo.priority as keyof typeof priorityMap] || 1;

        const dueDateStr = todo.dueDate
          ? todo.dueDate.toISOString().split("T")[0]
          : undefined;

        const result = await addTodoToTodoist(
          accessToken,
          todo.content,
          priority,
          dueDateStr,
        );

        if (result.error) {
          Sentry.captureMessage("Failed to add task to Todoist", {
            level: "error",
            tags: { todo_item_id: todoItemId, process_id: processId },
            extra: { error: result.error },
          });
          return { error: result.error };
        }

        await db
          .update(todoItem)
          .set({ isApproved: true })
          .where(eq(todoItem.id, todoItemId));

        // Track task approval
        Sentry.setTag("task_approved", "true");
        Sentry.setMeasurement("task_action", 1, "none");

        const pendingItems = await db.query.todoItem.findMany({
          where: and(
            eq(todoItem.processId, processId),
            isNull(todoItem.isApproved),
          ),
        });

        if (pendingItems.length === 0) {
          const rejectedItems = await db.query.todoItem.findMany({
            where: and(
              eq(todoItem.processId, processId),
              eq(todoItem.isApproved, false),
            ),
          });

          const finalStatus = rejectedItems.length === 0 ? "accepted" : "processed";
          
          await db
            .update(processTable)
            .set({
              status: finalStatus,
              updatedAt: new Date(),
            })
            .where(eq(processTable.id, processId));
          
          // Track completion metrics
          const allItems = await db.query.todoItem.findMany({
            where: eq(todoItem.processId, processId),
          });
          const approvedCount = allItems.filter(i => i.isApproved === true).length;
          const rejectedCount = allItems.filter(i => i.isApproved === false).length;
          
          Sentry.setMeasurement("tasks_approved", approvedCount, "none");
          Sentry.setMeasurement("tasks_rejected", rejectedCount, "none");
          Sentry.setMeasurement("task_acceptance_rate", approvedCount / allItems.length, "ratio");
        }

        return { success: true, task: result.task };
      } catch (err) {
        console.error("Error approving todo:", err);
        Sentry.captureException(err, {
          tags: { action: "approve", todo_item_id: todoItemId, process_id: processId },
        });
        return { error: "Failed to approve todo item" };
      }
    }
  );
}

export async function rejectTodoItem(todoItemId: string, processId: string) {
  return await Sentry.startSpan(
    {
      name: "task.reject",
      op: "task.action",
      attributes: {
        "task.action": "reject",
        "task.process_id": processId,
      },
    },
    async () => {
      try {
        await db
          .update(todoItem)
          .set({ isApproved: false })
          .where(eq(todoItem.id, todoItemId));

        // Track task rejection
        Sentry.setTag("task_rejected", "true");
        Sentry.setMeasurement("task_action", 0, "none");

        const pendingItems = await db.query.todoItem.findMany({
          where: and(
            eq(todoItem.processId, processId),
            isNull(todoItem.isApproved),
          ),
        });

        if (pendingItems.length === 0) {
          await db
            .update(processTable)
            .set({
              status: "processed",
              updatedAt: new Date(),
            })
            .where(eq(processTable.id, processId));
          
          // Track completion metrics
          const allItems = await db.query.todoItem.findMany({
            where: eq(todoItem.processId, processId),
          });
          const approvedCount = allItems.filter(i => i.isApproved === true).length;
          const rejectedCount = allItems.filter(i => i.isApproved === false).length;
          
          Sentry.setMeasurement("tasks_approved", approvedCount, "none");
          Sentry.setMeasurement("tasks_rejected", rejectedCount, "none");
          Sentry.setMeasurement("task_rejection_rate", rejectedCount / allItems.length, "ratio");
        }

        return { success: true };
      } catch (err) {
        console.error("Error rejecting todo:", err);
        Sentry.captureException(err, {
          tags: { action: "reject", todo_item_id: todoItemId, process_id: processId },
        });
        return { error: "Failed to reject todo item" };
      }
    }
  );
}

export async function approveAllTodoItems(
  processId: string,
  accessToken: string,
) {
  return await Sentry.startSpan(
    {
      name: "task.approve_all",
      op: "task.action",
      attributes: {
        "task.action": "approve_all",
        "task.process_id": processId,
      },
    },
    async () => {
      try {
        const pendingItems = await db.query.todoItem.findMany({
          where: and(
            eq(todoItem.processId, processId),
            isNull(todoItem.isApproved),
          ),
        });

        for (const item of pendingItems) {
          const priorityMap = { p1: 4, p2: 3, p3: 2, p4: 1 };
          const priority =
            priorityMap[item.priority as keyof typeof priorityMap] || 1;
          const dueDateStr = item.dueDate
            ? item.dueDate.toISOString().split("T")[0]
            : undefined;

          await addTodoToTodoist(accessToken, item.content, priority, dueDateStr);
        }

        await db
          .update(todoItem)
          .set({ isApproved: true })
          .where(
            and(eq(todoItem.processId, processId), isNull(todoItem.isApproved)),
          );

        await db
          .update(processTable)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(processTable.id, processId));

        // Track bulk approval metrics
        Sentry.setMeasurement("tasks_approved_bulk", pendingItems.length, "none");
        Sentry.setMeasurement("task_acceptance_rate", 1.0, "ratio");
        Sentry.setTag("task_approved_all", "true");

        return { success: true, count: pendingItems.length };
      } catch (err) {
        console.error("Error approving all todos:", err);
        Sentry.captureException(err, {
          tags: { action: "approve_all", process_id: processId },
        });
        return { error: "Failed to approve all todo items" };
      }
    }
  );
}

export async function getProcessWithTodoItems(processId: string) {
  try {
    const processRecord = await db.query.process.findFirst({
      where: eq(processTable.id, processId),
    });

    if (!processRecord) {
      return { error: "Process not found" };
    }

    const todoItems = await db.query.todoItem.findMany({
      where: eq(todoItem.processId, processId),
    });

    return { process: processRecord, todoItems };
  } catch (err) {
    console.error("Error fetching process:", err);
    return { error: "Failed to fetch process" };
  }
}
