import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DocenteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "teacher") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
