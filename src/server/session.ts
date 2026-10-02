import "server-only";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { authErrorCodes } from "@/lib/error-codes";
import { findUser, revokeSessions } from "@/server/services/users";
import { AppError } from "./errors";

export interface SessionUser {
  id: number;
  email: string;
}

/** A user plus the session version their tokens must carry to stay valid. */
export interface SessionOwner extends SessionUser {
  sessionVersion: number;
}

const ACCESS_TOKEN_COOKIE = "a";
const REFRESH_TOKEN_COOKIE = "r";
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const REFRESH_TOKEN_TTL_SECONDS = 15 * 24 * 60 * 60; // 15 days

type TokenSecret = "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET";

/** Issues fresh access and refresh tokens as httpOnly cookies and returns the user. */
export async function startSession(owner: SessionOwner): Promise<SessionUser> {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    signToken(owner, "ACCESS_TOKEN_SECRET", ACCESS_TOKEN_TTL_SECONDS),
    cookieOptions(ACCESS_TOKEN_TTL_SECONDS),
  );
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    signToken(owner, "REFRESH_TOKEN_SECRET", REFRESH_TOKEN_TTL_SECONDS),
    cookieOptions(REFRESH_TOKEN_TTL_SECONDS),
  );
  return { id: owner.id, email: owner.email };
}

/**
 * Clears this browser's cookies and signs the user out on every device by
 * revoking all their sessions. Cookies go first so they are cleared even if
 * the database update fails.
 */
export async function endSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  const claims = refreshToken
    ? verifyToken(refreshToken, "REFRESH_TOKEN_SECRET")
    : null;
  if (claims) await revokeSessions(claims.id, claims.sessionVersion);
}

/**
 * Returns the signed-in user, or throws `UNAUTHENTICATED` so clients know to
 * refresh the session and retry. Checked against the database, so deleted
 * accounts and revoked sessions are refused straight away.
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

  const claims = verifyToken(token, "ACCESS_TOKEN_SECRET");
  const owner = claims && (await findCurrentOwner(claims));
  if (!owner) {
    throw new AppError(authErrorCodes.UNAUTHENTICATED, 401, "Session expired");
  }
  return { id: owner.id, email: owner.email };
}

/** Swaps a valid refresh token for new session cookies and returns the user. */
export async function refreshSession(): Promise<SessionUser> {
  const token = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!token) throw new AppError(authErrorCodes.NO_REFRESH_TOKEN, 401);

  const claims = verifyToken(token, "REFRESH_TOKEN_SECRET");
  const owner = claims && (await findCurrentOwner(claims));
  if (!owner) throw new AppError(authErrorCodes.SESSION_EXPIRED, 401);
  return startSession(owner);
}

/** The token's user, unless their account is gone or their sessions were revoked. */
async function findCurrentOwner(claims: SessionOwner) {
  const owner = await findUser(claims.id);
  return owner?.sessionVersion === claims.sessionVersion ? owner : undefined;
}

function signToken(
  { id, email, sessionVersion }: SessionOwner,
  secretName: TokenSecret,
  expiresInSeconds: number,
) {
  return jwt.sign({ id, email, sessionVersion }, getSecret(secretName), {
    expiresIn: expiresInSeconds,
  });
}

/** Tokens issued before session versions existed fail this check, so those users sign in again. */
function verifyToken(
  token: string,
  secretName: TokenSecret,
): SessionOwner | null {
  const secret = getSecret(secretName);
  try {
    const payload = jwt.verify(token, secret);
    if (
      typeof payload === "object" &&
      typeof payload.id === "number" &&
      typeof payload.email === "string" &&
      typeof payload.sessionVersion === "number"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        sessionVersion: payload.sessionVersion,
      };
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
