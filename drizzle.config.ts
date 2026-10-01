import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env files the same way Next.js does, so drizzle-kit sees DATABASE_URL.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
