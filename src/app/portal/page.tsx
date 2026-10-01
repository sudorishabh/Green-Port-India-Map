"use client";

import { portalRoutes } from "@/lib/portal/routes";
import { RootState } from "@/lib/portal/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function PortalHome() {
  const router = useRouter();
  const { isRefreshing, isLoggedIn } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!isRefreshing) {
      router.replace(isLoggedIn ? portalRoutes.ports : portalRoutes.signIn);
    }
  }, [isRefreshing, isLoggedIn, router]);

  // Show loading state while determining where to redirect
  return (
    <div className='flex items-center justify-center min-h-screen'>
      Loading...
    </div>
  );
}
