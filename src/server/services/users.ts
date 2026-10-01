import "server-only";
import { eq } from "drizzle-orm";
import { authErrorCodes } from "@/lib/error-codes";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import {
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from "@/server/credentials";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import type { SessionUser } from "@/server/session";

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

/** Creates an account. Only new passwords are length-checked, so existing users can still sign in. */
export async function registerUser({ email, password }: Credentials) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(authErrorCodes.PASSWORD_TOO_SHORT, 400);
  }

  const [created] = await db
    .insert(users)
    .values({ email, password: await hashPassword(password) })
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

  const isPasswordValid = await verifyPassword(password, user.password);
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
