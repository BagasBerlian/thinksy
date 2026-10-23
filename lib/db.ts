import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || "aws-0-ap-southeast-1.pooler.supabase.com",
      port: Number(process.env.DB_PORT === "6543" ? "5432" : process.env.DB_PORT || 5432),
      database: process.env.DB_DATABASE || "postgres",
      user: process.env.DB_USERNAME || "postgres.mtpnbviztquitgszrfel",
      password: process.env.DB_PASSWORD || "programermudaindonesia",
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}
