import React, { forwardRef } from "react";

interface ZenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    inputClassName?: string;
}

export const ZenInput = forwardRef<HTMLInputElement, ZenInputProps>(
    ({ label, helperText, error, className = "", inputClassName = "", ...props }, ref) => {
        return (
            <div className={`space-y-2 w-full ${className}`}>
                {label && (
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-3 bg-void/50 border border-border-subtle rounded-xl text-white focus:outline-none focus:border-accent-focus focus:ring-1 focus:ring-accent-focus transition-all shadow-inner placeholder:font-normal disabled:opacity-50 ${
                        error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    } ${inputClassName || "text-sm font-medium"}`}
                    {...props}
                />
                {(helperText || error) && (
                    <p className={`text-xs ml-1 mt-1 leading-relaxed ${error ? "text-red-400" : "text-text-dim/90"}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

ZenInput.displayName = "ZenInput";