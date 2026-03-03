import { AppHeader } from "@/components/ui/AppHeader";
import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
    const supabase = await createClient();

    const { count } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true });

    return (
        <>
            <AppHeader />
            <DashboardClient initialCount={count || 0} />
        </>
    );
}
