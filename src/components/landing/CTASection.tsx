import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function CTASection() {
  return (
    <section className="w-full py-16 bg-slate-50 border-t border-slate-200 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4">
        <Card className="p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Ready to secure your{" "}
              <span className="text-primary">
                digital payments?
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
              Register now to submit verified scam profiles, track dynamic trust scores, and access developers credentials for API integrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 items-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto h-12 px-6 font-semibold">
                  Get Started For Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto h-12 px-6 font-semibold border-slate-200 hover:bg-slate-100">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
