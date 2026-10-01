import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { authErrorCodes } from "@/lib/error-codes";
import { setUser, setLogout, type User } from "./auth/authSlice";

// Same-origin Route Handlers (src/app/api): session cookies are sent automatically.
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Refreshes the session once and retries when the access token has expired. */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const errorCode = (result.error?.data as { errorCode?: number } | undefined)
    ?.errorCode;
  if (errorCode === authErrorCodes.UNAUTHENTICATED) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "GET" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      api.dispatch(setUser((refreshResult.data as { user: User }).user));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(setLogout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Ports", "Kpis", "GreenInitiatives"],
  endpoints: () => ({}),
});
