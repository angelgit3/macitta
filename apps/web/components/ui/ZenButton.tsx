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
        "relative overflow-hidden rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center p-4";

    const variants = {
        primary: "bg-accent-focus text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20",
        secondary: "bg-stone-light text-white hover:bg-stone-light/80 border border-white/5",
        ghost: "bg-transparent text-text-dim hover:text-white",
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
