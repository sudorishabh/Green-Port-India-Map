import "server-only";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { authErrorCodes } from "@/lib/error-codes";
import { AppError } from "./errors";

export interface SessionUser {
  id: number;
  email: string;
}

const ACCESS_TOKEN_COOKIE = "a";
const REFRESH_TOKEN_COOKIE = "r";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const REFRESH_TOKEN_TTL_SECONDS = 15 * 24 * 60 * 60; // 15 days

type TokenSecret = "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET";

/** Issues fresh access and refresh tokens as httpOnly cookies. */
export async function startSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    signToken(user, "ACCESS_TOKEN_SECRET", ACCESS_TOKEN_TTL_SECONDS),
    cookieOptions(ACCESS_TOKEN_TTL_SECONDS),
  );
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    signToken(user, "REFRESH_TOKEN_SECRET", REFRESH_TOKEN_TTL_SECONDS),
    cookieOptions(REFRESH_TOKEN_TTL_SECONDS),
  );
}

export async function endSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Returns the signed-in user from the access token, or throws
 * `UNAUTHENTICATED` so clients know to refresh the session and retry.
 */
export async function requireUser(): Promise<SessionUser> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    throw new AppError(
      authErrorCodes.UNAUTHENTICATED,
      401,
      "No access token found",
    );
  }

  const user = verifyToken(token, "ACCESS_TOKEN_SECRET");
  if (!user) {
    throw new AppError(authErrorCodes.UNAUTHENTICATED, 401, "Session expired");
  }
  return user;
}

/** Returns the user encoded in the refresh token cookie. */
export async function getRefreshTokenUser(): Promise<SessionUser> {
  const token = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!token) throw new AppError(authErrorCodes.NO_REFRESH_TOKEN, 401);

  const user = verifyToken(token, "REFRESH_TOKEN_SECRET");
  if (!user) throw new AppError(authErrorCodes.SESSION_EXPIRED, 401);
  return user;
}

function signToken(
  { id, email }: SessionUser,
  secretName: TokenSecret,
  expiresInSeconds: number,
) {
  return jwt.sign({ id, email }, getSecret(secretName), {
    expiresIn: expiresInSeconds,
  });
}

function verifyToken(
  token: string,
  secretName: TokenSecret,
): SessionUser | null {
  const secret = getSecret(secretName);
  try {
    const payload = jwt.verify(token, secret);
    if (
      typeof payload === "object" &&
      typeof payload.id === "number" &&
      typeof payload.email === "string"
    ) {
      return { id: payload.id, email: payload.email };
    }
  } catch {
    // Expired, malformed or wrongly signed token.
  }
  return null;
}

function getSecret(name: TokenSecret): string {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`Required environment variable ${name} is missing`);
  }
  return secret;
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  } as const;
}
