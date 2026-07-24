"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/register.schema";
import type { z } from "zod";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.post("/auth/register", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2500);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (!error.response) {
        setSubmitError("Network error: Please check your internet connection and try again.");
      } else if (error.response.status === 409) {
        setSubmitError("Email already exists: An account with this email is already registered.");
      } else if (error.response.data && error.response.data.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError("An unexpected server error occurred. Please try again later.");
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
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Join the community in reporting scams and building trust.
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
            <span>Registration successful! A verification email has been sent. Redirecting to login...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {/* Full Name field */}
            <Input
              id="fullName"
              type="text"
              label="Full Name"
              disabled={isSubmitting || submitSuccess}
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            {/* Email field */}
            <Input
              id="email"
              type="email"
              label="Email Address"
              disabled={isSubmitting || submitSuccess}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password field */}
            <div className="space-y-2 relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
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

            {/* Confirm Password field */}
            <div className="space-y-2 relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
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

            {/* Terms Acceptance field */}
            <div className="pt-2">
              <Input
                id="acceptTerms"
                type="checkbox"
                disabled={isSubmitting || submitSuccess}
                label={
                  <span>
                    I accept the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                }
                error={errors.acceptTerms?.message}
                {...register("acceptTerms")}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={submitSuccess}
              className="w-full h-12 mt-6"
            >
              Sign Up
            </Button>
          </CardContent>
        </form>

        {/* Footer Link */}
        <CardFooter className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="font-semibold text-primary hover:text-primary-hover transition hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>

      </Card>
    </div>
  );
}
