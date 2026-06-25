"use client";

import React, { useState } from "react";
import { Evidence } from "@/types/report";
import { Modal } from "../ui/modal";

interface EvidenceGalleryProps {
  evidence: Evidence[];
  className?: string;
}

export function EvidenceGallery({ evidence, className = "" }: EvidenceGalleryProps) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className={`space-y-2.5 ${className}`}>
      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Evidence Attachments ({evidence.length})
      </span>

      <div className="flex flex-wrap gap-2">
        {evidence.map((item) => {
          const isImage = item.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || item.fileUrl.startsWith("http");

          return (
            <div
              key={item.id}
              className="group relative w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-pointer shadow-sm transition duration-200 hover:border-slate-600 shrink-0"
              onClick={() => setActiveUrl(item.fileUrl)}
            >
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.fileUrl}
                  alt="Evidence Thumbnail"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
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

      {/* Lightbox Modal */}
      <Modal
        isOpen={activeUrl !== null}
        onClose={() => setActiveUrl(null)}
        title="Evidence Preview"
        className="max-w-2xl"
      >
        {activeUrl && (
          <div className="flex flex-col items-center justify-center">
            {activeUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) || activeUrl.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeUrl}
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
                  href={activeUrl}
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
                href={activeUrl}
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
