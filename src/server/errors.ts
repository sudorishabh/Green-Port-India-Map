import "server-only";

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
