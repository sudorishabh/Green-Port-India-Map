import "server-only";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authErrorCodes } from "@/lib/error-codes";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import type { SessionUser } from "@/server/session";

const PASSWORD_SALT_ROUNDS = 10;

export interface Credentials {
  email: string;
  password: string;
}

/** Validates an `{ email, password }` request body. */
export function parseCredentials(body: Partial<Credentials>): Credentials {
  const { email, password } = body ?? {};
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw new AppError(authErrorCodes.INVALID_CREDENTIALS, 400);
  }
  return { email: normalizeEmail(email), password };
}

export async function registerUser({ email, password }: Credentials) {
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  const [created] = await db
    .insert(users)
    .values({ email, password: passwordHash })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!created) throw new AppError(authErrorCodes.USER_ALREADY_EXISTS, 400);
}

export async function authenticateUser({
  email,
  password,
}: Credentials): Promise<SessionUser> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) throw new AppError(authErrorCodes.USER_NOT_FOUND, 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(authErrorCodes.WRONG_PASSWORD, 401);
  }

  return { id: user.id, email: user.email };
}

export async function findUser(userId: number): Promise<SessionUser | undefined> {
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user;
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}
