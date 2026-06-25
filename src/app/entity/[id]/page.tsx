"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge, TrustScoreBadge, RiskLevelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Modal } from "@/components/ui/modal";

interface Evidence {
  id: string;
  fileUrl: string;
  reportId: string;
  createdAt: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  amountLost: number | null;
  incidentDate: string | null;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  userId: string;
  entityId: string;
  evidence: Evidence[];
}

interface Entity {
  id: string;
  value: string;
  entityType: "PHONE" | "BANK" | "USERNAME" | "BUSINESS" | string;
  trustScore: number;
  totalReports: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
  createdAt: string;
  reports: Report[];
}

export default function EntityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeEvidenceUrl, setActiveEvidenceUrl] = useState<string | null>(null);

  const fetchEntity = async () => {
    setIsLoading(true);
    setErrorStatus(null);
    try {
      const response = await api.get(`/entities/${id}`);
      setEntity(response.data);
    } catch (error: any) {
      console.error("Error fetching entity details:", error);
      if (error.response && error.response.status) {
        setErrorStatus(error.response.status);
      } else {
        setErrorStatus(505); // Use a custom status code for connection error
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEntity();
    }
  }, [id]);

  const handleCopy = () => {
    if (!entity) return;
    navigator.clipboard.writeText(entity.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render type icons
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "PHONE":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.106-6.927-6.927l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        );
      case "BANK":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5M3 21h18M12 9v-3.75" />
          </svg>
        );
      case "USERNAME":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        );
      case "BUSINESS":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-18 0V10.5M2.64 21H1.5m1.14 0h3.06M3.375 21h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm10.125 0h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125h-4.875c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm-9-10.5v-3c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3m-15 0h15" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        );
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

  // 1. Loading View
  if (isLoading) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-950 min-h-screen text-slate-100 px-4">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Spinner size="lg" />
          <p className="text-slate-400 text-sm animate-pulse">Fetching verification details...</p>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found View
  if (errorStatus === 404) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-950 min-h-screen text-slate-100 px-4 py-12">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Card className="relative w-full max-w-lg z-10 bg-slate-900/60 border-slate-800/80 backdrop-blur-xl p-8 text-center shadow-2xl">
          <CardHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 text-3xl mb-4 select-none">
              ⚠️
            </div>
            <CardTitle className="text-2xl font-bold text-slate-100">Profile Not Found</CardTitle>
            <CardDescription className="text-slate-400 text-base max-w-sm mx-auto mt-2">
              We couldn't find a registered scam entity with this ID. It has either been removed or does not exist yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <p className="text-sm text-slate-400">
              If you have recently fallen victim to a scam or want to warn others about this entity, you can file a report.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button variant="primary" className="w-full sm:w-auto px-6 h-11" onClick={() => router.push("/report")}>
              File a Report
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto px-6 h-11" onClick={() => router.push("/")}>
              Back to Search
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. 500 / General Error View
  if (errorStatus || !entity) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-950 min-h-screen text-slate-100 px-4 py-12">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <Card className="relative w-full max-w-lg z-10 bg-slate-900/60 border-slate-800/80 backdrop-blur-xl p-8 text-center shadow-2xl">
          <CardHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 text-3xl mb-4 select-none">
              ❌
            </div>
            <CardTitle className="text-2xl font-bold text-slate-100">Failed to Load Profile</CardTitle>
            <CardDescription className="text-slate-400 text-base max-w-sm mx-auto mt-2">
              An error occurred while loading this entity profile. Please check your internet connection and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button variant="primary" className="w-full sm:w-auto px-6 h-11" onClick={fetchEntity}>
              Try Again
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto px-6 h-11" onClick={() => router.push("/")}>
              Back to Search
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate circular stroke offset
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (entity.trustScore / 100) * circumference;

  // Determine trust level text and color
  let scoreColorClass = "stroke-emerald-500 text-emerald-400";
  let scoreBgColorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let scoreText = "High Trust / Safe";
  if (entity.trustScore < 50) {
    scoreColorClass = "stroke-rose-500 text-rose-400";
    scoreBgColorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    scoreText = "Highly Suspicious";
  } else if (entity.trustScore < 80) {
    scoreColorClass = "stroke-amber-500 text-amber-400";
    scoreBgColorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    scoreText = "Caution Required";
  }

  return (
    <div className="relative flex flex-col flex-1 bg-slate-950 min-h-screen text-slate-100 overflow-x-hidden font-sans">
      {/* Background glow meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Navigation & Header Section */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-4 z-10 flex-1 flex flex-col">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-slate-300 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-400">Entities</span>
          <span>/</span>
          <span className="text-slate-300">Profile</span>
        </div>

        {/* Entity Banner Card */}
        <Card className="bg-slate-900/40 border-slate-800/80 shadow-xl backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Entity Icon Container */}
              <div className="w-12 h-12 bg-slate-800 border border-slate-700/60 text-slate-300 rounded-xl flex items-center justify-center shrink-0">
                {renderTypeIcon(entity.entityType)}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" className="uppercase text-[10px] tracking-wider py-0.5 px-2 font-bold bg-slate-800/80 border-slate-700 text-slate-300">
                    {entity.entityType}
                  </Badge>
                  <RiskLevelBadge level={entity.riskLevel} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-slate-50 break-all">
                    {entity.value}
                  </h1>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer select-none focus:outline-none"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <span className="text-xs font-sans text-emerald-400 px-1 font-semibold">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.674a2.25 2.25 0 0 0-1.883-2.54A1.125 1.125 0 0 1 15.75 1.5h1.5a1.125 1.125 0 0 1 1.125 1.125 2.25 2.25 0 0 0 2.25 2.25h.375c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V18a2.25 2.25 0 0 0-2.25-2.25h-.375c-.621 0-1.125-.504-1.125-1.125V5.25c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V9m11.9-3.674c.245.83.943 1.488 1.83 1.636a2.25 2.25 0 0 0 2.54-1.883M18.75 3.375V1.5M16.5 5.625H18" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Registered: {formatDate(entity.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0">
              <Button variant="secondary" size="md" className="h-10 text-xs sm:text-sm" onClick={() => router.push("/")}>
                Search Another
              </Button>
              <Button variant="primary" size="md" className="h-10 text-xs sm:text-sm" onClick={() => router.push(`/report?value=${encodeURIComponent(entity.value)}&type=${entity.entityType}`)}>
                File New Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Left Column: Diagnostics Card */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-2xl backdrop-blur-xl">
              <CardHeader className="pb-2 border-b border-slate-800/60">
                <CardTitle className="text-lg font-bold text-slate-100">Trust Diagnostics</CardTitle>
                <CardDescription className="text-xs text-slate-500">Real-time safety assessment</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Visual Gauge Container */}
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-28 h-28">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                      {/* Track Circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="stroke-slate-800/70"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      {/* Meter Circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className={`transition-all duration-1000 ease-out ${scoreColorClass}`}
                        strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    {/* Absolute Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-50 tracking-tight">
                        {entity.trustScore}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Score</span>
                    </div>
                  </div>
                  
                  {/* Verdict badge */}
                  <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold border ${scoreBgColorClass}`}>
                    {scoreText}
                  </div>
                </div>

                {/* Score Diagnostics Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60 text-center">
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900">
                    <span className="block text-xs font-medium text-slate-500 mb-1">Risk Status</span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${entity.riskLevel === "HIGH" ? "text-rose-400" : entity.riskLevel === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>
                      {entity.riskLevel}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900">
                    <span className="block text-xs font-medium text-slate-500 mb-1">Total Reports</span>
                    <span className="text-sm font-bold text-slate-200">
                      {entity.totalReports}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Verified Scams Incidents Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Verified Scam Reports ({entity.reports.length})
              </h2>
              <span className="text-xs text-slate-400 font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                Approved Incidents Only
              </span>
            </div>

            {entity.reports.length === 0 ? (
              <Card className="bg-slate-900/40 border-slate-800/80 p-8 text-center text-slate-400 shadow-xl backdrop-blur-md">
                <div className="w-12 h-12 rounded-full border border-slate-800/80 flex items-center justify-center text-slate-500 text-lg mx-auto mb-3 select-none">
                  ✓
                </div>
                <h3 className="font-bold text-slate-200 mb-1">Clean Record</h3>
                <p className="text-sm max-w-sm mx-auto">
                  There are currently no verified approved scam reports filed against this entity.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {entity.reports.map((report) => (
                  <Card key={report.id} className="bg-slate-900/45 border-slate-800/85 hover:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
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

                    {/* Additional Metadata */}
                    <div className="flex flex-col sm:flex-row gap-4 py-3 border-t border-slate-800/60 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {/* Incident Date icon */}
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                        <span>Incident Date: <strong className="text-slate-400">{formatDate(report.incidentDate)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Reporter details */}
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span>Reporter: <strong className="text-slate-400">{report.isAnonymous ? "Anonymous User" : "Verified Member"}</strong></span>
                      </div>
                    </div>

                    {/* Evidence Attachment Section */}
                    {report.evidence.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800/60">
                        <span className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                          Evidence Attachments ({report.evidence.length})
                        </span>
                        
                        <div className="flex flex-wrap gap-2">
                          {report.evidence.map((item) => {
                            // Check if image
                            const isImage = item.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || item.fileUrl.startsWith("http"); // Cloudinary urls or local mock
                            
                            return (
                              <div
                                key={item.id}
                                className="group relative w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-pointer shadow transition hover:border-slate-600"
                                onClick={() => setActiveEvidenceUrl(item.fileUrl)}
                              >
                                {isImage ? (
                                  /* Thumbnail */
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.fileUrl}
                                    alt="Evidence Thumbnail"
                                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  /* File Placeholder */
                                  <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-500">
                                    <svg className="w-5 h-5 text-slate-400 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                    </svg>
                                    <span>FILE</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity select-none">
                                  Zoom
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Modal for Evidence Preview */}
      <Modal
        isOpen={activeEvidenceUrl !== null}
        onClose={() => setActiveEvidenceUrl(null)}
        title="Evidence Preview"
        className="max-w-2xl"
      >
        {activeEvidenceUrl && (
          <div className="flex flex-col items-center justify-center">
            {activeEvidenceUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || activeEvidenceUrl.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeEvidenceUrl}
                alt="Evidence Full View"
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain border border-slate-800 shadow"
              />
            ) : (
              <div className="text-center p-8 bg-slate-950/60 rounded-xl border border-slate-800/80 w-full max-w-sm">
                <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <h4 className="font-bold text-slate-200 mb-1">Non-previewable File</h4>
                <p className="text-xs text-slate-400 mb-4">This evidence file is not a supported image format for inline previews.</p>
                <a
                  href={activeEvidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 font-semibold text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition duration-200"
                >
                  Download / Open File
                </a>
              </div>
            )}
            <div className="mt-4 flex gap-3 w-full justify-end">
              <a
                href={activeEvidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
              >
                Open in new tab
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
