"use client";

import React, { useState } from "react";
import { useRegisterMutation } from "@/lib/portal/features/auth/authApi";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { portalRoutes } from "@/lib/portal/routes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      await register({ email, password }).unwrap();
      toast.success("Registration successful. Please sign in.");
      router.push(portalRoutes.signIn);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Registration failed. Please try again."),
      );
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-md'>
        <h2 className='mb-6 text-center text-2xl font-bold text-gray-900'>
          Register
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
                autoComplete='new-password' // Changed autocomplete
                required
                placeholder='Enter your password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm'
              />
            </div>
          </div>

          {/* Added Confirm Password Field */}
          <div>
            <label
              htmlFor='confirm-password'
              className='block text-sm font-medium text-gray-700'>
              Confirm Password
            </label>
            <div className='mt-1'>
              <input
                id='confirm-password'
                name='confirm-password'
                type='password'
                autoComplete='new-password' // Changed autocomplete
                required
                placeholder='Confirm your password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                "Register"
              )}
            </button>
          </div>
          {/* Optional: Add a link to the sign-in page */}
          <div className='text-sm text-center'>
            <Link
              href={portalRoutes.signIn}
              className='font-medium text-sky-600 hover:text-sky-500'>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
