import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            ref={ref}
            className={`mt-1 w-4 h-4 rounded bg-slate-950 border border-slate-800 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-950 accent-blue-500 transition duration-200 cursor-pointer ${
              error ? "border-rose-500/50" : ""
            } ${className}`}
            {...props}
          />
          {label && (
            <span className="text-sm text-slate-400 font-medium leading-normal group-hover:text-slate-300 transition duration-150">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="text-xs text-rose-400 font-medium pl-7 animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
