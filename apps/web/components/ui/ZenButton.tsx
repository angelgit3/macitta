import React from "react";

interface ZenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
}

export function ZenButton({
    children,
    variant = "primary",
    fullWidth = false,
    className = "",
    ...props
}: ZenButtonProps) {
    const baseStyles =
        "relative overflow-hidden rounded-xl font-medium transition-all duration-300 active:scale-[0.98] flex items-center justify-center p-4 border border-transparent";

    const variants = {
        primary: "bg-accent-focus text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:border-blue-400/50",
        secondary: "bg-stone-surface text-white hover:bg-stone-light hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] border-border-subtle",
        ghost: "bg-transparent text-text-dim hover:text-white hover:bg-white/5",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? "w-full" : ""
                } ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
