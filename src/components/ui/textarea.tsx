import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`w-full rounded-xl bg-white border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none ${
            error
              ? "border-rose-300 focus:ring-rose-500/30 focus:border-rose-400"
              : "border-slate-200 focus:border-primary focus:ring-primary/20"
          } focus:ring-2 ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
