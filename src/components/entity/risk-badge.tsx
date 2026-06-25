import React from "react";
import { Badge } from "../ui/badge";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | string;
  className?: string;
}

export function RiskBadge({ level, className = "" }: RiskBadgeProps) {
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
