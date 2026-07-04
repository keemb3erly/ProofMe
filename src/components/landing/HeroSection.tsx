"use client";
import { api } from "@/lib/api";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  placeholder: string;
  icon: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200/50";
  return "bg-rose-50 text-rose-700 border-rose-200/50";
};

const getRiskColor = (level: string) => {
  const l = (level || "LOW").toUpperCase();
  if (l === "HIGH") return "bg-rose-50 text-rose-700 border-rose-200/50";
  if (l === "MEDIUM") return "bg-amber-50 text-amber-700 border-amber-200/50";
  return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
};

const getEntityTypeIcon = (type: string) => {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "PHONE":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.106-6.927-6.927l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      );
    case "BUSINESS":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-18 0V10.5M2.64 21H1.5m1.14 0h3.06M3.375 21h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm10.125 0h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125h-4.875c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm-9-10.5v-3c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3m-15 0h15" />
        </svg>
      );
    case "BANK":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5M3 21h18M12 9v-3.75" />
        </svg>
      );
    case "USERNAME":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      );
  }
};

const getEntityTypeLabel = (type: string) => {
  const t = (type || "").toUpperCase();
  switch (t) {
    case "PHONE":    return "Phone Number";
    case "BUSINESS": return "Business";
    case "BANK":     return "Bank Account";
    case "USERNAME": return "Username";
    default:         return type;
  }
};

// ─── Category Definitions ─────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "phone",
    name: "Phone Number",
    placeholder: "Enter phone number (e.g. +1 555-019-2834)...",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.106-6.927-6.927l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    id: "business",
    name: "Business",
    placeholder: "Enter business name, registration, or website...",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h2.64m-18 0V10.5M2.64 21H1.5m1.14 0h3.06M3.375 21h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm10.125 0h4.875c.621 0 1.125-.504 1.125-1.125v-3.026c0-.621-.504-1.125-1.125-1.125h-4.875c-.621 0-1.125.504-1.125 1.125v3.026c0 .621.504 1.125 1.125 1.125Zm-9-10.5v-3c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3m-15 0h15" />
      </svg>
    ),
  },
  {
    id: "bank",
    name: "Bank Account",
    placeholder: "Enter bank account number, IBAN, or sort code...",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5M3 21h18M12 9v-3.75" />
      </svg>
    ),
  },
  {
    id: "username",
    name: "Username",
    placeholder: "Enter Telegram handle, Instagram username, or email...",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    id: "seller",
    name: "Social Seller",
    placeholder: "Enter marketplace store name, link, or seller handle...",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setResults([]);
        setHasSearched(false);
        setError(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (error) setError(null);
    if (hasSearched) setHasSearched(false);
    if (results.length > 0) setResults([]);
  };

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setSearchValue("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await api.get("/entities/search", {
        params: { value: searchValue },
      });
      setResults(response.data.entities || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResults([]);
      } else {
        console.error("Search failed:", err);
        setError(err.response?.data?.error || "Search failed. Please try again.");
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const showDropdown =
    isSearching || (hasSearched && results.length === 0) || results.length > 0 || !!error;

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 pb-16 text-center">

        {/* Badge */}
        <span className="mb-5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1 text-sm font-medium text-emerald-700">
          Community Powered Scam Intelligence
        </span>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-bold leading-tight text-primary">
          Verify Trust Before You Transact.
        </h1>

        {/* Sub-text */}
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
          Search phone numbers, businesses, bank accounts, usernames, and online sellers
          before sending money or sharing sensitive information.
        </p>

        {/* ── Search Bar ──────────────────────────────────────────────── */}
        <div className="w-full max-w-3xl mt-8" ref={wrapperRef}>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

            {/* Input + dropdown wrapper */}
            <div className="relative flex-1 w-full">
              {/* Search icon */}
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </div>

              <input
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                placeholder={activeCategory.placeholder}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition shadow-sm text-sm h-[54px]"
              />

              {/* Results / states dropdown */}
              {showDropdown && (
                <div className="absolute left-0 right-0 z-50 top-full mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl max-h-80 overflow-y-auto overflow-x-hidden p-2">

                  {/* Loading */}
                  {isSearching && (
                    <div className="flex items-center justify-center p-6 text-sm text-slate-500 gap-2">
                      <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching database...
                    </div>
                  )}

                  {/* Error */}
                  {!isSearching && error && (
                    <div className="p-4 text-sm text-rose-600 text-center">{error}</div>
                  )}

                  {/* Empty */}
                  {!isSearching && !error && hasSearched && results.length === 0 && (
                    <div className="p-4 text-sm text-slate-500 text-center font-medium">
                      No matching entities found
                    </div>
                  )}

                  {/* Results list */}
                  {!isSearching && !error && results.length > 0 && (
                    <div className="flex flex-col gap-1 p-1">
                      {results.map((entity) => (
                        <Link
                          key={entity.id}
                          href={`/entity/${entity.id}`}
                          onClick={() => {
                            setResults([]);
                            setHasSearched(false);
                            setError(null);
                          }}
                          className="flex items-center justify-between p-3.5 mx-1 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition duration-150 ease-in-out cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 shrink-0 text-slate-400">
                              {getEntityTypeIcon(entity.entityType)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate text-sm sm:text-base leading-tight">
                                {entity.value}
                              </p>
                              <span className="text-xs font-medium text-slate-400 mt-0.5 block">
                                {getEntityTypeLabel(entity.entityType)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm ${getTrustScoreColor(entity.trustScore)}`}>
                              {entity.trustScore}% Trust
                            </span>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide shadow-sm ${getRiskColor(entity.riskLevel)}`}>
                              {entity.riskLevel} Risk
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={!searchValue.trim() || isSearching}
              className="px-8 py-4 rounded-xl bg-primary text-white font-semibold shadow hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer h-[54px] w-full sm:w-auto flex items-center justify-center"
            >
              {isSearching ? "Searching..." : "Verify"}
            </button>
          </form>
        </div>

        {/* ── Category Cards ───────────────────────────────────────────── */}
        <div className="w-full max-w-5xl mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition cursor-pointer select-none ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm text-primary"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-xs"
                }`}
              >
                <div className={`p-2.5 rounded-xl border mb-2.5 transition shrink-0 ${
                  isSelected
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-slate-100 bg-slate-50 text-slate-400"
                }`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-bold tracking-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* ── Secondary CTA ────────────────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-slate-500">
            Didn&apos;t find what you were looking for?{" "}
            <span className="text-slate-600 font-medium">Help protect others by reporting a scam.</span>
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 active:bg-primary/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Report a Scam
          </Link>
        </div>

      </div>
    </section>
  );
}
