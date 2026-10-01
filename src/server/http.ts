import "server-only";
import type { NextRequest } from "next/server";
import type { z } from "zod";
import { AppError, getPostgresErrorCode } from "./errors";
import { createRateLimiter, type RateLimiter } from "./rate-limit";

type RouteHandler<Context> = (
  request: NextRequest,
  context: Context,
) => Promise<Response>;

interface ApiRouteOptions {
  /** Replaces the default limit of 250 requests per 10 minutes per IP. */
  rateLimiter?: RateLimiter;
}

const isProduction = process.env.NODE_ENV === "production";

const defaultRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 250,
});

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Largest value of a Postgres `serial` id. */
const MAX_ID = 2_147_483_647;

/**
 * Postgres errors caused by the request's data rather than a server fault,
 * keyed by SQLSTATE, so they reach the client as 4xx instead of a logged 500.
 */
const POSTGRES_CLIENT_ERRORS = new Map<
  string,
  [status: number, message: string]
>([
  ["23505", [409, "A record with these details already exists"]],
  ["23503", [404, "A referenced record does not exist"]],
  ["23502", [400, "A required field is missing"]],
  ["22001", [400, "A value is too long"]],
  ["22003", [400, "A number is out of range"]],
  ["22P02", [400, "A value has the wrong type"]],
]);

/**
 * Wraps a Route Handler with the API's cross-cutting concerns: per-IP rate
 * limiting, blocking cross-site writes and a consistent JSON error body
 * `{ success, message, errorCode }`.
 */
export function apiRoute<Context>(
  handler: RouteHandler<Context>,
  { rateLimiter = defaultRateLimiter }: ApiRouteOptions = {},
): RouteHandler<Context> {
  return async (request, context) => {
    const { allowed, retryAfterSeconds } = rateLimiter(getClientIp(request));
    if (!allowed) {
      // Limits differ per route, so the wait time goes in Retry-After.
      const response = toErrorResponse(
        new AppError(429, 429, "Too many requests, please try again later"),
      );
      response.headers.set("Retry-After", String(retryAfterSeconds));
      return response;
    }

    if (isCrossSiteWrite(request)) {
      return toErrorResponse(
        new AppError(403, 403, "Cross-site requests are not allowed"),
      );
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

/**
 * Parses the JSON request body with `schema`, dropping unknown fields.
 * Invalid data is rejected with `errorCode`, a 400 and the first problem found,
 * e.g. "lat: Too big: expected number to be <=90".
 */
export async function parseBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
  errorCode: number,
): Promise<z.output<Schema>> {
  const result = schema.safeParse(await readJson(request));
  if (result.success) return result.data;

  const [issue] = result.error.issues;
  const field = issue.path.join(".");
  throw new AppError(
    errorCode,
    400,
    field ? `${field}: ${issue.message}` : issue.message,
  );
}

/** Parses a positive integer id from a route or query param, or throws `errorCode` with a 400. */
export function parseId(
  value: string | null | undefined,
  errorCode: number,
): number {
  const id = Number(value);
  if (!value || !Number.isInteger(id) || id <= 0 || id > MAX_ID) {
    throw new AppError(errorCode, 400);
  }
  return id;
}

/**
 * Whether a state-changing request came from another site (including sibling
 * subdomains), per the browser's `Sec-Fetch-Site` header. Requests without the
 * header (curl, older browsers) still rely on the SameSite session cookies.
 */
function isCrossSiteWrite(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  return (
    !SAFE_METHODS.has(request.method) &&
    (site === "cross-site" || site === "same-site")
  );
}

function toErrorResponse(error: unknown): Response {
  const appError =
    toClientError(error) ?? new AppError(500, 500, "Internal Server Error");
  if (appError.status >= 500) console.error(error);

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

/** The error as a client-facing `AppError`, or undefined when it is a server fault. */
function toClientError(error: unknown): AppError | undefined {
  if (error instanceof AppError) return error;

  const code = getPostgresErrorCode(error);
  const mapped = code ? POSTGRES_CLIENT_ERRORS.get(code) : undefined;
  if (!mapped) return undefined;

  const [status, message] = mapped;
  return new AppError(status, status, message);
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
