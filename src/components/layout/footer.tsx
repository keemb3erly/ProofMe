import React from "react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
            ProofMe
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            © {currentYear} All rights reserved.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-semibold">
          <Link href="/" className="hover:text-slate-300 transition">
            Home
          </Link>
          <Link href="/report" className="hover:text-slate-300 transition">
            Report Scam
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition"
          >
            GitHub
          </a>
          <span className="hover:text-slate-300 cursor-pointer transition">
            Privacy Policy
          </span>
          <span className="hover:text-slate-300 cursor-pointer transition">
            Terms of Service
          </span>
        </div>
      </div>
    </footer>
  );
}
