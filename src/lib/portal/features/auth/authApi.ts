import { api } from "../api";
import { setUser, type User } from "./authSlice";

interface Credentials {
  email: string;
  password: string;
}

interface SessionResponse {
  success: boolean;
  user: User;
}

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<{ success: boolean }, Credentials>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    loginUser: builder.mutation<SessionResponse, Credentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),

      async onQueryStarted(_credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data.user));
        } catch {
          // The calling component surfaces login errors.
        }
      },
    }),
    refreshToken: builder.query<SessionResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "GET",
      }),
    }),
    // A mutation, not a query: logging out must hit the server every time
    // rather than reuse a cached response.
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginUserMutation,
  useRefreshTokenQuery,
  useLogoutMutation,
} = authApi;
