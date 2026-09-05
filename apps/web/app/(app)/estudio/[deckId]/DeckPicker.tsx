"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Layers, Loader2, Play, WifiOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
    countRemainingDueGlobal,
    listDecksWithDueCounts,
    type DeckDueInfo,
} from "@/lib/studyCardLoader";

interface DeckPickerProps {
    /** Called with the selected deck ids; an empty array means "all decks". */
    onConfirm: (deckIds: string[]) => void;
}

/**
 * DeckPicker — pre-session screen for global study.
 * Lets the user narrow the session to specific decks so subjects don't mix.
 */
export function DeckPicker({ onConfirm }: DeckPickerProps) {
    // undefined = loading, null = offline/error fallback, array = ready
    const [decks, setDecks] = useState<DeckDueInfo[] | null | undefined>(undefined);
    const [offlineTotal, setOfflineTotal] = useState<number>(0);
    const [allSelected, setAllSelected] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        let mounted = true;
        (async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            const userId = data.session?.user.id ?? null;

            const list = await listDecksWithDueCounts(userId);
            if (!mounted) return;

            if (list) {
                setDecks(list);
            } else {
                setDecks(null);
                if (userId) setOfflineTotal(await countRemainingDueGlobal(userId));
            }
        })();
        return () => { mounted = false; };
    }, []);

    const totalDue = useMemo(
        () => (decks ?? []).reduce((sum, d) => sum + d.dueCount, 0),
        [decks],
    );

    const toggleDeck = (id: string) => {
        setAllSelected(false);
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setAllSelected(true);
        setSelected(new Set());
    };

    const canStart = allSelected || selected.size > 0;
    const start = () => onConfirm(allSelected ? [] : [...selected]);

    // ── Loading ──────────────────────────────────────────────
    if (decks === undefined) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-ink-faint">
                <Loader2 className="animate-spin w-8 h-8 text-accent" />
                <p className="text-sm font-medium">Buscando tus mazos...</p>
            </div>
        );
    }

    // ── Offline / error fallback: study everything ───────────
    if (decks === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6 px-6 text-center animate-card-in">
                <WifiOff size={32} className="text-ink-faint" />
                <div>
                    <h1 className="text-2xl font-black text-ink">Modo sin conexión</h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        No pude cargar la lista de mazos, pero tus tarjetas locales están listas.
                    </p>
                </div>
                <button
                    onClick={() => onConfirm([])}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent px-8 font-black text-void transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-[0.985]"
                >
                    <Play size={20} /> Estudiar todo ({offlineTotal})
                </button>
            </div>
        );
    }

    // ── Nothing due anywhere ─────────────────────────────────
    if (totalDue === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6 px-6 text-center animate-card-in">
                <Layers size={32} className="text-ink-faint" />
                <div>
                    <h1 className="text-2xl font-black text-ink">Todo al día</h1>
                    <p className="mt-2 text-sm text-ink-muted">
                        No tienes tarjetas pendientes en ningún mazo.
                    </p>
                </div>
                <Link
                    href="/vocabulario"
                    className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-8 font-black text-ink transition-colors hover:border-accent"
                >
                    Ir a mis mazos
                </Link>
            </div>
        );
    }

    // ── Picker ───────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-24 animate-card-in">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-ink tracking-tight">¿Qué estudiamos hoy?</h1>
                <p className="text-sm text-ink-muted">
                    {totalDue} {totalDue === 1 ? "tarjeta pendiente" : "tarjetas pendientes"} en total
                </p>
            </div>

            <div className="grid gap-3">
                {/* All decks */}
                <button
                    onClick={selectAll}
                    className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 active:scale-[0.99] ${
                        allSelected
                            ? "border-accent bg-accent/10 shadow-[0_0_0_3px_rgba(124,133,232,0.12)]"
                            : "border-border bg-surface hover:border-accent/40"
                    }`}
                >
                    <span className="flex items-center gap-3">
                        <Layers size={20} className={allSelected ? "text-accent" : "text-ink-faint"} />
                        <span className="font-black text-ink">Todo mezclado</span>
                    </span>
                    <span className="flex items-center gap-3">
                        <span className="text-xs font-bold text-ink-faint">{totalDue}</span>
                        {allSelected && <Check size={18} className="text-accent" />}
                    </span>
                </button>

                <div className="flex items-center gap-3 px-1 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    <span className="h-px flex-1 bg-border" />
                    o elige mazos
                    <span className="h-px flex-1 bg-border" />
                </div>

                {/* Individual decks */}
                {decks.map(deck => {
                    const isSelected = selected.has(deck.id);
                    const isEmpty = deck.dueCount === 0;
                    return (
                        <button
                            key={deck.id}
                            onClick={() => !isEmpty && toggleDeck(deck.id)}
                            disabled={isEmpty}
                            className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                                isEmpty
                                    ? "border-border/50 bg-surface/40 opacity-45 cursor-not-allowed"
                                    : isSelected
                                        ? "border-accent bg-accent/10 shadow-[0_0_0_3px_rgba(124,133,232,0.12)] active:scale-[0.99]"
                                        : "border-border bg-surface hover:border-accent/40 active:scale-[0.99]"
                            }`}
                        >
                            <span className="flex items-center gap-3 min-w-0">
                                <span
                                    className="h-3 w-3 shrink-0 rounded-full"
                                    style={{ backgroundColor: deck.color || "var(--accent)" }}
                                />
                                <span className="truncate font-bold text-ink">{deck.title}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-3">
                                <span className="text-xs font-bold text-ink-faint">
                                    {isEmpty ? "Al día" : deck.dueCount}
                                </span>
                                {isSelected && <Check size={18} className="text-accent" />}
                            </span>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={start}
                disabled={!canStart}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent font-black text-void transition-[background-color,transform] duration-200 hover:bg-accent-hover active:scale-[0.985] disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Play size={20} />
                Comenzar ({allSelected ? totalDue : decks.filter(d => selected.has(d.id)).reduce((s, d) => s + d.dueCount, 0)})
            </button>
        </div>
    );
}
