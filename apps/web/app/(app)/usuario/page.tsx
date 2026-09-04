"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { User } from "@supabase/supabase-js";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// Profile management loads account, sync and offline tooling as a deferred
// chunk; the account header paints first.
const ProfileClient = dynamic(
    () => import("./ProfileClient").then((m) => m.ProfileClient),
    { ssr: false, loading: () => <PracticeSkeleton label="tu cuenta" /> },
);

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>();

    useEffect(() => {
        let active = true;

        // The Supabase browser client (and its deps) load as a deferred chunk
        // so this shell stays in the light shared bundle.
        void import("@/utils/supabase/client")
            .then((mod) => mod.createClient().auth.getSession())
            .then(({ data }) => {
                if (active) setUser(data.session?.user ?? null);
            });

        return () => {
            active = false;
        };
    }, []);

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
            <header className="pt-2 sm:pt-4">
                <p className="text-sm font-bold text-accent">Configuración</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-ink sm:text-4xl">Cuenta</h1>
            </header>
            <ProfileClient initialUser={user} />
        </div>
    );
}
