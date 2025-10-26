import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
const connectionString = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_DB_URL (or legacy DATABASE_URL) must be set. Did you forget to provision a Supabase database?",
  );
}

const sslDisabled = process.env.SUPABASE_DB_SSL === "false";

export const pool = new Pool({
  connectionString,
  ssl: sslDisabled ? undefined : { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
