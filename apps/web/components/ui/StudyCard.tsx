import React, { useState } from "react";
import { Volume2 } from "lucide-react";

interface StudyCardProps {
    frontContent: string;
    backContent: string;
    context?: string;
    masteryLevel?: number;
    onFlip?: () => void;
}

export function StudyCard({
    frontContent,
    backContent,
    context,
    masteryLevel,
}: StudyCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full aspect-[4/5] bg-stone-surface rounded-3xl border border-white/5 p-8 relative flex flex-col items-center justify-center text-center shadow-2xl shadow-black/50 overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Top Controls */}
            <div className="absolute top-6 w-full px-6 flex justify-between items-center text-xs font-bold tracking-widest text-text-dim/50 uppercase">
                <span>Infinitive Verb</span>
                {masteryLevel && (
                    <span className="bg-blue-500/10 text-accent-focus px-2 py-1 rounded">
                        Mastery Level {masteryLevel}
                    </span>
                )}
            </div>

            {/* Main Content */}
            <div className="z-10 flex flex-col items-center gap-4">
                <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-xl">
                    {frontContent}
                </h1>

                <div
                    className={`text-2xl font-serif text-text-dim transition-all duration-500 ${isFlipped ? "opacity-100 blur-0" : "opacity-0 blur-md translate-y-4"
                        }`}
                >
                    {backContent}
                </div>
            </div>

            {/* Context Quote */}
            {context && (
                <div className="absolute bottom-12 text-sm italic text-white/30 font-serif max-w-[80%]">
                    "{context}"
                </div>
            )}

            {/* Audio Button */}
            <button className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-accent-focus/20 hover:bg-accent-focus text-accent-focus hover:text-white flex items-center justify-center transition-all">
                <Volume2 size={24} />
            </button>

            {/* Reveal Interaction */}
            {!isFlipped && (
                <button
                    onClick={() => setIsFlipped(true)}
                    className="absolute inset-0 w-full h-full cursor-pointer z-20 outline-none"
                    aria-label="Reveal Answer"
                />
            )}
        </div>
    );
}
