CREATE TABLE "club_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"leader" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"member_count" integer NOT NULL,
	"activity_type" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"detail" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" varchar(255) NOT NULL;