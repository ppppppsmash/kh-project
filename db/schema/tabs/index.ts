import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const tabs = pgTable("tabs", {
	id: uuid("id").primaryKey().$defaultFn(uuidv7),
	name: varchar("name", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date()),
});
