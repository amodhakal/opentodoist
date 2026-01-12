import { index, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { process } from "./process";
import { relations } from "drizzle-orm";

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
    processId: text("process_id")
      .notNull()
      .references(() => process.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("todo_item_process_id_idx").on(table.processId),
    index("todo_item_is_approved_idx").on(table.isApproved),
  ],
);

export const todoItemRelations = relations(todoItem, ({ one }) => ({
  process: one(process, {
    fields: [todoItem.processId],
    references: [process.id],
  }),
}));
