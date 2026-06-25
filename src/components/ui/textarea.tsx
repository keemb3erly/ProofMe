import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition duration-200 min-h-[120px] ${
            error
              ? "border-rose-500/50 focus:ring-rose-500/30"
              : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-400 mt-1 font-medium animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
