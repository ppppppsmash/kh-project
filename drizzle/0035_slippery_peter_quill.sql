ALTER TABLE "tasks" ALTER COLUMN "progress_details" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "notes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "notes" DROP NOT NULL;