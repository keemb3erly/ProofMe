"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, TrustScoreBadge, RiskLevelBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { readSession, isAdmin, isAuthenticated } from "@/lib/auth";
import { DashboardStats } from "@/types/dashboard";
import { Report } from "@/types/report";
import { Entity, EntityType } from "@/types/entity";

interface ExtendedReport extends Report {
  entity: Entity;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // Auth states
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  
  // Dashboard data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<ExtendedReport[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter/Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "amount" | "risk">("newest");

  // Modal states
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [reportToReject, setReportToReject] = useState<ExtendedReport | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproving, setIsApproving] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Authenticate user
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else if (!isAdmin()) {
      setIsForbidden(true);
      setCheckingAuth(false);
    } else {
      setIsForbidden(false);
      setCheckingAuth(false);
      fetchDashboardData();
    }
  }, [router]);

  // Handle toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Dashboard Stats and Pending Reports
  const fetchDashboardData = async () => {
    setError(null);
    setIsRefreshing(true);
    setLoadingStats(true);
    setLoadingReports(true);

    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get<DashboardStats>("/admin/dashboard"),
        api.get<ExtendedReport[]>("/admin/reports/pending")
      ]);

      setStats(statsRes.data);
      setReports(reportsRes.data);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      if (err.response?.status === 401) {
        router.replace("/login");
        return;
      }
      if (err.response?.status === 403) {
        setIsForbidden(true);
        setCheckingAuth(false);
        return;
      }
      setError("Failed to fetch dashboard records. Please verify backend connection and try again.");
    } finally {
      setLoadingStats(false);
      setLoadingReports(false);
      setIsRefreshing(false);
    }
  };

  // Helper to format currency
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

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to map entity type to human readable label
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

  // Handle Approve action
  const handleApproveReport = async (report: ExtendedReport) => {
    setIsApproving(report.id);
    try {
      await api.patch(`/admin/reports/${report.id}/approve`);
      
      // Update reports list state
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      
      // Update statistics locally
      setStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          pendingReports: Math.max(prev.pendingReports - 1, 0),
          approvedReports: prev.approvedReports + 1,
        };
      });

      setToast({
        message: `Report on "${report.entity.value}" approved successfully!`,
        type: "success"
      });

      if (isDetailsOpen && selectedReport?.id === report.id) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      console.error("Approval error:", err);
      if (err.response?.status === 401) { router.replace("/login"); return; }
      if (err.response?.status === 403) { setIsForbidden(true); setCheckingAuth(false); return; }
      setToast({
        message: "Failed to approve the report. Please try again.",
        type: "info"
      });
    } finally {
      setIsApproving(null);
    }
  };

  // Handle Reject action
  const handleRejectReport = async () => {
    if (!reportToReject) return;
    setIsRejecting(true);

    try {
      await api.patch(`/admin/reports/${reportToReject.id}/reject`);

      // Update reports list state
      setReports((prev) => prev.filter((r) => r.id !== reportToReject.id));

      // Update statistics locally
      setStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          pendingReports: Math.max(prev.pendingReports - 1, 0),
          rejectedReports: prev.rejectedReports + 1,
        };
      });

      setToast({
        message: `Report on "${reportToReject.entity.value}" rejected successfully.`,
        type: "success"
      });

      setIsRejectOpen(false);
      setReportToReject(null);

      if (isDetailsOpen && selectedReport?.id === reportToReject.id) {
        setIsDetailsOpen(false);
      }
    } catch (err: any) {
      console.error("Rejection error:", err);
      if (err.response?.status === 401) { router.replace("/login"); return; }
      if (err.response?.status === 403) { setIsForbidden(true); setCheckingAuth(false); return; }
      setToast({
        message: "Failed to reject the report. Please try again.",
        type: "info"
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Client-side search and sorting computation
  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];

    // 1. Search Filter
    if (searchTerm.trim() !== "") {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.category.toLowerCase().includes(lowerQuery) ||
          r.entity.value.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "amount") {
        const amtA = a.amountLost ?? 0;
        const amtB = b.amountLost ?? 0;
        return amtB - amtA;
      } else if (sortBy === "risk") {
        const riskWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const weightA = riskWeights[a.entity.riskLevel as keyof typeof riskWeights] || 0;
        const weightB = riskWeights[b.entity.riskLevel as keyof typeof riskWeights] || 0;
        return weightB - weightA;
      }
      return 0;
    });

    return result;
  }, [reports, searchTerm, sortBy]);

  // Loading indicator for authentication
  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 gap-4">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <Card className="max-w-md w-full border-rose-200 bg-white p-8 text-center space-y-6">
            <span className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-full inline-block text-4xl select-none mx-auto w-16 h-16 flex items-center justify-center">
              ⚠️
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-rose-700 uppercase tracking-wide">403 Access Denied</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                You do not have permission to access the administrative moderation console. Please contact support if you believe this is an error.
              </p>
            </div>
            <Button variant="secondary" onClick={() => router.push("/")} className="w-full h-11 text-xs font-bold text-rose-700 hover:text-rose-800">
              Return Home
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">

        {/* Dashboard Toast Notifications */}
        {toast && (
          <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border animate-fadeIn ${
            toast.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-white border-slate-200 text-slate-700"
          }`}>
            <span className="text-lg">{toast.type === "success" ? "✅" : "ℹ️"}</span>
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                Admin Console
              </span>
              <span className="text-xs text-slate-400">•</span>
              <p className="text-xs text-slate-400 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Moderation Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Review and act on reported scam reports to maintain public trust.
            </p>
          </div>

          <Button
            variant="secondary"
            className="flex items-center justify-center gap-2 self-start sm:self-center h-10 px-4 rounded-xl"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
          >
            <svg 
              className={`w-4 h-4 text-slate-400 ${isRefreshing ? "animate-spin text-primary" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span className="text-xs font-bold">Refresh Queue</span>
          </Button>
        </div>

        {/* Statistics section */}
        {loadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-4">
            <p className="text-rose-700 text-sm font-medium">{error}</p>
            <Button size="sm" onClick={fetchDashboardData} className="px-6">
              Retry Connection
            </Button>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Users Card */}
            <Card className="hover:scale-[1.02] transition duration-300 border-slate-200 bg-white hover:border-primary/30 p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
                  <h3 className="text-2xl font-black text-slate-900">{stats.totalUsers}</h3>
                </div>
                <span className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 18H9.822a11.386 11.386 0 01-4.933-1.237l.003-.109c0-2.887 2.34-5.23 5.23-5.23h2.04c2.887 0 5.23 2.34 5.23 5.23m-4.108-7.755a3.75 3.75 0 11-4.908 0M18 9.75a3 3 0 11-3-3m3 3a3 3 0 00-3-3m3 3h.008v.008h-.008V9.75zm.008 6h-.008v.008h.008V15.75z" />
                  </svg>
                </span>
              </div>
            </Card>

            {/* Entities Card */}
            <Card className="hover:scale-[1.02] transition duration-300 border-slate-200 bg-white hover:border-primary/30 p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tracked Entities</p>
                  <h3 className="text-2xl font-black text-slate-900">{stats.totalEntities}</h3>
                </div>
                <span className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </span>
              </div>
            </Card>

            {/* Pending Reports Card */}
            <Card className="hover:scale-[1.02] transition duration-300 border-slate-200 bg-white hover:border-amber-300 p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Queue</p>
                  <h3 className="text-2xl font-black text-amber-700">{stats.pendingReports}</h3>
                </div>
                <span className="p-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
            </Card>

            {/* Approved Reports Card */}
            <Card className="hover:scale-[1.02] transition duration-300 border-slate-200 bg-white hover:border-emerald-300 p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Reports</p>
                  <h3 className="text-2xl font-black text-emerald-700">{stats.approvedReports}</h3>
                </div>
                <span className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </span>
              </div>
            </Card>

            {/* Rejected Reports Card */}
            <Card className="hover:scale-[1.02] transition duration-300 border-slate-200 bg-white hover:border-rose-300 p-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rejected Reports</p>
                  <h3 className="text-2xl font-black text-rose-700">{stats.rejectedReports}</h3>
                </div>
                <span className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
            </Card>
          </div>
        ) : null}

        {/* Main Work Area: Queue Header & Filters */}
        <Card className="border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            {/* Search and Filters panel */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                  Pending Scam Reports
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    {filteredAndSortedReports.length} matches
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Filter by entity values, report categories, or alter the sorting priority.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by entity, title or category..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition duration-150"
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.636z" />
                    </svg>
                  </div>
                </div>

                {/* Sort Selector */}
                <div className="relative w-full sm:w-56">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition duration-150 appearance-none cursor-pointer font-medium"
                  >
                    <option value="newest">Sort by: Newest First</option>
                    <option value="amount">Sort by: Highest Amount Lost</option>
                    <option value="risk">Sort by: Highest Entity Risk</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            {loadingReports ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-44 bg-slate-100 border border-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredAndSortedReports.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
                <span className="p-4 bg-slate-50 border border-slate-200 text-slate-400 rounded-full select-none text-3xl">
                  ✨
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No pending reports found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchTerm 
                      ? "Adjust your search parameters or query keywords to find matched listings."
                      : "The moderation queue is completely clean. Great work keeping the community secure!"
                    }
                  </p>
                </div>
                {searchTerm && (
                  <Button size="sm" variant="secondary" onClick={() => setSearchTerm("")} className="px-5 text-xs">
                    Clear Search Query
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredAndSortedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-5 sm:p-6 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition duration-200 flex flex-col justify-between gap-5"
                  >
                    {/* Top Row: Entity Type & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {getEntityTypeLabel(report.entity.entityType)}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 font-mono tracking-tight select-all">
                          {report.entity.value}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <RiskLevelBadge level={report.entity.riskLevel} />
                        <TrustScoreBadge score={report.entity.trustScore} />
                      </div>
                    </div>

                    {/* Middle Section: Title, Description, and Metadata Grid */}
                    <div className="space-y-3.5">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {report.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium block">Scam Category</span>
                          <span className="text-slate-700 font-semibold">{report.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Amount Lost</span>
                          <span className="text-slate-700 font-semibold">{formatCurrency(report.amountLost)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Incident Date</span>
                          <span className="text-slate-700 font-semibold">{formatDate(report.incidentDate)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium block">Report Date</span>
                          <span className="text-slate-700 font-semibold">{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3.5 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        {report.evidence && report.evidence.length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            📎 {report.evidence.length} Evidence File{report.evidence.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">No attached files</span>
                        )}

                        <span className="text-slate-400 text-xs">•</span>

                        {report.isAnonymous ? (
                          <span className="text-xs text-slate-500 font-medium">Reporter: Anonymous</span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]" title={report.userId}>
                            Reporter: {report.userId}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setIsDetailsOpen(true);
                          }}
                          className="text-xs px-3 h-9 font-bold"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="reject"
                          size="sm"
                          onClick={() => {
                            setReportToReject(report);
                            setIsRejectOpen(true);
                          }}
                          className="text-xs px-3.5 h-9 font-bold"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="approve"
                          size="sm"
                          isLoading={isApproving === report.id}
                          onClick={() => handleApproveReport(report)}
                          className="text-xs px-4 h-9 font-bold"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      <Footer />

      {/* Details View Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Scam Report Details"
        className="max-w-2xl bg-white border border-slate-200"
      >
        {selectedReport && (
          <div className="space-y-6 text-left">
            {/* Modal Hero Header */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {getEntityTypeLabel(selectedReport.entity.entityType)}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-1.5 font-mono select-all">
                  {selectedReport.entity.value}
                </h4>
              </div>
              <div className="flex items-center gap-2 self-start md:self-center">
                <RiskLevelBadge level={selectedReport.entity.riskLevel} />
                <TrustScoreBadge score={selectedReport.entity.trustScore} />
              </div>
            </div>

            {/* Title and description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{selectedReport.title}</h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            {/* Metadata and Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                  Incident Parameters
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-700">{selectedReport.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Lost:</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(selectedReport.amountLost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Incident Date:</span>
                    <span className="font-semibold text-slate-700">{formatDate(selectedReport.incidentDate)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                  Reporter Meta
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anonymity:</span>
                    <span className="font-semibold text-slate-700">{selectedReport.isAnonymous ? "Yes (Anonymous)" : "No"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400 min-w-max">Reporter ID:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={selectedReport.userId}>
                      {selectedReport.isAnonymous ? "N/A" : selectedReport.userId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submitted:</span>
                    <span className="font-semibold text-slate-700">{formatDate(selectedReport.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Gallery */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Evidence Attachments
              </h4>
              {selectedReport.evidence && selectedReport.evidence.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedReport.evidence.map((file) => {
                    const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.fileUrl);
                    return (
                      <div 
                        key={file.id}
                        className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden h-24 flex items-center justify-center transition duration-150 hover:border-primary/40"
                      >
                        {isImg ? (
                          <div className="w-full h-full relative cursor-zoom-in" onClick={() => setLightboxImage(file.fileUrl)}>
                            <img 
                              src={file.fileUrl} 
                              alt="Scam Evidence" 
                              className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center text-xs text-white font-semibold">
                              Preview
                            </div>
                          </div>
                        ) : (
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex flex-col items-center justify-center p-3 text-center gap-1.5 w-full h-full"
                          >
                            <span className="text-2xl text-slate-400 group-hover:text-primary transition-colors">📄</span>
                            <span className="text-[10px] text-slate-500 font-semibold group-hover:underline truncate max-w-full px-1">
                              View Doc
                            </span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic p-4 border border-slate-200 rounded-xl bg-slate-50 text-center">
                  No files were uploaded as evidence for this scam report.
                </p>
              )}
            </div>

            {/* Modal Action Controls */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 text-xs h-10 font-bold"
              >
                Close Details
              </Button>
              <Button
                variant="reject"
                onClick={() => {
                  setReportToReject(selectedReport);
                  setIsRejectOpen(true);
                }}
                className="px-5 text-xs h-10 font-bold"
              >
                Reject Report
              </Button>
              <Button
                variant="approve"
                isLoading={isApproving === selectedReport.id}
                onClick={() => handleApproveReport(selectedReport)}
                className="px-6 text-xs h-10 font-bold"
              >
                Approve Report
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isRejectOpen}
        onClose={() => {
          if (!isRejecting) {
            setIsRejectOpen(false);
            setReportToReject(null);
          }
        }}
        title="Confirm Report Rejection"
        className="max-w-md bg-white border border-slate-200"
      >
        <div className="space-y-5 text-left">
          <div className="flex gap-3 items-start p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <div className="space-y-0.5">
              <span className="font-bold">Important Notice</span>
              <p>Rejection marks the report as REJECTED in the database and dismisses it from the pending review list.</p>
            </div>
          </div>

          <p className="text-xs text-slate-700">
            Are you sure you want to reject the report titled{" "}
            <strong className="text-slate-900">"{reportToReject?.title}"</strong>?
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsRejectOpen(false);
                setReportToReject(null);
              }}
              disabled={isRejecting}
              className="px-4 text-xs h-9 font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="reject"
              onClick={handleRejectReport}
              isLoading={isRejecting}
              disabled={isRejecting}
              className="px-5 text-xs h-9 font-bold"
            >
              Reject Report
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 transition-opacity cursor-zoom-out" 
            onClick={() => setLightboxImage(null)}
          />
          <div className="relative max-w-4xl max-h-[85vh] z-[110] animate-scaleIn">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white transition duration-150 p-2 cursor-pointer focus:outline-none text-xl font-bold flex items-center gap-1.5"
            >
              <span>✕</span> <span className="text-xs uppercase tracking-widest font-semibold">Close</span>
            </button>
            <img 
              src={lightboxImage} 
              alt="Evidence Large Size" 
              className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-slate-200 bg-white" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
