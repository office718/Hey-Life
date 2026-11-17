import pg from "pg";
import { cfg } from "./config.ts";

export const pool = new pg.Pool({ connectionString: cfg.databaseUrl, max: 10 });

export async function q<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool.query(text, params as any[]);
  return r.rows as T[];
}
export async function one<T = any>(text: string, params: unknown[] = []): Promise<T | undefined> {
  return (await q<T>(text, params))[0];
}
