"use client";
import { LogOut } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/lib/portal/features/auth/authApi";
import { setLogout } from "@/lib/portal/features/auth/authSlice";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { portalRoutes } from "@/lib/portal/routes";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { PortalNav } from "./nav";

const Header = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setLogout());
      router.push(portalRoutes.home);
      toast.success("Logout Successful!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Logout failed. Please try again."));
    }
  };

  return (
    <header className='sticky top-0 z-30 border-b bg-white'>
      <div className='flex h-14 items-center justify-between gap-3 px-4 sm:px-6'>
        <h1 className='truncate text-base font-semibold sm:text-xl'>
          Sustainable Roadmap Portal
        </h1>
        <Button
          className='shrink-0 border-sky-700 border bg-white text-sky-700 hover:bg-sky-700 hover:text-white cursor-pointer'
          onClick={handleLogout}
          disabled={isLoading}
          aria-label='Logout'>
          <span className='hidden sm:inline'>Logout</span>
          <LogOut />
        </Button>
      </div>
      {/* Below large screens the section links sit here instead of a sidebar. */}
      <div className='lg:hidden'>
        <PortalNav variant='tabs' />
      </div>
    </header>
  );
};

export default Header;
