import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition duration-200 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25",
    secondary: "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20",
    ghost: "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}
