ALTER TABLE "tasks" ADD COLUMN "task_id" varchar(255) NOT NULL DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "category" varchar(255) NOT NULL;