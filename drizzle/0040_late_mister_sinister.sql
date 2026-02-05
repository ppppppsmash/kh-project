CREATE TABLE "survey_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"survey_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" varchar(50) NOT NULL,
	"options" text,
	"is_required" boolean DEFAULT false,
	"order" varchar(10) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"theme" varchar(50) DEFAULT 'default',
	"is_public" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "survey_items" ADD CONSTRAINT "survey_items_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;