import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function CTASection() {
  return (
    <section className="relative w-full py-16 bg-slate-950 border-t border-slate-900 flex flex-col items-center overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl px-4 z-10">
        <Card className="bg-gradient-to-r from-slate-900/60 to-slate-950/60 border-slate-800/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle design borders inside */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-50 leading-tight">
              Ready to secure your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                digital payments?
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">
              Register now to submit verified scam profiles, track dynamic trust scores, and access developers credentials for API integrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 items-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto h-12 px-6 font-semibold">
                  Get Started For Free
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto h-12 px-6 font-semibold border-slate-800 hover:bg-slate-850">
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
