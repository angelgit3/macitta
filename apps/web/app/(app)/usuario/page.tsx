import { createClient } from "@/utils/supabase/server";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    return (
        <div className="flex flex-col gap-6 pb-24">
            <h1 className="text-3xl font-black text-ink px-2 mt-4">Cuenta</h1>
            <ProfileClient initialUser={user} />
        </div>
    );
}
