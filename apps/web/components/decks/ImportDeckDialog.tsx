"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { importDeckFromJson } from "@/app/actions/decks-import";
import { useRouter } from "next/navigation";

export function ImportDeckDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
    const [jsonInput, setJsonInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!jsonInput.trim()) return;

        setLoading(true);
        try {
            const res = await importDeckFromJson(jsonInput);
            if (res.success) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.refresh();
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message || "Error importing deck.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                    <h2 className="text-xl font-black text-white">Importar Mazo (JSON)</h2>
                    <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleImport} className="p-5 space-y-4 flex-1 overflow-y-auto">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col h-full">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-dim/60 ml-1 mb-2">Pegue el JSON aquí</label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full bg-void/50 border border-border-subtle rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-accent-focus text-sm font-mono flex-1 min-h-[300px] resize-none"
                            placeholder='{"deck": { "name": "..." }, "cards": [...] }'
                            spellCheck={false}
                        />
                    </div>
                </form>
                <div className="p-5 border-t border-border-subtle">
                    <button 
                        onClick={handleImport}
                        disabled={loading || !jsonInput.trim()} 
                        className="w-full py-3.5 bg-accent-focus text-white font-bold rounded-2xl disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Importar Mazo"}
                    </button>
                </div>
            </div>
        </div>
    );
}
