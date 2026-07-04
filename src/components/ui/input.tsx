import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type, id, ...props }, ref) => {
    if (type === "checkbox") {
      return (
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`mt-1 h-4 w-4 rounded border-slate-300 bg-white text-primary focus:ring-primary/20 accent-primary ${error ? "border-rose-400" : ""} ${className}`}
            {...props}
          />
          {label && (
            <label htmlFor={id} className="text-sm text-slate-600 cursor-pointer">
              {label}
            </label>
          )}
          {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
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

Input.displayName = "Input";
