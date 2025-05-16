ALTER TABLE "tasks" DROP CONSTRAINT "tasks_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "tag_id";