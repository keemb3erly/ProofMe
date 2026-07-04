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

  // Helper to translate entity type to human readable format
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case "PHONE":
        return "Phone Number";
      case "BUSINESS":
        return "Business";
      case "BANK":
        return "Bank Account";
      case "USERNAME":
        return "Username";
      default:
        return type;
    }
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
    const formatted = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted.replace("NGN", "₦").replace("NGN\u00A0", "₦");
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

  // Helper to calculate first report date
  const getFirstReportDate = () => {
    if (!entity || !entity.reports || entity.reports.length === 0) return "N/A";
    const dates = entity.reports
      .map((r) => (r.createdAt ? new Date(r.createdAt).getTime() : null))
      .filter((d): d is number => d !== null);
    if (dates.length === 0) return "N/A";
    const oldestTime = Math.min(...dates);
    return new Date(oldestTime).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to calculate AI Insights
  const getMostCommonCategory = () => {
    if (!entity || !entity.reports || entity.reports.length === 0) return "None";
    const counts: Record<string, number> = {};
    entity.reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    let maxCount = 0;
    let maxCategory = "None";
    Object.entries(counts).forEach(([cat, val]) => {
      if (val > maxCount) {
        maxCount = val;
        maxCategory = cat;
      }
    });
    return maxCategory;
  };

  const getAverageAmountLost = () => {
    if (!entity || !entity.reports || entity.reports.length === 0) return 0;
    const amounts = entity.reports
      .map((r) => r.amountLost)
      .filter((a): a is number => a !== null && a > 0);
    if (amounts.length === 0) return 0;
    const sum = amounts.reduce((a, b) => a + b, 0);
    return sum / amounts.length;
  };

  const getActivityLevel = () => {
    if (!entity || !entity.reports) return "Clean";
    const count = entity.reports.length;
    if (count === 0) return "Clean / No Activity";
    if (count <= 2) return "Low Activity";
    if (count <= 5) return "Moderate Activity";
    return "High Activity";
  };

  // 1. Loading View
  if (isLoading) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-50 min-h-screen text-slate-900 px-4">
        <div className="flex flex-col items-center gap-4 z-10">
          <Spinner size="lg" />
          <p className="text-slate-500 text-sm animate-pulse">Fetching verification details...</p>
        </div>
      </div>
    );
  }

  // 2. 404 Not Found View
  if (errorStatus === 404) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-50 min-h-screen text-slate-900 px-4 py-12">
        <Card className="relative w-full max-w-lg z-10 bg-white border-slate-200 p-8 text-center">
          <CardHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-700 text-3xl mb-4 select-none">
              ⚠️
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Profile Not Found</CardTitle>
            <CardDescription className="text-slate-500 text-base max-w-sm mx-auto mt-2">
              We couldn't find a registered scam entity with this ID. It has either been removed or does not exist yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-4 space-y-4">
            <p className="text-sm text-slate-500">
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
      <div className="relative flex flex-col flex-1 items-center justify-center bg-slate-50 min-h-screen text-slate-900 px-4 py-12">
        <Card className="relative w-full max-w-lg z-10 bg-white border-slate-200 p-8 text-center">
          <CardHeader className="flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center text-rose-700 text-3xl mb-4 select-none">
              ❌
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Failed to Load Profile</CardTitle>
            <CardDescription className="text-slate-500 text-base max-w-sm mx-auto mt-2">
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
  let scoreColorClass = "stroke-emerald-600 text-emerald-700";
  let scoreBgColorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let scoreText = "High Trust / Safe";
  if (entity.trustScore < 50) {
    scoreColorClass = "stroke-rose-600 text-rose-700";
    scoreBgColorClass = "bg-rose-50 text-rose-700 border-rose-200";
    scoreText = "Highly Suspicious";
  } else if (entity.trustScore < 80) {
    scoreColorClass = "stroke-amber-600 text-amber-700";
    scoreBgColorClass = "bg-amber-50 text-amber-700 border-amber-200";
    scoreText = "Caution Required";
  }

  return (
    <div className="relative flex flex-col flex-1 bg-slate-50 min-h-screen text-slate-900 overflow-x-hidden font-sans">
      {/* Navigation & Header Section */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-4 z-10 flex-1 flex flex-col">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 uppercase tracking-wider">
          <Link href="/" className="hover:text-slate-700 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-500">Entities</span>
          <span>/</span>
          <span className="text-slate-700">Profile</span>
        </div>

        {/* Entity Banner Card */}
        <Card className="bg-white border-slate-200 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Entity Icon Container */}
              <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                {renderTypeIcon(entity.entityType)}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" className="capitalize text-[10px] tracking-wider py-0.5 px-2 font-bold bg-slate-100 border-slate-300 text-slate-700">
                    {getEntityTypeLabel(entity.entityType)}
                  </Badge>
                  <RiskLevelBadge level={entity.riskLevel} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-slate-900 break-all">
                    {entity.value}
                  </h1>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer select-none focus:outline-none"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <span className="text-xs font-sans text-emerald-700 px-1 font-semibold">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.674a2.25 2.25 0 0 0-1.883-2.54A1.125 1.125 0 0 1 15.75 1.5h1.5a1.125 1.125 0 0 1 1.125 1.125 2.25 2.25 0 0 0 2.25 2.25h.375c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V18a2.25 2.25 0 0 0-2.25-2.25h-.375c-.621 0-1.125-.504-1.125-1.125V5.25c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V9m11.9-3.674c.245.83.943 1.488 1.83 1.636a2.25 2.25 0 0 0 2.54-1.883M18.75 3.375V1.5M16.5 5.625H18" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
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

        {/* Responsive Summary Metrics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-all duration-300">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${entity.trustScore < 50 ? "bg-rose-50 border-rose-200 text-rose-700" : entity.trustScore < 80 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trust Score</span>
              <span className={`text-lg font-bold font-mono tracking-tight ${entity.trustScore < 50 ? "text-rose-700" : entity.trustScore < 80 ? "text-amber-700" : "text-emerald-700"}`}>
                {entity.trustScore}/100
              </span>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-all duration-300">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Approved Reports</span>
              <span className="text-lg font-bold font-mono tracking-tight text-slate-900">
                {entity.reports.length}
              </span>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-all duration-300">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Evidence Files</span>
              <span className="text-lg font-bold font-mono tracking-tight text-slate-900">
                {entity.reports.reduce((acc, r) => acc + (r.evidence?.length || 0), 0)}
              </span>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-5 flex items-center gap-4 hover:border-slate-300 transition-all duration-300">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </div>
            <div>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">First Report</span>
              <span className="text-sm font-bold tracking-tight text-slate-700 truncate max-w-[130px] block" title={getFirstReportDate()}>
                {getFirstReportDate()}
              </span>
            </div>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Left Column: Diagnostics Card */}
          <div className="space-y-6 lg:sticky lg:top-8">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-200">
                <CardTitle className="text-lg font-bold text-slate-900">Trust Diagnostics</CardTitle>
                <CardDescription className="text-xs text-slate-400">Real-time safety assessment</CardDescription>
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
                        className="stroke-slate-200"
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
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {entity.trustScore}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Score</span>
                    </div>
                  </div>
                           {/* Verdict badge */}
                  <div className={`mt-4 px-3 py-1 rounded-full text-xs font-semibold border ${scoreBgColorClass}`}>
                    {scoreText}
                  </div>
                  {/* Explanation of trust score calculation */}
                  <p className="mt-4 text-center text-xs text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                    Calculated based on verified user reports, the authenticity and volume of evidence provided, risk assessments, and historical activity.
                  </p>
                </div>
 
                {/* Score Diagnostics Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="block text-xs font-medium text-slate-400 mb-1">Risk Status</span>
                    <span className={`text-sm font-bold uppercase tracking-wide ${entity.riskLevel === "HIGH" ? "text-rose-700" : entity.riskLevel === "MEDIUM" ? "text-amber-700" : "text-emerald-700"}`}>
                      {entity.riskLevel}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="block text-xs font-medium text-slate-400 mb-1">Total Reports</span>
                    <span className="text-sm font-bold text-slate-900">
                      {entity.totalReports}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
 
            {/* AI Insights Card */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">AI Trust Insights</CardTitle>
                    <CardDescription className="text-xs text-slate-400">Automated pattern recognition</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Primary Threat</span>
                    <span className="font-semibold text-primary capitalize">{getMostCommonCategory().toLowerCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Avg. Loss Claimed</span>
                    <span className="font-semibold text-rose-700">{formatCurrency(getAverageAmountLost())}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Supporting Evidence</span>
                    <span className="font-semibold text-emerald-700">
                      {entity.reports.reduce((acc, r) => acc + (r.evidence?.length || 0), 0)} Files
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-500">Activity Level</span>
                    <span className={`font-semibold ${entity.reports.length > 5 ? "text-rose-700" : entity.reports.length > 2 ? "text-amber-700" : "text-emerald-700"}`}>
                      {getActivityLevel()}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 italic">
                  AI insights are synthesized based on verified incident data submitted by our community and are intended as guidelines rather than absolute legal assertions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Verified Scams Incidents Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Verified Scam Reports ({entity.reports.length})
              </h2>
              <span className="text-xs text-slate-500 font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                Approved Incidents Only
              </span>
            </div>

            {entity.reports.length === 0 ? (
              <Card className="bg-white border-slate-200 p-8 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 text-lg mx-auto mb-3 select-none">
                  ✓
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Clean Record</h3>
                <p className="text-sm max-w-sm mx-auto">
                  There are currently no verified approved scam reports filed against this entity.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {entity.reports.map((report, idx) => (
                  <div key={report.id} className="relative pl-8">
                    {/* Vertical timeline connector */}
                    {idx !== entity.reports.length - 1 && (
                      <span className="absolute left-[7px] top-6 bottom-[-30px] w-0.5 bg-slate-200 pointer-events-none" />
                    )}
                    {/* Timeline Dot Marker */}
                    <span className="absolute left-0 top-6 w-4 h-4 rounded-full bg-white border-2 border-primary z-10 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </span>

                    <Card className="bg-white border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold tracking-wider">
                              {report.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {report.title}
                          </h3>
                        </div>
                        
                        {report.amountLost !== null && report.amountLost > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-right shrink-0">
                            <span className="block text-[10px] uppercase tracking-wider text-rose-700 font-bold">Amount Lost</span>
                            <span className="text-sm font-extrabold text-rose-700">{formatCurrency(report.amountLost)}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-500 leading-relaxed mb-6 bg-slate-50 border border-slate-200 p-3.5 rounded-xl whitespace-pre-wrap">
                        {report.description}
                      </p>

                      {/* Additional Metadata */}
                      <div className="flex flex-col sm:flex-row gap-4 py-3 border-t border-slate-200 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          {/* Incident Date icon */}
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                          </svg>
                          <span>Incident Date: <strong className="text-slate-500">{formatDate(report.incidentDate)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Reporter details */}
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                          <span>Reporter: <strong className="text-slate-500">{report.isAnonymous ? "Anonymous User" : "Verified Member"}</strong></span>
                        </div>
                      </div>

                      {/* Evidence Attachment Section */}
                      {report.evidence.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <span className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                            Evidence Attachments ({report.evidence.length})
                          </span>
                          
                          <div className="flex flex-wrap gap-2">
                            {report.evidence.map((item) => {
                              // Check if image
                              const isImage = item.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || item.fileUrl.startsWith("http");
                              
                              return (
                                <div
                                  key={item.id}
                                  className="group relative w-16 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer shadow transition hover:border-slate-300"
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
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400">
                                      <svg className="w-5 h-5 text-slate-500 mb-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Panel */}
        {(() => {
          const getRecommendation = () => {
            const score = entity.trustScore;
            if (score >= 80) {
              return {
                verdict: "Safe to Proceed",
                bgGradient: "bg-white border-emerald-200",
                iconColor: "text-emerald-700",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                ),
                desc: "This entity has a high trust score and no verified scam reports in our database. Transactions with this entity are generally considered safe, but always verify details independently before executing payments.",
              };
            } else if (score >= 50) {
              return {
                verdict: "Proceed with Caution",
                bgGradient: "bg-white border-amber-200",
                iconColor: "text-amber-700",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                ),
                desc: "This entity has moderate risk factors or verified report history. We recommend exercising caution. Double-check account details, verify identities, and request secure/escrow transaction pathways.",
              };
            } else {
              return {
                verdict: "Avoid Transactions",
                bgGradient: "bg-white border-rose-200",
                iconColor: "text-rose-700",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
                desc: "This entity is linked to multiple verified fraud/scam incident reports. The risk rating is critical. We strongly recommend avoiding any transaction, contact, or financial exchange with this entity.",
              };
            }
          };
          const recommendation = getRecommendation();
          return (
            <Card className={`mt-8 ${recommendation.bgGradient}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-200 ${recommendation.iconColor}`}>
                  {recommendation.icon}
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Recommendation</span>
                  <h3 className={`text-xl font-extrabold tracking-tight ${recommendation.iconColor}`}>
                    {recommendation.verdict}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                    {recommendation.desc}
                  </p>
                </div>
              </div>
            </Card>
          );
        })()}
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
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain border border-slate-200 shadow"
              />
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 w-full max-w-sm">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
                <h4 className="font-bold text-slate-900 mb-1">Non-previewable File</h4>
                <p className="text-xs text-slate-500 mb-4">This evidence file is not a supported image format for inline previews.</p>
                <a
                  href={activeEvidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 font-semibold text-sm rounded-xl bg-primary hover:bg-primary-hover text-white transition duration-200"
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
                className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1 transition"
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
