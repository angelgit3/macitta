"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, BookOpen, Loader2 } from "lucide-react";

interface JoinClassFormProps {
    /** Called after successfully joining a class */
    onJoined?: () => void;
}

export function JoinClassForm({ onJoined }: JoinClassFormProps) {
    const supabase = useMemo(() => createClient(), []);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setError(null);

        const { data: classroom } = await supabase
            .from("classrooms")
            .select("id")
            .eq("join_code", code.toUpperCase().trim())
            .single();

        if (!classroom) {
            setError("Código inválido. Verifica con tu maestro.");
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { error: insertErr } = await supabase
            .from("classroom_students")
            .insert({ classroom_id: classroom.id, student_id: user.id });

        if (insertErr?.code === "23505") {
            setError("Ya estás inscrito en ese grupo.");
        } else if (insertErr) {
            setError("No se pudo unir al grupo. Intenta de nuevo.");
        } else {
            setSuccess(true);
            setCode("");
            onJoined?.();
            setTimeout(() => setSuccess(false), 3000);
        }
        setLoading(false);
    }

    return (
        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
                <Users size={16} className="text-emerald-400" />
                <span>Unirme a una clase</span>
            </div>
            {success ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                    <BookOpen size={16} />
                    ¡Te uniste al grupo exitosamente!
                </div>
            ) : (
                <form onSubmit={handleJoin} className="flex gap-2">
                    <input
                        value={code}
                        onChange={e => { setCode(e.target.value); setError(null); }}
                        placeholder="Código del maestro"
                        maxLength={6}
                        className="flex-1 bg-void/50 border border-border-subtle rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-all uppercase tracking-widest font-bold placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                    />
                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : "Unirme"}
                    </button>
                </form>
            )}
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
    );
}
