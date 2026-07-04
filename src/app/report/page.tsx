"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, ReportFields } from "@/schemas/report.schema";
import { api } from "@/lib/api";
import { readSession } from "@/lib/auth";
import { User } from "@/types/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface EvidenceFileItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
}

function ReportFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryValue = searchParams.get("value") || "";
  const queryType = searchParams.get("type") || "PHONE";

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successReportId, setSuccessReportId] = useState<string | null>(null);
  const [successEntityValue, setSuccessEntityValue] = useState<string>("");

  useEffect(() => {
    setUser(readSession());
    setAuthChecked(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFields>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      entityType: "PHONE" as any,
      entityValue: "",
      title: "",
      description: "",
      category: "",
      amountLost: null,
      incidentDate: "",
      isAnonymous: true,
    },
  });

  // Automatically prefill parameters if supplied
  useEffect(() => {
    if (queryValue) {
      setValue("entityValue", queryValue);
    }
    if (queryType) {
      const typeUpper = queryType.toUpperCase();
      if (["PHONE", "BANK", "USERNAME", "BUSINESS"].includes(typeUpper)) {
        setValue("entityType", typeUpper as any);
      }
    }
  }, [queryValue, queryType, setValue]);

  // Clean up object URLs on unmount to prevent leaks
  useEffect(() => {
    return () => {
      evidenceFiles.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [evidenceFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFileList = (files: FileList) => {
    const newItems: EvidenceFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl,
        progress: 0,
        status: "pending",
      });
    }
    setEvidenceFiles((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setEvidenceFiles((prev) => {
      const fileItem = prev.find((item) => item.id === id);
      if (fileItem?.previewUrl) {
        URL.revokeObjectURL(fileItem.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const onSubmit = async (data: ReportFields) => {
    if (!user) {
      setSubmitError("You must be logged in to submit a scam report.");
      return;
    }
    setSubmitError(null);

    try {
      // Step 1: Create or find the entity
      const entityRes = await api.post("/entities", {
        value: data.entityValue,
        entityType: data.entityType,
      });
      const entityId = entityRes.data.id;

      // Step 2: Create the report
      const reportRes = await api.post("/reports", {
        title: data.title,
        description: data.description,
        category: data.category,
        amountLost: data.amountLost,
        incidentDate: data.incidentDate ? new Date(data.incidentDate).toISOString() : null,
        isAnonymous: data.isAnonymous,
        userId: user.id,
        entityId: entityId,
      });

      const reportId = reportRes.data.report.id;

      // Step 3: Upload files sequentially
      if (evidenceFiles.length > 0) {
        for (let i = 0; i < evidenceFiles.length; i++) {
          const item = evidenceFiles[i];
          setEvidenceFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: "uploading" } : f))
          );

          const formData = new FormData();
          formData.append("file", item.file);

          try {
            await api.post(`/reports/${reportId}/evidence`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / (progressEvent.total || 1)
                );
                setEvidenceFiles((prev) =>
                  prev.map((f) => (f.id === item.id ? { ...f, progress: percent } : f))
                );
              },
            });
            setEvidenceFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, status: "success", progress: 100 } : f))
            );
          } catch (err: any) {
            console.error("Evidence file upload error:", err);
            setEvidenceFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, status: "error" } : f))
            );
            throw new Error(`Failed to upload file "${item.file.name}". Please try again.`);
          }
        }
      }

      setSuccessReportId(reportId);
      setSuccessEntityValue(data.entityValue);
    } catch (error: any) {
      console.error("Report submission failure:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError(
          error.message || "An unexpected error occurred during submission. Please try again."
        );
      }
    }
  };

  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm">Verifying authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-lg bg-white border-slate-200 p-8 text-center">
        <CardHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-700 text-3xl mb-4 select-none">
            🔒
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Sign In Required</CardTitle>
          <CardDescription className="text-slate-500 text-base max-w-sm mx-auto mt-2">
            You must be logged in to file a scam report or upload evidence files. This helps maintain validation integrity.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button
            variant="primary"
            className="w-full sm:w-auto px-6 h-11"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto px-6 h-11"
            onClick={() => router.push("/register")}
          >
            Create Account
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (successReportId) {
    return (
      <Card className="w-full max-w-xl bg-white border-slate-200 p-8 text-center select-none animate-fadeIn">
        <CardHeader className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-3xl mb-4 select-none">
            ✓
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Report Filed Successfully</CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Your report against <strong className="text-slate-900">{successEntityValue}</strong> has been submitted. It is now pending verification by our moderation team.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1.5 max-w-sm mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report ID</span>
            <span className="text-sm font-mono font-bold text-primary break-all select-all">
              {successReportId}
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            All evidence files were successfully uploaded. This record will assist in recalculating trust scores once moderators verify the claim.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button
            variant="secondary"
            className="w-full sm:w-auto px-6 h-11"
            onClick={() => router.push("/")}
          >
            Search Another Entity
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto px-6 h-11"
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold text-primary tracking-tight">
          Report a Scam
        </CardTitle>
        <CardDescription>
          Help protect our community by submitting accurate scam records and proof.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Entity Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
            Section 1: Scam Entity Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Entity Type"
              options={[
                { value: "PHONE", label: "Phone Number" },
                { value: "BANK", label: "Bank Account" },
                { value: "USERNAME", label: "Username" },
                { value: "BUSINESS", label: "Business" },
              ]}
              error={errors.entityType?.message}
              {...register("entityType")}
            />
            <Input
              label="Entity Identifier Value"
              placeholder="e.g. 08123456789 or Account Number"
              error={errors.entityValue?.message}
              {...register("entityValue")}
            />
          </div>
        </div>

        {/* Section 2: Incident Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
            Section 2: Incident Details
          </h3>
          <div className="space-y-4">
            <Input
              label="Scam Incident Title"
              placeholder="Brief summary of the scam incident"
              error={errors.title?.message}
              {...register("title")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Scam Category"
                options={[
                  { value: "", label: "Select Category..." },
                  { value: "PHISHING", label: "Phishing & Impersonation" },
                  { value: "INVESTMENT", label: "Investment / Crypto Scam" },
                  { value: "ECOMMERCE", label: "E-Commerce / Online Fraud" },
                  { value: "ROMANCE", label: "Romance / Dating Scam" },
                  { value: "EXTORTION", label: "Blackmail / Extortion" },
                  { value: "OTHER", label: "Other Fraudulent Activity" },
                ]}
                error={errors.category?.message}
                {...register("category")}
              />
              <Input
                type="date"
                label="Incident Date"
                error={errors.incidentDate?.message}
                {...register("incidentDate")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Amount Lost (Optional, ₦)"
                placeholder="e.g. 50000"
                error={errors.amountLost?.message}
                {...register("amountLost", {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
              />
              <div className="flex items-center pt-8 pl-1">
                <Input
                  type="checkbox"
                  label="Report Anonymously"
                  error={errors.isAnonymous?.message}
                  {...register("isAnonymous")}
                />
              </div>
            </div>
            <Textarea
              label="Description of Incident"
              placeholder="Provide a detailed chronological description of how the scam occurred, contact details, or patterns observed..."
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        </div>

        {/* Section 3: Supporting Evidence */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
            Section 3: Supporting Evidence
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition duration-200 select-none ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <input
              type="file"
              id="evidence-file-input"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
            <label
              htmlFor="evidence-file-input"
              className="flex flex-col items-center gap-2 cursor-pointer text-center"
            >
              <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-500 shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Drag & drop files here, or <span className="text-primary hover:underline">browse</span>
              </span>
              <span className="text-xs text-slate-400">
                Supports images (PNG, JPG, WEBP) or files up to 5MB. Multiple files allowed.
              </span>
            </label>
          </div>

          {/* Evidence Files List */}
          {evidenceFiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {evidenceFiles.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                        FILE
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-700 truncate" title={item.file.name}>
                        {item.file.name}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === "uploading" && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{item.progress}%</span>
                      </div>
                    )}
                    {item.status === "success" && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        Done
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded" title="Upload failed">
                        Failed
                      </span>
                    )}
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id)}
                        className="text-slate-400 hover:text-rose-700 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {submitError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2 items-start animate-fadeIn">
            <span className="text-base select-none mt-0.5">⚠️</span>
            <div className="space-y-1">
              <span className="font-bold block">Submission Error</span>
              <p className="text-xs">{submitError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            className="px-6 h-11 text-xs sm:text-sm"
            onClick={() => router.push("/")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-8 h-11 text-xs sm:text-sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Scam Report
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ReportPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Spinner size="lg" />
              <p className="text-slate-500 text-sm animate-pulse">Initializing report form...</p>
            </div>
          }
        >
          <ReportFormInner />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
