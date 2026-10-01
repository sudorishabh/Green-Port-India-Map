import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  email: string;
}

interface AuthState {
  user: User;
  isLoggedIn: boolean;
  isRefreshing: boolean;
}

const initialState: AuthState = {
  user: {
    id: 0,
    email: "",
  },
  isLoggedIn: false,
  isRefreshing: true,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<User>) => {
      state.user = {
        id: payload.id,
        email: payload.email,
      };
      state.isLoggedIn = !!payload.id && !!payload.email;
    },
    setLogout: (state) => {
      state.user = initialState.user;
      state.isLoggedIn = false;
    },
    setIsRefreshing: (state, { payload }: PayloadAction<boolean>) => {
      state.isRefreshing = payload;
    },
  },
});

export const { setUser, setLogout, setIsRefreshing } = authSlice.actions;

export default authSlice.reducer;
