import { HTMLAttributes } from "react";

export interface BackgroundEffectsProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "constrained" | "full-width";
}

export function BackgroundEffects({ className = "", variant = "full-width", ...props }: BackgroundEffectsProps) {
    return (
        <div 
            className={`absolute inset-0 pointer-events-none overflow-hidden ${variant === "constrained" ? "w-full max-w-[480px]" : "w-full"} ${className}`}
            {...props}
        >
            {/* Glowing ambient background */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-accent-focus/20 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        </div>
    );
}
