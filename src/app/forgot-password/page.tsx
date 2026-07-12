"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/schemas/forgot-password.schema";
import type { z } from "zod";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

interface ErrorResponse {
  error?: string;
  message?: string;
}

function getForgotPasswordErrorMessage(error: unknown): string {
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

export default function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });

      setSubmitSuccess(true);
    } catch (error: unknown) {
      setSubmitError(getForgotPasswordErrorMessage(error));
    }
  };

  return (
    <div className="relative flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden min-h-screen">
      <Card className="relative w-full max-w-md z-10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 justify-center">
            <span className="text-2xl font-black text-primary tracking-tight">
              ProofMe
            </span>
          </Link>
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link.
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
            <span>
              If an account with that email exists, a password reset link has been sent.
            </span>
          </div>
        )}

        {!submitSuccess && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <Input
                id="email"
                type="email"
                label="Email Address"
                autoComplete="email"
                disabled={isSubmitting}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-12 mt-8"
              >
                Send Reset Link
              </Button>
            </CardContent>
          </form>
        )}

        <CardFooter>
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-hover transition hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
