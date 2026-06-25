import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, options, children, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition duration-200 appearance-none cursor-pointer ${
              error
                ? "border-rose-500/50 focus:ring-rose-500/30"
                : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          {/* Custom Chevron Down Icon */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-rose-400 mt-1 font-medium animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
