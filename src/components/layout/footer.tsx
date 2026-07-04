import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-primary tracking-tight">
            ProofMe
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition">
            Home
          </Link>
          <Link href="/report" className="hover:text-slate-700 transition">
            Report Scam
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-700 transition"
          >
            GitHub
          </a>
          <a href="#" className="hover:text-slate-700 transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-700 transition">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
