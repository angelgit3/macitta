
import { BentoCard } from "@/components/ui/BentoCard";
import { StatsGraph } from "@/components/ui/StatsGraph";
import { BookOpen, Target, Cloud } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
    const supabase = await createClient();

    const { count } = await supabase
        .from("verbs")
        .select("*", { count: "exact", head: true });

    return (
        <>
            {/* Header */}
            <header className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-focus flex items-center justify-center">
                        <Cloud size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Macitta</h1>
                </div>
            </header>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <BentoCard icon={<BookOpen size={20} />} title="Verbos" value={`${count || 0}`} />
                <BentoCard
                    icon={<Target size={20} className="text-accent-success" />}
                    title="Meta"
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
        </>
    );
}
