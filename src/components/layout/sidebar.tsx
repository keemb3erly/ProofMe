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
    <aside className={`w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm ${className}`}>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 group select-none ${
                isActive
                  ? "bg-primary/10 border border-primary/20 text-primary"
                  : "border border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon && (
                <span className={`transition duration-150 shrink-0 ${
                  isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
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
