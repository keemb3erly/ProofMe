"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/login.schema";
import type { z } from "zod";
import { api } from "@/lib/api";
import { saveSession, getRedirectPath } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { user } = response.data;

      // Save user session in localStorage via helper utility
      saveSession(user);
      setSubmitSuccess(true);

      setTimeout(() => {
        const dest = getRedirectPath(user);
        router.push(dest);
      }, 1000);
    } catch (error: any) {
      console.error("Login failure:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError("Failed to authenticate. Please check your credentials.");
      }
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden min-h-screen">
      {/* Main Glass Card */}
      <Card className="relative w-full max-w-md z-10">
        
        {/* Header / Logo */}
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 justify-center">
            <span className="text-2xl font-black text-primary tracking-tight">
              ProofMe
            </span>
          </Link>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Verify scammers and trust status securely.
          </CardDescription>
        </CardHeader>

        {/* Status Alerts */}
        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2 items-start animate-fadeIn">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex gap-2 items-start animate-fadeIn">
            <span className="text-base select-none mt-0.5">✓</span>
            <span>Login successful! Redirecting...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Email input field */}
            <Input
              id="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              disabled={isSubmitting || submitSuccess}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password input field */}
            <div className="space-y-2 relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete="current-password"
                disabled={isSubmitting || submitSuccess}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
                className="pr-11"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || submitSuccess}
                className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-500 select-none text-sm transition focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={submitSuccess}
              className="w-full h-12 mt-8"
            >
              Sign In
            </Button>
          </CardContent>
        </form>

        {/* Footer info */}
        <CardFooter className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link 
            href="/register" 
            className="font-semibold text-primary hover:text-primary-hover transition hover:underline"
          >
            Sign up
          </Link>
        </CardFooter>

      </Card>
    </div>
  );
}
