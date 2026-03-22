import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { MisClasesClient } from "./MisClasesClient";

export default async function MisClasesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    return <MisClasesClient userId={user.id} />;
}
