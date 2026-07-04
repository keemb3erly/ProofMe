import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

export function FeaturesSection() {
  const features = [
    {
      title: "Dynamic Trust Index",
      description: "Calculates interactive trust rating scores (0-100) dynamically styled to highlight warning indices on fraud entities.",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      title: "Moderator Approved",
      description: "Avoid false reports. Every submitted incident is reviewed by dedicated moderators against attached scam proofs before approval.",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21a3.745 3.745 0 0 1-3.068-1.593 3.746 3.746 0 0 1-3.296-1.043 3.746 3.746 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      ),
    },
    {
      title: "Instant API Integration",
      description: "Developer-first API keys allow companies to check entity records programmatically at checkout to block automated fraud.",
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full py-20 bg-slate-50 border-t border-slate-200 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Engineered For Transaction Safety
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            ProofMe offers community-backed warning diagnostics designed to protect your wallet and business operations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat) => (
            <Card
              key={feat.title}
              className="hover:border-slate-300 transition duration-300 hover:-translate-y-1"
            >
              <CardHeader className="p-0 mb-4">
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mb-4 shrink-0">
                  {feat.icon}
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  {feat.title}
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-sm text-slate-500 leading-relaxed pt-1.5 p-0">
                {feat.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
