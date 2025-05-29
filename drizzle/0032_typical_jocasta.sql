ALTER TABLE "tags" RENAME TO "tabs";--> statement-breakpoint
ALTER TABLE "task_tags" RENAME TO "task_tabs";--> statement-breakpoint
ALTER TABLE "task_tabs" RENAME COLUMN "tag_id" TO "tab_id";--> statement-breakpoint
ALTER TABLE "task_tabs" DROP CONSTRAINT "task_tags_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "task_tabs" DROP CONSTRAINT "task_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "task_tabs" DROP CONSTRAINT "task_tags_task_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "tabs" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "task_tabs" ADD CONSTRAINT "task_tabs_task_id_tab_id_pk" PRIMARY KEY("task_id","tab_id");--> statement-breakpoint
ALTER TABLE "task_tabs" ADD CONSTRAINT "task_tabs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_tabs" ADD CONSTRAINT "task_tabs_tab_id_tabs_id_fk" FOREIGN KEY ("tab_id") REFERENCES "public"."tabs"("id") ON DELETE cascade ON UPDATE no action;