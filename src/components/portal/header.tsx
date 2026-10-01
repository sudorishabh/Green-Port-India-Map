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
    <header className=' w-full top-0 z-30 h-14 border-b bg-white px-4 flex items-center justify-between'>
      <h1 className='text-xl font-semibold'>Sustainable Roadmap Portal</h1>
      <div className='flex items-center gap-4'>
        <Button
          className='border-sky-700 border bg-white text-sky-700 hover:bg-sky-700 hover:text-white cursor-pointer'
          onClick={handleLogout}
          disabled={isLoading}>
          Logout <LogOut />
        </Button>
      </div>
    </header>
  );
};

export default Header;
