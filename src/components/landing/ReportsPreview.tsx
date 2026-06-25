import React from "react";
import Link from "next/link";
import { ReportCard } from "../report/report-card";
import { Button } from "../ui/button";
import { Report } from "@/types/report";

export function ReportsPreview() {
  // Mock recent reports to showcase feed data
  const mockReports: Report[] = [
    {
      id: "report-1",
      title: "Phishing SMS pretending to be postal delivery service",
      description: "Received text message from +1 (555) 019-2834 claiming a package was on hold due to incorrect address information. Prompts to update address and pay a small redelivery fee on a clone site designed to steal bank card details.",
      category: "PHISHING",
      amountLost: 2.50,
      incidentDate: "2026-06-24T00:00:00.000Z",
      isAnonymous: true,
      status: "APPROVED",
      createdAt: "2026-06-24T12:00:00.000Z",
      userId: "user-1",
      entityId: "entity-1",
      evidence: [],
    },
    {
      id: "report-2",
      title: "Fake support administrator impersonating wallet agents",
      description: "User @crypto_scam_helper approached in Telegram group offering help with verification delays. Requested direct input of seed recovery phrases into a third-party website, resulting in total wallet draining.",
      category: "CRYPTO",
      amountLost: 4500.00,
      incidentDate: "2026-06-20T00:00:00.000Z",
      isAnonymous: false,
      status: "APPROVED",
      createdAt: "2026-06-21T08:30:00.000Z",
      userId: "user-2",
      entityId: "entity-2",
      evidence: [],
    },
  ];

  return (
    <section className="w-full py-20 bg-slate-950 border-t border-slate-900 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-3 text-left">
            <h2 className="text-3xl font-black tracking-tight text-slate-100">
              Recent Scam Alerts
            </h2>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              Approved scam incidents reported by our community and vetted by ProofMe moderation teams.
            </p>
          </div>
          
          <Link href="/report" className="shrink-0 w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto h-11 border-slate-800 hover:bg-slate-850">
              Report Scam Incident
            </Button>
          </Link>
        </div>

        {/* Reports Preview List */}
        <div className="space-y-6">
          {mockReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {/* View Details note */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-semibold">
            Real-time feed is updated as reports get reviewed and validated by our admins.
          </p>
        </div>
      </div>
    </section>
  );
}
