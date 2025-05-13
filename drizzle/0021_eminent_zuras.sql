ALTER TABLE "users" ALTER COLUMN "skills" SET DATA TYPE varchar(255)[];--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "skills" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills_message" varchar(255) DEFAULT '';

-- ALTER TABLE "users"
-- ALTER COLUMN "skills"
-- SET DATA TYPE varchar(255)[]
-- USING string_to_array(skills, ',');

-- ALTER TABLE "users"
-- ALTER COLUMN "skills"
-- SET DEFAULT ARRAY[]::varchar(255)[];

-- ALTER TABLE "users"
-- ADD COLUMN "skills_message" varchar(255) DEFAULT '';