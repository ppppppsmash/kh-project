CREATE TABLE "user_activity" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
