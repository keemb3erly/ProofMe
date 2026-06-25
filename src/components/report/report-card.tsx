import React from "react";
import { Card } from "../ui/card";
import { Report } from "@/types/report";
import { EvidenceGallery } from "./evidence-gallery";

interface ReportCardProps {
  report: Report;
  showEntityValue?: boolean;
  entityValue?: string;
  entityType?: string;
  className?: string;
}

export function ReportCard({
  report,
  showEntityValue = false,
  entityValue,
  entityType,
  className = "",
}: ReportCardProps) {
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className={`bg-slate-900/45 border-slate-800/85 hover:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">
              {report.category}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {formatDate(report.createdAt)}
            </span>
            {showEntityValue && entityValue && (
              <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                {entityType ? `${entityType}: ` : ""}{entityValue}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100 tracking-tight">
            {report.title}
          </h3>
        </div>
        
        {report.amountLost !== null && report.amountLost > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5 text-right shrink-0">
            <span className="block text-[10px] uppercase tracking-wider text-rose-400 font-bold">Amount Lost</span>
            <span className="text-sm font-extrabold text-rose-400">{formatCurrency(report.amountLost)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed mb-6 bg-slate-950/20 border border-slate-900/40 p-3.5 rounded-xl whitespace-pre-wrap">
        {report.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-col sm:flex-row gap-4 py-3 border-t border-slate-800/60 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
          </svg>
          <span>Incident Date: <strong className="text-slate-400">{formatDate(report.incidentDate)}</strong></span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>Reporter: <strong className="text-slate-400">{report.isAnonymous ? "Anonymous User" : "Verified Member"}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            report.status === "APPROVED"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : report.status === "PENDING"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}>
            {report.status}
          </span>
        </div>
      </div>

      {/* Evidence Attachments */}
      {report.evidence && report.evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/60">
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}
    </Card>
  );
}
