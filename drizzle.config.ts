import type { Config } from "drizzle-kit";

const config: Config = {
    dialect: "postgresql",
    schema: "./db/schema/",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
};

export default config;
