"use client";
import { useLoginUserMutation } from "@/lib/portal/features/auth/authApi";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { portalRoutes } from "@/lib/portal/routes";
import { toast } from "sonner";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [login, { isLoading }] = useLoginUserMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await login({ email, password }).unwrap();
      toast.success("Login successful. Redirecting to home page...");
      router.push(portalRoutes.ports);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <div className='flex flex-col gap-16 min-h-screen items-center justify-center bg-gray-100'>
      {/* <h1 className='mb-4 text-center underline text-4xl font-medium text-sky-700'>
        Sustainable Roadmap Portal
      </h1> */}
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        <h2 className='mb-6 text-center text-2xl font-bold text-gray-900'>
          Sign In
        </h2>
        <form
          onSubmit={handleSubmit}
          className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <div className='mt-1'>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <div className='mt-1'>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm'
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='flex w-full justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2'>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                "Sign in"
              )}
            </button>
          </div>
          <div className='text-sm text-center'>
            <Link
              href={portalRoutes.signUp}
              className='font-medium text-sky-600 hover:text-sky-500'>
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
