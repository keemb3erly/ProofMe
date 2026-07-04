import React from "react";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export function Badge({ className = "", children, variant = "neutral" }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
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
