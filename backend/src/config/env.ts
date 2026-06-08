import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ override: true });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(24, "JWT_SECRET must be at least 24 characters"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash-lite"),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_ORIGIN: z.string().min(1).default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);
