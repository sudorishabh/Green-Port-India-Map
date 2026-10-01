import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Reuse one pool across dev hot reloads instead of opening new connections each time.
const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle({ client: pool });
