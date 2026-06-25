"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function Sidebar({ items, className = "" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-full md:w-64 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl ${className}`}>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 group select-none ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-400"
                  : "border border-transparent text-slate-400 hover:bg-slate-850 hover:text-slate-200"
              }`}
            >
              {item.icon && (
                <span className={`transition duration-150 shrink-0 ${
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
                }`}>
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
