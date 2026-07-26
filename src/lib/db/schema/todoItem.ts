import { index, pgTable, text, timestamp, boolean, customType } from "drizzle-orm/pg-core";
import { process } from "./process";
import { relations } from "drizzle-orm";

export const vector = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string | number[]): number[] {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  },
});

export const todoItem = pgTable(
  "todo_item",
  {
    id: text("id").primaryKey(),
    content: text("content").notNull(),
    priority: text("priority", {
      enum: ["p1", "p2", "p3", "p4"],
    }).default("p4"),
    dueDate: timestamp("due_date"),
    isApproved: boolean("is_approved"),
    embedding: vector("embedding"),
    isDuplicate: boolean("is_duplicate").default(false),
    processId: text("process_id")
      .notNull()
      .references(() => process.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("todo_item_process_id_idx").on(table.processId),
    index("todo_item_is_approved_idx").on(table.isApproved),
    index("todo_item_is_duplicate_idx").on(table.isDuplicate),
  ],
);

export const todoItemRelations = relations(todoItem, ({ one }) => ({
  process: one(process, {
    fields: [todoItem.processId],
    references: [process.id],
  }),
}));
