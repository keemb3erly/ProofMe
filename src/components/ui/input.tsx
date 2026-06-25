import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", ...props }, ref) => {
    const isCheckbox = type === "checkbox";

    if (isCheckbox) {
      return (
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              ref={ref}
              className={`mt-0.5 w-4 h-4 rounded bg-slate-950 border border-slate-800 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-950 accent-blue-500 transition duration-200 cursor-pointer ${
                error ? "border-rose-500/50" : ""
              } ${className}`}
              {...props}
            />
            {label && (
              <span className="text-sm text-slate-400 font-medium leading-tight group-hover:text-slate-300 transition duration-150">
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

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition duration-200 ${
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

Input.displayName = "Input";
