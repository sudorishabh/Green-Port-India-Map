"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/portal/store";
import { portalRoutes } from "@/lib/portal/routes";
import { useEffect } from "react";

import { Loader2 } from "lucide-react";
import Link from "next/link";

/** Renders children for signed-in users and sends everyone else to sign-in. */
const Protected = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isRefreshing } = useSelector(
    (state: RootState) => state.auth
  );

  const router = useRouter();

  useEffect(() => {
    if (!isRefreshing && !isLoggedIn) {
      router.replace(portalRoutes.signIn);
    }
  }, [isLoggedIn, isRefreshing, router]);

  if (isRefreshing) {
    return (
      <Loader2 className='mx-auto mt-40 text-gray-500 animate-spin size-8' />
    );
  }

  return isLoggedIn ? (
    children
  ) : (
    <Link href={portalRoutes.signIn}>Please sign in to access this page</Link>
  );
};

export default Protected;
