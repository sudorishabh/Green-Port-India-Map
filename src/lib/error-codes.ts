// Error codes returned by the API as `errorCode`. Shared by the server and its clients.

export const authErrorCodes = {
  INVALID_CREDENTIALS: 4001,
  USER_ALREADY_EXISTS: 4002,
  FAILED_TO_REGISTER_USER: 4003,
  TOKEN_EXPIRED: 4004,
  TOKEN_INVALID: 4005,
  NO_REFRESH_TOKEN: 4008,
  SESSION_EXPIRED: 4009,
  INVALID_REFRESH_TOKEN: 4010,
  PASSWORD_TOO_SHORT: 4011,
  /** Access token missing or expired: clients should refresh the session and retry. */
  UNAUTHENTICATED: 10001,
} as const;

export const portErrorCodes = {
  INVALID_PORT_ID: 5001,
  INVALID_PORT_DATA: 5002,
  PORT_ALREADY_EXISTS: 5003,
} as const;

export const kpiErrorCodes = {
  INVALID_KPI_ID: 3001,
  INVALID_PORT_ID: 3002,
  KPI_ALREADY_EXISTS: 3003,
  KPI_INVALID_DATA: 3004,
  KPI_FAILED_TO_CREATE: 3005,
  KPI_FAILED_TO_UPDATE: 3006,
  INVALID_INITIATIVE_ID: 3007,
  /** A target or initiative link that isn't an http(s) URL. */
  INVALID_URL: 3008,
  INVALID_INITIATIVE_DATA: 3009,
} as const;
