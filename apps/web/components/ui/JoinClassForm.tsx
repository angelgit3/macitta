"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, BookOpen, Loader2, AlertCircle } from "lucide-react";

// Configuración de rate limiting — máximo 5 intentos, luego backoff de 60s
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minuto

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

    // Rate limiting state (no en React state para evitar re-renders innecesarios)
    const attemptsRef = useRef(0);
    const lockedUntilRef = useRef<number | null>(null);

    const isRateLimited = useCallback((): boolean => {
        if (lockedUntilRef.current !== null) {
            if (Date.now() < lockedUntilRef.current) {
                const secs = Math.ceil((lockedUntilRef.current - Date.now()) / 1000);
                setError(`Demasiados intentos. Espera ${secs} segundos antes de intentar de nuevo.`);
                return true;
            } else {
                // Lockout expirado — resetear
                lockedUntilRef.current = null;
                attemptsRef.current = 0;
            }
        }
        return false;
    }, []);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();
        if (!code.trim()) return;

        // SECURITY: Rate limiting en el cliente
        if (isRateLimited()) return;

        setLoading(true);
        setError(null);

        const { data: classroom } = await supabase
            .from("classrooms")
            .select("id")
            .eq("join_code", code.toUpperCase().trim())
            .single();

        if (!classroom) {
            attemptsRef.current += 1;
            if (attemptsRef.current >= MAX_ATTEMPTS) {
                lockedUntilRef.current = Date.now() + LOCKOUT_DURATION_MS;
                setError(`Código inválido. Has alcanzado el límite de intentos. Espera 60 segundos.`);
            } else {
                const remaining = MAX_ATTEMPTS - attemptsRef.current;
                setError(`Código inválido. Verifica con tu maestro. (${remaining} intentos restantes)`);
            }
            setLoading(false);
            return;
        }

        // Código válido — resetear contador de intentos
        attemptsRef.current = 0;

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
                        disabled={loading || (lockedUntilRef.current !== null && Date.now() < lockedUntilRef.current)}
                        className="flex-1 bg-void/50 border border-border-subtle rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-all uppercase tracking-widest font-bold placeholder:normal-case placeholder:tracking-normal placeholder:font-normal disabled:opacity-50"
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
            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}
