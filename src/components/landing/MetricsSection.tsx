import React from "react";
import { StatCard } from "../shared/stat-card";

export function MetricsSection() {
  const metrics = [
    {
      title: "Total Verifications",
      value: "148,902",
      trend: { value: "14.2%", label: "increase vs last month", positive: true },
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
        </svg>
      ),
    },
    {
      title: "Verified Scam Profiles",
      value: "3,892",
      trend: { value: "3.4%", label: "risk reports verified", positive: false },
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      title: "Prevented Loss Claims",
      value: "$1,489,000",
      trend: { value: "18.6%", label: "loss prevention value", positive: true },
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full py-16 bg-slate-950 border-t border-slate-900 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-slate-100">
            ProofMe Active Counter-fraud Stats
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Real-time telemetry showing how community contributions protect thousands of daily web payments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m) => (
            <StatCard
              key={m.title}
              title={m.title}
              value={m.value}
              trend={m.trend}
              icon={m.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
