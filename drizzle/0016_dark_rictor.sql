ALTER TABLE "club_activity" ALTER COLUMN "member_count" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "club_activity" ALTER COLUMN "member_count" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "join_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "leave_date";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "edited_at";