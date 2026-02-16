import { createClient } from "@/utils/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { Cloud } from "lucide-react";

export default async function Dashboard() {
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

            <DashboardClient initialCount={count || 0} />
        </>
    );
}
