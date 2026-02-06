import {z} from 'zod';
import 'dotenv/config';

const envSchema = z.object({
    NODE_ENV: z.enum(["dev", "test", "prod"]).default("dev"),

    BOT_TOKEN: z.string().min(1),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive().default(3306),
    DB_NAME: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASS: z.string().min(1),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
 

    DB_LOG_SQL: z.coerce.boolean().default(false),
})

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

