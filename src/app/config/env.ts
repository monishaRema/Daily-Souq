import "dotenv/config";
import { z } from "zod";


const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),
  FRONTEND_URL: z.string().min(1, "Frontend Url is required")
});



const parsedEnv = envSchema.safeParse(process.env);



if (!parsedEnv.success) {
 
  const formatted = z.flattenError(parsedEnv.error);

  console.error("Invalid environment variables:");

  console.error(formatted.fieldErrors);
  console.error(formatted.formErrors);

  throw new Error("Invalid environment variables");
}


export const config = parsedEnv.data;


