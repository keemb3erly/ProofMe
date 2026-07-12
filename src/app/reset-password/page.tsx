"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/schemas/reset-password.schema";
import type { z } from "zod";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

interface ErrorResponse {
  error?: string;
  message?: string;
}

function getResetPasswordErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    return "An unexpected server error occurred. Please try again later.";
  }

  if (!error.response) {
    return "Network error: Please check your connection and try again.";
  }

  return (
    error.response.data?.error ||
    error.response.data?.message ||
    "An unexpected server error occurred. Please try again later."
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(
    token ? null : "Invalid or missing reset token. Please request a new password reset link."
  );
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFields) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.post("/auth/reset-password", {
        password: data.password,
        confirmPassword: data.confirmPassword,
        token,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      setSubmitError(getResetPasswordErrorMessage(error));
    }
  };

  const isTokenValid = !!token;

  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden min-h-screen">
      <Card className="relative w-full max-w-md z-10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 justify-center">
            <span className="text-2xl font-black text-primary tracking-tight">
              ProofMe
            </span>
          </Link>
          <CardTitle>Set new password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>

        {submitError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2 items-start animate-fadeIn">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex gap-2 items-start animate-fadeIn">
            <span className="text-base select-none mt-0.5">✓</span>
            <span>Password reset successful! Redirecting to login...</span>
          </div>
        )}

        {isTokenValid && !submitSuccess && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-2 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  label="New Password"
                  autoComplete="new-password"
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

              <div className="space-y-2 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  autoComplete="new-password"
                  disabled={isSubmitting || submitSuccess}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  className="pr-11"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting || submitSuccess}
                  className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-500 select-none text-sm transition focus:outline-none"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={submitSuccess}
                className="w-full h-12 mt-6"
              >
                Reset Password
              </Button>
            </CardContent>
          </form>
        )}

        {(!isTokenValid || submitSuccess) && (
          <CardFooter>
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary-hover transition hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
