"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";
import { deleteDeck } from "@/app/actions/decks";
import { useRouter } from "next/navigation";

export function DeleteDeckModal({ deckId, deckTitle, onClose }: { deckId: string; deckTitle: string; onClose: () => void }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleDelete() {
        setSaving(true);
        setError(null);

        try {
            await deleteDeck(deckId);
            router.push('/vocabulario'); // Redirect to decks dashboard
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al eliminar mazo");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="w-full max-w-sm bg-surface border border-danger/30 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-ink">Eliminar Mazo</h2>
                        <p className="text-sm font-semibold text-ink/80 pb-2">&quot;{deckTitle}&quot;</p>
                        
                        <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 text-left">
                            <p className="text-xs text-red-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <AlertCircle size={14} /> Atención: Acción Irreversible
                            </p>
                            <p className="text-sm text-ink-faint leading-relaxed">
                                Al eliminar este mazo, <strong className="text-ink">se borrarán todas sus tarjetas</strong> y el <strong className="text-ink">progreso de estudio</strong> de todos los estudiantes asignados.
                            </p>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="flex items-center gap-3 w-full pt-4">
                        <button
                            onClick={onClose}
                            disabled={saving}
                            className="flex flex-1 items-center justify-center rounded-xl border border-border bg-void/50 py-3.5 text-sm font-bold text-ink transition-colors hover:bg-void disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-3.5 text-sm font-bold text-void transition-colors hover:bg-danger/90 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <>Eliminar <Trash2 size={18} /></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
