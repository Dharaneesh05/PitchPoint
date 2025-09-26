import { defineConfig } from "drizzle-kit";

const isDevelopment = process.env.NODE_ENV === 'development';

// SQLite configuration for development, PostgreSQL for production
export default defineConfig({
  out: "./migrations",
  schema: isDevelopment ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isDevelopment ? "sqlite" : "postgresql",
  dbCredentials: isDevelopment 
    ? { url: "./cricket.db" }
    : { url: process.env.DATABASE_URL || "" },
});
