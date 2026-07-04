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

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted.replace("NGN", "₦").replace("NGN\u00A0", "₦");
  };

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
    <Card className={`bg-white border-slate-200 p-6 flex flex-col gap-6 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
        <div className="space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Flagged Scam Entity
          </span>
          <span className="text-sm font-mono font-bold text-slate-900 break-all">
            {entityValue}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wide">
            {entityType}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Status: {report.status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div>
            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[9px] uppercase font-bold tracking-wider mb-1">
              {report.category}
            </span>
            <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
          </div>
          {report.amountLost !== null && report.amountLost > 0 && (
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-wider text-rose-700 font-bold">Loss Claimed</span>
              <span className="text-sm font-extrabold text-rose-700">{formatCurrency(report.amountLost)}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-xl whitespace-pre-wrap">
          {report.description}
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
          <span>Incident Date: <strong className="text-slate-500">{formatDate(report.incidentDate)}</strong></span>
          <span>Submitted: <strong className="text-slate-500">{formatDate(report.createdAt)}</strong></span>
          <span>By: <strong className="text-slate-500">{report.isAnonymous ? "Anonymous User" : `User ID: ${report.userId}`}</strong></span>
        </div>
      </div>

      {report.evidence && report.evidence.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}

      <div className="flex gap-3 justify-end border-t border-slate-200 pt-4 mt-2">
        <Button
          variant="reject"
          size="sm"
          onClick={handleReject}
          isLoading={isRejecting}
          disabled={isDisabled}
          className="h-10 px-4"
        >
          Reject Report
        </Button>
        <Button
          variant="approve"
          size="sm"
          onClick={handleApprove}
          isLoading={isApproving}
          disabled={isDisabled}
          className="h-10 px-5"
        >
          Approve Report
        </Button>
      </div>
    </Card>
  );
}
