import {
  authErrorCodes,
  kpiErrorCodes,
  portErrorCodes,
} from "@/lib/error-codes";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";

/** User-facing messages for the API's `errorCode`s. */
export const errorMessages: Record<number, string> = {
  [authErrorCodes.INVALID_CREDENTIALS]: "Incorrect email or password",
  [authErrorCodes.USER_ALREADY_EXISTS]: "User already exists",
  [authErrorCodes.FAILED_TO_REGISTER_USER]: "Failed to register user",
  [authErrorCodes.TOKEN_EXPIRED]: "Token expired",
  [authErrorCodes.TOKEN_INVALID]: "Token invalid",
  [authErrorCodes.NO_REFRESH_TOKEN]: "No refresh token",
  [authErrorCodes.SESSION_EXPIRED]: "Session expired",
  [authErrorCodes.INVALID_REFRESH_TOKEN]: "Invalid refresh token",
  [authErrorCodes.PASSWORD_TOO_SHORT]: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,

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
  [kpiErrorCodes.INVALID_URL]: "Links must start with http:// or https://",
  [kpiErrorCodes.INVALID_INITIATIVE_DATA]: "Invalid initiative data",
};

/** Codes whose server message names the field that failed and why. */
const VALIDATION_ERROR_CODES = new Set<number>([
  portErrorCodes.INVALID_PORT_DATA,
  kpiErrorCodes.KPI_INVALID_DATA,
  kpiErrorCodes.INVALID_INITIATIVE_DATA,
]);

/** Shape of an RTK Query error whose body is the API's JSON error. */
export interface ApiError {
  /** The HTTP status, or a string such as "FETCH_ERROR" when there was no response. */
  status?: number | string;
  data?: { errorCode?: number; message?: string };
}

/**
 * Message to show for a failed API call: the known message for its
 * `errorCode`, with the server's detail added for validation errors, else the
 * server's own message for a client error, else `fallback`. Messages from 5xx
 * responses are never shown.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const { status, data } = (error as ApiError | undefined) ?? {};
  const errorCode = data?.errorCode;
  const knownMessage =
    errorCode === undefined ? undefined : errorMessages[errorCode];
  const serverMessage =
    typeof status === "number" && status < 500 ? data?.message : undefined;
  const isValidationError =
    errorCode !== undefined && VALIDATION_ERROR_CODES.has(errorCode);

  if (isValidationError && knownMessage && serverMessage) {
    return `${knownMessage} (${serverMessage})`;
  }
  return knownMessage || serverMessage || fallback;
}
