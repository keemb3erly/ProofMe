import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface RecommendationCardProps {
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
  value: string;
  type: string;
  className?: string;
}

export function RecommendationCard({
  score,
  riskLevel,
  value,
  type,
  className = "",
}: RecommendationCardProps) {
  let cardBorderClass = "border-emerald-500/25 bg-emerald-500/[0.02]";
  let iconBgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let titleClass = "text-emerald-400";
  let actionTitle = "Verify Clear / Low Risk";
  let description = `This ${type.toLowerCase()} (${value}) has no confirmed malicious reports filed against it. It is currently categorized as low risk. However, always verify independently before transacting.`;
  let icon = "✓";

  if (score < 50 || riskLevel === "HIGH") {
    cardBorderClass = "border-rose-500/30 bg-rose-500/[0.02]";
    iconBgClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    titleClass = "text-rose-400";
    actionTitle = "DO NOT TRUST / CRITICAL RISK";
    description = `Warning! This ${type.toLowerCase()} is flagged as highly suspicious due to a low trust score (${score}/100) and verified scam reports. We strongly advise against sending funds or sharing credentials.`;
    icon = "⚠️";
  } else if (score < 80 || riskLevel === "MEDIUM") {
    cardBorderClass = "border-amber-500/25 bg-amber-500/[0.02]";
    iconBgClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    titleClass = "text-amber-400";
    actionTitle = "PROCEED WITH EXTREME CAUTION";
    description = `Caution! This ${type.toLowerCase()} has active warnings or pending incident reports. It exhibits intermediate risk traits. Confirm identities and double-check credentials before processing transactions.`;
    icon = "⚡";
  }

  return (
    <Card className={`border ${cardBorderClass} ${className}`}>
      <div className="flex gap-4 items-start">
        {/* Visual Badge Icon */}
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-lg select-none shrink-0 ${iconBgClass}`}>
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className={`text-xs font-black uppercase tracking-wider ${titleClass}`}>
            {actionTitle}
          </h4>
          <CardTitle className="text-base font-bold text-slate-100">
            Recommended Action
          </CardTitle>
          <p className="text-sm text-slate-400 leading-relaxed pt-1.5">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
