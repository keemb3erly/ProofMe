import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "approve" | "reject";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  className = "",
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-40 disabled:cursor-not-allowed";

  const sizes: Record<string, string> = {
    sm: "px-3.5 py-2 text-xs h-9",
    md: "px-5 py-2.5 text-sm h-11",
    lg: "px-6 py-3 text-base h-12",
  };

  const variants: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-900",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    approve: "bg-secondary text-white hover:bg-secondary-hover shadow-sm",
    reject: "bg-rose-600 hover:bg-rose-700 text-white",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
