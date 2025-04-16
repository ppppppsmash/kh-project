CREATE TABLE "member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"position" varchar(255) NOT NULL,
	"hobby" varchar(255) NOT NULL,
	"skills" varchar(255) NOT NULL,
	"free_text" varchar(255),
	"photo_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
