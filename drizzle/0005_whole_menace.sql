CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL,
	"assignee" varchar(255) NOT NULL,
	"due_date" timestamp NOT NULL,
	"progress" varchar(255) NOT NULL,
	"progress_details" varchar(255) NOT NULL,
	"link" varchar(255) NOT NULL,
	"notes" varchar(255) NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
