import React from "react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RiskBadge } from "./risk-badge";
import { TrustScoreCircle } from "./trust-score-circle";
import { Entity } from "@/types/entity";

interface EntityCardProps {
  entity: Entity;
  className?: string;
}

export function EntityCard({ entity, className = "" }: EntityCardProps) {
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "PHONE":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.106-6.927-6.927l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        );
      case "BANK":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5M3 21h18M12 9v-3.75" />
          </svg>
        );
      case "USERNAME":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        );
      case "BUSINESS":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-18 0V10.5M2.64 21H1.5m1.14 0h3.06M3.375 21h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm10.125 0h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125h-4.875c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm-9-10.5v-3c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3m-15 0h15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        );
    }
  };

  return (
    <Card className={`bg-white border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`}>
      <div className="flex items-start gap-4 flex-1">
        <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
          {renderTypeIcon(entity.entityType)}
        </div>
        
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" className="uppercase text-[9px] font-bold tracking-wider px-2 py-0">
              {entity.entityType}
            </Badge>
            <RiskBadge level={entity.riskLevel} />
          </div>
          
          <h3 className="text-lg font-mono font-bold text-slate-900 truncate break-all">
            {entity.value}
          </h3>
          
          <span className="block text-xs text-slate-400 font-semibold">
            Flags: {entity.totalReports} verified scam reports
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0 shrink-0">
        <TrustScoreCircle score={entity.trustScore} size="sm" />
        
        <Link href={`/entity/${entity.id}`}>
          <Button variant="secondary" size="sm" className="h-10 px-4">
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}
