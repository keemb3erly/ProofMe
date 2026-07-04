import React from "react";
import { Card } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <Card className={`bg-white border-slate-200 shadow-sm hover:border-slate-300 transition duration-300 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="block text-2xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
        </div>
        {icon && (
          <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 pt-3.5 border-t border-slate-200 flex items-center gap-2 flex-wrap">
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded ${
                trend.positive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}
            </span>
          )}
          <span className="text-xs text-slate-400 font-medium">
            {trend ? trend.label : description}
          </span>
        </div>
      )}
    </Card>
  );
}
