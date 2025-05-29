import { pgTable, uuid, primaryKey } from "drizzle-orm/pg-core";
import { tasks } from "../tasks";
import { tabs } from "../tabs";

export const taskTabs = pgTable("task_tabs", {
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  tabId: uuid("tab_id")
    .notNull()
    .references(() => tabs.id, { onDelete: "cascade" }),
}, (table) => ({
  // 複合主キー
  pk: primaryKey(table.taskId, table.tabId),
}));
