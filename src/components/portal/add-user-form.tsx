"use client";

import React, { useState } from "react";
import { useRegisterMutation } from "@/lib/portal/features/auth/authApi";
import { getApiErrorMessage } from "@/lib/portal/api-errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/** Creates a portal account for a teammate. Only signed-in users can add accounts. */
export default function AddUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [register, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      await register({ email, password }).unwrap();
      toast.success(`Account created for ${email}`);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to add user. Please try again."),
      );
    }
  };

  return (
    <Card className='max-w-md'>
      <CardHeader>
        <CardTitle>Add user</CardTitle>
        <CardDescription>
          The new user can sign in, manage ports and KPIs, and add users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email address</Label>
            <Input
              id='email'
              type='email'
              autoComplete='off'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              autoComplete='new-password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirm-password'>Confirm password</Label>
            <Input
              id='confirm-password'
              type='password'
              autoComplete='new-password'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type='submit'
            disabled={isLoading}
            className='w-full bg-sky-600 hover:bg-sky-700'>
            {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : "Add user"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
