ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "members" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "position" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "hobby" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "free_text" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "photo_url" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "join_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "leave_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "edited_at" timestamp with time zone DEFAULT now();