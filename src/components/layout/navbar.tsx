"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { readSession, clearSession } from "@/lib/auth";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(readSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black text-primary tracking-tight">
            ProofMe
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
          <Link
            href="/"
            className={`hover:text-slate-900 transition ${
              isActive("/") ? "text-slate-900" : ""
            }`}
          >
            Verify Search
          </Link>
          <Link
            href="/report"
            className={`hover:text-slate-900 transition ${
              isActive("/report") ? "text-slate-900" : ""
            }`}
          >
            Report Scam
          </Link>
          {user && user.role === "ADMIN" && (
            <Link
              href="/admin/dashboard"
              className={`hover:text-slate-900 transition ${
                isActive("/admin/dashboard") ? "text-slate-900" : ""
              }`}
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Signed in as <strong className="text-slate-900 font-semibold">{user.fullName}</strong>
              </span>
              {user.role === "ADMIN" && (
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-9 px-3">
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9 px-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="h-9 px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4 shadow-xl">
          <div className="flex flex-col gap-3 font-semibold text-slate-500 text-sm">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-1.5 hover:text-slate-900 transition ${
                isActive("/") ? "text-slate-900" : ""
              }`}
            >
              Verify Search
            </Link>
            <Link
              href="/report"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-1.5 hover:text-slate-900 transition ${
                isActive("/report") ? "text-slate-900" : ""
              }`}
            >
              Report Scam
            </Link>
            {user && user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1.5 hover:text-slate-900 transition ${
                  isActive("/admin/dashboard") ? "text-slate-900" : ""
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-medium">
                  Signed in as <strong className="text-slate-900 font-semibold">{user.fullName}</strong>
                  {user.role === "ADMIN" && (
                    <span className="ml-2 text-[9px] bg-primary/10 text-primary border border-primary/25 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full h-10">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="ghost" size="sm" className="w-full h-10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button variant="primary" size="sm" className="w-full h-10">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
