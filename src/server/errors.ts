import "server-only";
import { DrizzleQueryError } from "drizzle-orm";

/** SQLSTATE of a unique constraint violation. */
export const UNIQUE_VIOLATION = "23505";

/** An expected, client-facing API error with an HTTP status and an `errorCode`. */
export class AppError extends Error {
  readonly errorCode: number;
  readonly status: number;

  constructor(
    errorCode: number,
    status: number,
    message = "An unexpected error occurred",
  ) {
    super(message);
    this.name = "AppError";
    this.errorCode = errorCode;
    this.status = status;
  }
}

/** The SQLSTATE of a failed query; Drizzle wraps the driver's error in `cause`. */
export function getPostgresErrorCode(error: unknown): string | undefined {
  const cause = error instanceof DrizzleQueryError ? error.cause : error;
  const code = (cause as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}
