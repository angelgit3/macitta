import React, { forwardRef } from "react";

interface ZenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
}

/**
 * ZenInput — Estudio Lúmico
 * Rounded soft-field with optional leading icon and animated focus ring.
 */
export const ZenInput = forwardRef<HTMLInputElement, ZenInputProps>(
  ({ label, helperText, error, icon, className = "", inputClassName = "", ...props }, ref) => {
    return (
      <div className={`space-y-1.5 w-full ${className}`}>
        {label && (
          <label className="block label-kicker ml-1">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full soft-field px-4 py-3.5 text-sm font-medium
              ${icon ? "pl-11" : ""}
              ${error ? "border-danger/50 focus:border-danger/70 focus:shadow-[0_0_0_3px_rgba(224,112,112,0.10)]" : ""}
              ${inputClassName}
            `}
            {...props}
          />
        </div>
        {(helperText || error) && (
          <p className={`text-xs ml-1 leading-relaxed ${error ? "text-danger" : "text-ink-faint"}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

ZenInput.displayName = "ZenInput";
