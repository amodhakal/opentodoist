import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
import { todoItem } from "./todoItem";

export const process = pgTable(
  "process",
  {
    id: text("id").primaryKey(),
    status: text("status", {
      enum: [
        "incomplete", // Process just created
        "processing", // Processing
        "processed", //  Processed, waiting for review
        "accepted", // Accepted by user
        "error", // An error occured
      ],
    }).default("incomplete"),
    content: text("content").notNull(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("process_user_id_idx").on(table.userId),
    index("process_created_at_idx").on(table.createdAt),
    index("process_status_idx").on(table.status),
  ],
);

export const processRelations = relations(process, ({ one, many }) => ({
  user: one(user, {
    fields: [process.userId],
    references: [user.id],
  }),
  todoItems: many(todoItem),
}));
