"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { ProfileClient } from "./ProfileClient";

export default function ProfilePage() {
    const supabase = useMemo(() => createClient(), []);
    const [user, setUser] = useState<User | null>();

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data }) => {
            if (active) setUser(data.session?.user ?? null);
        });

        return () => {
            active = false;
        };
    }, [supabase]);

    if (user === undefined) {
        return (
            <div className="flex flex-col gap-6 pb-24 motion-safe:animate-pulse" role="status" aria-label="Cargando cuenta">
                <div className="mt-4 h-9 w-36 rounded-xl bg-white/9" />
                <div className="min-h-52 rounded-2xl border border-border bg-surface/60" />
            </div>
        );
    }

    if (!user) return <div className="product-panel rounded-2xl p-6 text-ink-muted">La sesión ya no está disponible.</div>;

    return (
        <div className="flex flex-col gap-6 pb-24">
            <h1 className="text-3xl font-black text-ink px-2 mt-4">Cuenta</h1>
            <ProfileClient initialUser={user} />
        </div>
    );
}
