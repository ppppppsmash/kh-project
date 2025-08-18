ALTER TABLE "user_activity" ADD COLUMN "resource_type" varchar(50);--> statement-breakpoint
ALTER TABLE "user_activity" ADD COLUMN "resource_id" varchar(255);--> statement-breakpoint
ALTER TABLE "user_activity" ADD COLUMN "resource_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user_activity" ADD COLUMN "resource_details" text;