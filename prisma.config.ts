import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: "./apps/web/.env.local" });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
