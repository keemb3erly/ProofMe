import React from "react";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export function Badge({ className = "", children, variant = "neutral" }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function TrustScoreBadge({ score, className = "" }: { score: number; className?: string }) {
  let variant: "success" | "warning" | "danger" = "success";
  if (score < 50) {
    variant = "danger";
  } else if (score < 80) {
    variant = "warning";
  }

  return (
    <Badge variant={variant} className={className}>
      Trust Score: {score}/100
    </Badge>
  );
}

export function RiskLevelBadge({ level, className = "" }: { level: "LOW" | "MEDIUM" | "HIGH" | string; className?: string }) {
  let variant: "success" | "warning" | "danger" = "success";
  if (level === "HIGH") {
    variant = "danger";
  } else if (level === "MEDIUM") {
    variant = "warning";
  }

  return (
    <Badge variant={variant} className={`uppercase ${className}`}>
      {level} Risk
    </Badge>
  );
}
