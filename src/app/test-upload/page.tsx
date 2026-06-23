"use client";

import React, { useState, useEffect } from "react";

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
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  userId: string;
  entityId: string;
  entity?: Entity;
  evidence?: Evidence[];
}

interface Entity {
  id: string;
  value: string;
  entityType: string;
  trustScore: number;
  totalReports: number;
  riskLevel: string;
  createdAt: string;
  reports?: Report[];
}

export default function TestUploadPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [manualReportId, setManualReportId] = useState<string>("");
  const [cloudinaryConfig, setCloudinaryConfig] = useState<{ status: string; config: any } | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Verification state
  const [isApproving, setIsApproving] = useState(false);
  const [approveResult, setApproveResult] = useState<any>(null);
  const [isFetchingEntity, setIsFetchingEntity] = useState(false);
  const [entityResult, setEntityResult] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      // 1. Fetch Cloudinary config status
      const configRes = await fetch("/api/test-cloudinary");
      const configData = await configRes.json();
      setCloudinaryConfig(configData);

      // 2. Fetch recent reports & entities
      const helperRes = await fetch("/api/test-helper/data");
      const helperData = await helperRes.json();
      if (helperData.reports) {
        setReports(helperData.reports);
        if (helperData.reports.length > 0) {
          setSelectedReportId(helperData.reports[0].id);
        }
      }
      if (helperData.entities) {
        setEntities(helperData.entities);
      }
    } catch (err: any) {
      console.error("Failed to load initial test data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const activeReportId = manualReportId.trim() || selectedReportId;
  const activeReport = reports.find((r) => r.id === activeReportId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportId) {
      setUploadError("Please select or enter a Report ID");
      return;
    }
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`/api/reports/${activeReportId}/evidence`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload evidence");
      }

      setUploadResult(data);
      // Reload reports data to reflect new evidence
      await loadData();
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveReport = async () => {
    if (!activeReportId) return;
    setIsApproving(true);
    setVerificationError(null);
    setApproveResult(null);

    try {
      const res = await fetch(`/api/admin/reports/${activeReportId}/approve`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve report");
      }

      setApproveResult(data);
      // Reload reports and entities
      await loadData();
    } catch (err: any) {
      setVerificationError(err.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleFetchEntityProfile = async () => {
    const entityId = activeReport?.entityId;
    if (!entityId) {
      setVerificationError("No entity ID associated with this report");
      return;
    }

    setIsFetchingEntity(true);
    setVerificationError(null);
    setEntityResult(null);

    try {
      const res = await fetch(`/api/entities/${entityId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch entity profile");
      }

      setEntityResult(data);
    } catch (err: any) {
      setVerificationError(err.message || "Failed to fetch entity profile");
    } finally {
      setIsFetchingEntity(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-20">
      {/* Top Banner / Glowing Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-900/40 via-slate-950 to-slate-950 py-16 px-6 text-center border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Evidence Hub & Verification
        </h1>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto text-lg">
          Upload real image evidence to Cloudinary, link it to reports in Prisma, and verify integration output seamlessly.
        </p>

        {/* Config Status Widget */}
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-sm">
          <span className="text-slate-400">Cloudinary Connection:</span>
          {cloudinaryConfig ? (
            cloudinaryConfig.status === "configured" || cloudinaryConfig.status === "ok" ? (
              <span className="flex items-center gap-2 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected Successfully
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Missing Credentials
              </span>
            )
          ) : (
            <span className="text-slate-500">Checking...</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Report Selection & Upload */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 1: SELECT REPORT */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                1
              </span>
              <h2 className="text-xl font-bold text-slate-200">Select or Enter Report Target</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select from Recent Reports
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => {
                    setSelectedReportId(e.target.value);
                    setManualReportId("");
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                >
                  <option value="">-- Select a Report --</option>
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      [{report.status}] {report.title} ({report.entity?.value || "Unknown Entity"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase font-bold">OR</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Manual Entry (Custom Report UUID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={manualReportId}
                  onChange={(e) => setManualReportId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                />
              </div>

              {activeReport && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Report Title:</span>
                    <span className="text-slate-200 font-semibold">{activeReport.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Report ID:</span>
                    <span className="text-slate-300 font-mono text-xs">{activeReport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Associated Entity:</span>
                    <span className="text-indigo-400 font-semibold">{activeReport.entity?.value} ({activeReport.entity?.entityType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Current Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      activeReport.status === "APPROVED" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                        : activeReport.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      {activeReport.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: UPLOAD IMAGE */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm">
                2
              </span>
              <h2 className="text-xl font-bold text-slate-200">Upload Image Evidence File</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="group relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Selected Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-md object-contain border border-slate-800"
                    />
                    <p className="text-xs text-slate-400 truncate max-w-xs mx-auto">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-800 group-hover:text-slate-300">
                      📸
                    </div>
                    <div className="text-sm font-semibold text-slate-300">
                      Click to choose an image file
                    </div>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, or WEBP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-400 text-sm">
                  ⚠️ {uploadError}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !activeReportId || !selectedFile}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] shadow-lg shadow-blue-500/20"
              >
                {isUploading ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Uploading to Cloudinary & Prisma...
                  </>
                ) : (
                  "Upload & Link Evidence"
                )}
              </button>
            </form>

            {uploadResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <span>✓</span> Evidence Upload Successful!
                </div>
                <div className="space-y-1 text-slate-300 font-mono text-xs">
                  <div><span className="text-slate-500">Evidence ID:</span> {uploadResult.evidence.id}</div>
                  <div><span className="text-slate-500">Linked Report:</span> {uploadResult.evidence.reportId}</div>
                  <div><span className="text-slate-500">Secure URL:</span> <a href={uploadResult.evidence.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{uploadResult.evidence.fileUrl}</a></div>
                </div>
                <div className="mt-2 rounded overflow-hidden border border-slate-800 max-h-36">
                  <img src={uploadResult.evidence.fileUrl} alt="Cloudinary Evidence" className="w-full object-cover object-center" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Verification & Testing */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* STEP 3: VERIFICATION */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm">
                3
              </span>
              <h2 className="text-xl font-bold text-slate-200">Verify & Approve</h2>
            </div>

            <div className="space-y-6">
              {activeReport && activeReport.status === "PENDING" && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-sm space-y-2">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    ⚠️ Report is PENDING
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    By default, the entity profile endpoint (`GET /api/entities/[id]`) only includes evidence from <strong>APPROVED</strong> reports. To make this evidence visible on the entity profile, you need to approve this report first.
                  </p>
                  
                  <button
                    onClick={handleApproveReport}
                    disabled={isApproving}
                    className="w-full mt-2 h-10 flex items-center justify-center gap-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-40"
                  >
                    {isApproving ? "Approving Report..." : "Approve Report Now"}
                  </button>

                  {approveResult && (
                    <div className="mt-2 text-xs text-emerald-400 font-medium font-mono">
                      ✓ Report successfully approved! Risk Level set to: {approveResult.riskLevel}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleFetchEntityProfile}
                  disabled={isFetchingEntity || !activeReport?.entityId}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  {isFetchingEntity ? "Fetching Entity Profile..." : "Fetch Entity Profile & Check Evidence"}
                </button>

                {verificationError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-400 text-sm">
                    ⚠️ {verificationError}
                  </div>
                )}

                {entityResult && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Entity Verification Output</h3>
                      <span className="text-xs text-emerald-400 font-mono">Status: 200 OK</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-h-[350px] overflow-y-auto">
                      <div className="flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                        <span>Entity ID: {entityResult.id}</span>
                        <span className="text-indigo-400">{entityResult.value}</span>
                      </div>

                      {/* Display Evidence found */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-2">Evidence list inside entity.reports:</h4>
                        {entityResult.reports && entityResult.reports.flatMap((r: any) => r.evidence || []).length > 0 ? (
                          <div className="space-y-2">
                            {entityResult.reports.flatMap((r: any) => (r.evidence || []).map((ev: any) => (
                              <div key={ev.id} className="flex gap-3 items-center p-2 rounded bg-slate-900 border border-slate-800/80">
                                <img src={ev.fileUrl} alt="Evidence" className="w-12 h-12 rounded object-cover border border-slate-700" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-slate-300 font-semibold truncate">Uploaded Evidence Link</div>
                                  <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline break-all block truncate">
                                    {ev.fileUrl}
                                  </a>
                                </div>
                              </div>
                            )))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic py-2">
                            No evidence files found in approved reports for this entity yet.
                          </div>
                        )}
                      </div>

                      {/* JSON View */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-1">Full Response JSON:</h4>
                        <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded max-h-[150px] overflow-auto border border-slate-900">
                          {JSON.stringify(entityResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
