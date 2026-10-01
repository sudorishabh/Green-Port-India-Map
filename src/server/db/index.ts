import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Reuse one pool across dev hot reloads instead of opening new connections each time.
const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool };

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  // An idle client can lose its connection (e.g. the database restarts). Without a
  // listener the pool emits that as an unhandled "error" event and crashes the process.
  pool.on("error", (error) => {
    console.error("Idle Postgres client error", error);
  });

  return pool;
}

const pool = globalForDb.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle({ client: pool });
