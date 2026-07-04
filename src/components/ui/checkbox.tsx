import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
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
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
