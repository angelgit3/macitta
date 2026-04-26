"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { createDeck } from "@/app/actions/decks";
import { useRouter } from "next/navigation";

export function CreateDeckDialog({ onClose }: { onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        setError(null);

        try {
            await createDeck(title, description);
            router.refresh(); // Refresh to update list
            onClose();
        } catch (err: any) {
            setError(err.message || "Error al crear el mazo");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                    <h2 className="text-xl font-black text-white">Nuevo Mazo</h2>
                    <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="p-5 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">
                            Ttulo
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Vocabulario B1"
                            autoFocus
                            maxLength={50}
                            className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1">
                            Descripcin (Opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripcin del mazo..."
                            maxLength={200}
                            rows={3}
                            className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-accent-focus transition-colors text-sm resize-none"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={saving || !title.trim()}
                            className="w-full py-3.5 bg-accent-focus text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-accent-focus/90 transition-colors disabled:opacity-50 text-sm"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <>Crear Mazo <Plus size={18} /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
