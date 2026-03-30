import "dotenv/config";
import { boolean, z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH is required"),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_EXPIRES_IN_REFRESH_TOKEN: z.string().default("7d"),
  JWT_EXPIRES_IN_ACCESS_TOKEN: z.string().default("1h"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
  FRONTEND_URL: z.string().min(1, "Frontend Url is required"),
  isProduction: z.boolean().optional().default(false),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formatted = z.flattenError(parsedEnv.error);

  console.error("Invalid environment variables:");

  console.error(formatted.fieldErrors);
  console.error(formatted.formErrors);

  throw new Error("Invalid environment variables");
}

const env = parsedEnv.data;
env.isProduction = env.NODE_ENV === "production";

export const config = env;
