/**
 * Creates a portal account with a generated password, printed once. Use it to
 * add the first user to a fresh database; after that, signed-in users can add
 * accounts from the portal's Users page.
 *
 * Run with `npm run db:create-user -- someone@example.com`.
 */
// @next/env is bundled CommonJS, so Node can't import its exports by name.
import nextEnv from "@next/env";
import { randomBytes } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword, normalizeEmail } from "../credentials.ts";
import { users } from "./schema.ts";

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  const email = normalizeEmail(process.argv[2] ?? "");
  if (!email) throw new Error("Usage: npm run db:create-user -- <email>");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const password = randomBytes(18).toString("base64url");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const [created] = await drizzle({ client: pool })
      .insert(users)
      .values({ email, password: await hashPassword(password) })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    if (!created) throw new Error(`A user with email ${email} already exists`);
    console.log(`Created ${email}. Password (shown only once): ${password}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
