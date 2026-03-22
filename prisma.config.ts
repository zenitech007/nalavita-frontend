import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations in Supabase MUST use the direct connection (usually port 5432)
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});