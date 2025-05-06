CREATE TABLE "qa" (
	"id" uuid PRIMARY KEY NOT NULL,
	"question" varchar(255) NOT NULL,
	"answer" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "started_at" timestamp NOT NULL;