import {
  authErrorCodes,
  kpiErrorCodes,
  portErrorCodes,
  s3ErrorCodes,
} from "@/lib/error-codes";

/** User-facing messages for the API's `errorCode`s. */
export const errorMessages: Record<number, string> = {
  [authErrorCodes.INVALID_CREDENTIALS]: "Invalid credentials",
  [authErrorCodes.USER_ALREADY_EXISTS]: "User already exists",
  [authErrorCodes.FAILED_TO_REGISTER_USER]: "Failed to register user",
  [authErrorCodes.TOKEN_EXPIRED]: "Token expired",
  [authErrorCodes.TOKEN_INVALID]: "Token invalid",
  [authErrorCodes.USER_NOT_FOUND]: "User not found",
  [authErrorCodes.WRONG_PASSWORD]: "Wrong password",
  [authErrorCodes.NO_REFRESH_TOKEN]: "No refresh token",
  [authErrorCodes.SESSION_EXPIRED]: "Session expired",
  [authErrorCodes.INVALID_REFRESH_TOKEN]: "Invalid refresh token",

  [portErrorCodes.INVALID_PORT_ID]: "Invalid port ID",
  [portErrorCodes.INVALID_PORT_DATA]: "Invalid port data",
  [portErrorCodes.PORT_ALREADY_EXISTS]: "Port already exists",

  [kpiErrorCodes.INVALID_KPI_ID]: "Invalid KPI ID",
  [kpiErrorCodes.INVALID_PORT_ID]: "Invalid port ID",
  [kpiErrorCodes.KPI_ALREADY_EXISTS]: "KPI already exists",
  [kpiErrorCodes.KPI_INVALID_DATA]: "Invalid KPI data",
  [kpiErrorCodes.KPI_FAILED_TO_CREATE]: "Failed to create KPI",
  [kpiErrorCodes.KPI_FAILED_TO_UPDATE]: "Failed to update KPI",
  [kpiErrorCodes.INVALID_INITIATIVE_ID]: "Invalid initiative ID",

  [s3ErrorCodes.INVALID_FILE_NAME]: "Invalid file name",
};

/** Shape of an RTK Query error whose body is the API's JSON error. */
export interface ApiError {
  data?: { errorCode?: number; message?: string };
}

/** Message to show for a failed API call, or `fallback` for unknown errors. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const errorCode = (error as ApiError | undefined)?.data?.errorCode;
  return (errorCode !== undefined && errorMessages[errorCode]) || fallback;
}
