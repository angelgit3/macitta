"use client";

import { useState } from "react";
import { Loader2, Users, X, Link as LinkIcon, Unlink } from "lucide-react";
import { assignDeckToClassroom, unassignDeckFromClassroom } from "@/app/actions/decks";
import { useRouter } from "next/navigation";
import type { Classroom } from "@/types/models";

export function AssignToClassroomDialog({ 
    deckId, 
    classrooms, 
    assignedClassroomIds,
    onClose 
}: { 
    deckId: string;
    classrooms: Classroom[];
    assignedClassroomIds: string[];
    onClose: () => void;
}) {
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleToggleAssignment(classroomId: string, isAssigned: boolean) {
        setSavingId(classroomId);
        setError(null);

        try {
            if (isAssigned) {
                await unassignDeckFromClassroom(deckId, classroomId);
            } else {
                await assignDeckToClassroom(deckId, classroomId);
            }
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Error al actualizar asignación");
        } finally {
            setSavingId(null);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-stone-surface border border-border-subtle rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Users size={20} className="text-accent-focus" /> Asignar a Clase
                    </h2>
                    <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {classrooms.length === 0 ? (
                        <p className="text-sm text-text-dim text-center py-6">
                            No administras ninguna clase todavía.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-text-dim/80 pb-2">Selecciona las clases a las que deseas asignar este mazo.</p>
                            
                            {classrooms.map(c => {
                                const isAssigned = assignedClassroomIds.includes(c.id);
                                const isSaving = savingId === c.id;

                                return (
                                    <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-void/50 border border-border-subtle">
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{c.name}</h3>
                                            <p className="text-xs text-text-dim uppercase tracking-widest font-mono">
                                                Cdigo: {c.join_code}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleAssignment(c.id, isAssigned)}
                                            disabled={isSaving}
                                            className={`p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                                                ${isAssigned 
                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                }`}
                                        >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 
                                                isAssigned ? <><Unlink size={16} /> Quitar</> : <><LinkIcon size={16} /> Asignar</>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                </div>
            </div>
        </div>
    );
}
