import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

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
  (table) => [index("process_user_id_idx").on(table.userId)],
);

export const processRelations = relations(process, ({ one }) => ({
  user: one(user, {
    fields: [process.userId],
    references: [user.id],
  }),
}));
