"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Report } from "@/types/report";
import { EvidenceGallery } from "../report/evidence-gallery";

interface AdminReportCardProps {
  report: Report;
  entityValue: string;
  entityType: string;
  onApprove: (reportId: string) => Promise<void> | void;
  onReject: (reportId: string) => Promise<void> | void;
  className?: string;
}

export function AdminReportCard({
  report,
  entityValue,
  entityType,
  onApprove,
  onReject,
  className = "",
}: AdminReportCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(report.id);
    } catch (err) {
      console.error("Failed to approve report:", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject(report.id);
    } catch (err) {
      console.error("Failed to reject report:", err);
    } finally {
      setIsRejecting(false);
    }
  };

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

  const isDisabled = isApproving || isRejecting;

  return (
    <Card className={`bg-slate-900/40 border-slate-800/80 p-6 flex flex-col gap-6 shadow-xl ${className}`}>
      {/* Target scam entity header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 border border-slate-900 p-4 rounded-xl">
        <div className="space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Flagged Scam Entity
          </span>
          <span className="text-sm font-mono font-bold text-slate-200 break-all">
            {entityValue}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-wide">
            {entityType}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Status: {report.status}
          </span>
        </div>
      </div>

      {/* Report details */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase font-bold tracking-wider mb-1">
              {report.category}
            </span>
            <h3 className="text-base font-bold text-slate-100">{report.title}</h3>
          </div>
          {report.amountLost !== null && report.amountLost > 0 && (
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-wider text-rose-400 font-bold">Loss Claimed</span>
              <span className="text-sm font-extrabold text-rose-400">{formatCurrency(report.amountLost)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-400 leading-relaxed bg-slate-950/20 border border-slate-900/30 p-3.5 rounded-xl whitespace-pre-wrap">
          {report.description}
        </p>

        {/* Date / User info */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
          <span>Incident Date: <strong className="text-slate-400">{formatDate(report.incidentDate)}</strong></span>
          <span>Submitted: <strong className="text-slate-400">{formatDate(report.createdAt)}</strong></span>
          <span>By: <strong className="text-slate-400">{report.isAnonymous ? "Anonymous User" : `User ID: ${report.userId}`}</strong></span>
        </div>
      </div>

      {/* Evidence Attachments */}
      {report.evidence && report.evidence.length > 0 && (
        <div className="border-t border-slate-850 pt-4">
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}

      {/* Moderator Action Buttons */}
      <div className="flex gap-3 justify-end border-t border-slate-850 pt-4 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReject}
          isLoading={isRejecting}
          disabled={isDisabled}
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 px-4 cursor-pointer"
        >
          Reject Report
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleApprove}
          isLoading={isApproving}
          disabled={isDisabled}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/15 h-10 px-5 cursor-pointer"
        >
          Approve Report
        </Button>
      </div>
    </Card>
  );
}
