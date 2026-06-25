import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <Card className={`relative w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 z-10 animate-scaleIn p-6 ${className}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition duration-150 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer focus:outline-none"
          aria-label="Close modal"
        >
          ✕
        </button>

        <CardHeader className="mb-4 pr-8">
          <CardTitle className="text-xl text-left font-bold">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
