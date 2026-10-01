import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
dotenv.config();

let pool: Pool | null = null;

export function getConnectionPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process?.env?.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export const db = drizzle(getConnectionPool());

// Function to test database connection
export async function testConnection() {
  try {
    const connection = await getConnectionPool().connect();
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
