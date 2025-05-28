import { pgTable, varchar, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().$defaultFn(uuidv7),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // 複数登録防止
  nameIdx: uniqueIndex("categories_name_idx").on(table.name),
}));
