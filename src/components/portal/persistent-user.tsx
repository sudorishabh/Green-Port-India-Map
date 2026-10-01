"use client";
import { useRefreshTokenQuery } from "@/lib/portal/features/auth/authApi";
import {
  setIsRefreshing,
  setUser,
} from "@/lib/portal/features/auth/authSlice";
import { RootState } from "@/lib/portal/store";
import { Loader2 } from "lucide-react";
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  children: React.ReactNode;
}

/** Restores the session from the refresh-token cookie before rendering the portal. */
const PersistentUser: FC<Props> = ({ children }) => {
  const { isRefreshing } = useSelector((state: RootState) => state.auth);
  const { data, isSuccess, isLoading } = useRefreshTokenQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data.user));
    }
  }, [data, isSuccess, dispatch]);

  useEffect(() => {
    dispatch(setIsRefreshing(isLoading));
  }, [isLoading, dispatch]);

  if (isLoading || isRefreshing) {
    return (
      <Loader2 className='mx-auto mt-40 text-gray-500 animate-spin size-8' />
    );
  }
  return children;
};

export default PersistentUser;
