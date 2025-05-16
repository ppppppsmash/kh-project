ALTER TABLE "tabs" RENAME TO "tags";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "tab_id" TO "tag_id";--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_tab_id_tabs_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;