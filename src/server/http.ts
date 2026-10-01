import "server-only";
import type { NextRequest } from "next/server";
import { AppError } from "./errors";
import { rateLimit } from "./rate-limit";

type RouteHandler<Context> = (
  request: NextRequest,
  context: Context,
) => Promise<Response>;

const isProduction = process.env.NODE_ENV === "production";

/**
 * Wraps a Route Handler with the API's cross-cutting concerns: per-IP rate
 * limiting and a consistent JSON error body `{ success, message, errorCode }`.
 */
export function apiRoute<Context>(
  handler: RouteHandler<Context>,
): RouteHandler<Context> {
  return async (request, context) => {
    const { allowed, retryAfterSeconds } = rateLimit(getClientIp(request));
    if (!allowed) {
      const response = toErrorResponse(
        new AppError(
          429,
          429,
          "Too many requests from this IP, please try again after 10 minutes",
        ),
      );
      response.headers.set("Retry-After", String(retryAfterSeconds));
      return response;
    }

    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

/** Parses the JSON request body, rejecting malformed JSON with a 400. */
export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError(400, 400, "Invalid JSON body");
  }
}

/** Parses a positive integer id from a route or query param, or throws `errorCode` with a 400. */
export function parseId(
  value: string | null | undefined,
  errorCode: number,
): number {
  const id = Number(value);
  if (!value || !Number.isInteger(id) || id <= 0) {
    throw new AppError(errorCode, 400);
  }
  return id;
}

function toErrorResponse(error: unknown): Response {
  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, 500, "Internal Server Error");
  if (appError !== error) console.error(error);

  const stack = error instanceof Error ? error.stack : undefined;
  return Response.json(
    {
      success: false,
      message: appError.message,
      errorCode: appError.errorCode,
      ...(!isProduction && { stack }),
    },
    { status: appError.status },
  );
}

/**
 * The last `X-Forwarded-For` entry: the address the proxy in front of the app
 * saw (Vercel and `next start` set the header when it is missing). Earlier
 * entries are sent by the client, so trusting them would let it dodge the rate
 * limit. Same as Express's `trust proxy: 1` in the old API.
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",").at(-1)?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
