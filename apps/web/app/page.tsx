"use client";

import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { ZenDock } from "@/components/ui/ZenDock";
import { BookOpen, Target, Cloud, Settings } from "lucide-react";
import Image from "next/image";

export default function Home() {
    return (
        <div className="pb-32 px-6 pt-6 flex flex-col gap-6">
            {/* Header */}
            <header className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-focus flex items-center justify-center">
                        <Cloud size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Obsidian Zen</h1>
                </div>
                <Settings size={24} className="text-text-dim" />
            </header>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <BentoCard icon={<BookOpen size={20} />} title="Verbs" value="124" />
                <BentoCard
                    icon={<Target size={20} className="text-accent-success" />}
                    title="Goal"
                    value="0/20"
                />
            </div>

            {/* Cloud Sync Status */}
            <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-text-dim">
                    <Cloud size={16} />
                    <span>Cloud Sync</span>
                </div>
                <span className="text-sm font-bold text-accent-success">Up to date</span>
            </div>

            {/* Activity Graph */}
            <BentoCard title="Activity" className="h-[300px]">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-text-dim">
                            Streak
                        </div>
                        <div className="text-2xl font-bold">14 Days</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-text-dim">
                            Total Time
                        </div>
                        <div className="text-2xl font-bold">
                            2.4h <span className="text-accent-success text-sm">+12%</span>
                        </div>
                    </div>
                </div>
                <StatsGraph />
            </BentoCard>

            {/* Navigation */}
            <ZenDock />
        </div>
    );
}
