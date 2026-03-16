"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { PlusCircle, BookOpen, Users, Clock, ChevronRight, Loader2 } from "lucide-react";

type Classroom = {
    id: string;
    name: string;
    join_code: string;
    created_at: string;
    student_count: number;
};

export default function DocentePage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [showForm, setShowForm] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadClassrooms();
    }, []);

    async function loadClassrooms() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Query 1: Fetch classrooms
        const { data: rooms, error } = await supabase
            .from("classrooms")
            .select("id, name, join_code, created_at")
            .eq("teacher_id", user.id)
            .order("created_at", { ascending: false });

        if (error || !rooms) { setLoading(false); return; }

        // Query 2: Fetch student counts separately to avoid RLS recursion
        const { data: counts } = await supabase
            .from("classroom_students")
            .select("classroom_id");

        const countMap: Record<string, number> = {};
        (counts ?? []).forEach((r: any) => {
            countMap[r.classroom_id] = (countMap[r.classroom_id] ?? 0) + 1;
        });

        setClassrooms(
            rooms.map((c: any) => ({
                ...c,
                student_count: countMap[c.id] ?? 0,
            }))
        );
        setLoading(false);
    }

    function generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const join_code = generateCode();

        const { error } = await supabase.from("classrooms").insert({
            teacher_id: user.id,
            name: newName.trim(),
            join_code,
        });

        if (!error) {
            setNewName("");
            setShowForm(false);
            await loadClassrooms();
        }
        setCreating(false);
    }

    return (
        <div className="min-h-screen bg-void p-6 pb-28">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <BookOpen className="text-emerald-400" size={28} />
                            Portal Docente
                        </h1>
                        <p className="text-text-dim mt-1 text-sm">Gestiona tus grupos y monitorea el progreso de tus alumnos.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/25 transition-colors font-medium text-sm"
                    >
                        <PlusCircle size={16} />
                        Nuevo Grupo
                    </button>
                </div>

                {/* Create Group Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="mb-6 p-5 bg-stone-surface border border-emerald-500/20 rounded-2xl">
                        <h3 className="font-semibold mb-3 text-emerald-400 text-sm uppercase tracking-wider">Crear nuevo grupo</h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Ej: Inglés Intermedio 4A"
                                className="flex-1 bg-void/50 border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition-all"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={creating || !newName.trim()}
                                className="px-5 py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
                            >
                                {creating ? <Loader2 className="animate-spin" size={16} /> : "Crear"}
                            </button>
                        </div>
                        <p className="text-xs text-text-dim mt-2">Se generará un código de 6 dígitos que tus alumnos usarán para unirse.</p>
                    </form>
                )}

                {/* Classrooms Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-text-dim" size={28} />
                    </div>
                ) : classrooms.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen size={48} className="mx-auto text-text-dim mb-4 opacity-30" />
                        <h3 className="font-semibold text-text-dim mb-2">Sin grupos por ahora</h3>
                        <p className="text-sm text-text-dim/60">Crea tu primer grupo para empezar a monitorear alumnos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {classrooms.map((c) => (
                            <Link
                                key={c.id}
                                href={`/docente/grupo/${c.id}`}
                                className="group block p-5 bg-stone-surface border border-border-subtle rounded-2xl hover:border-emerald-500/30 hover:bg-stone-surface/80 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                                    <ChevronRight size={18} className="text-text-dim group-hover:text-emerald-400 transition-colors mt-0.5 shrink-0" />
                                </div>

                                <div className="flex items-center gap-4 text-sm text-text-dim">
                                    <span className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        {c.student_count} {c.student_count === 1 ? "alumno" : "alumnos"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {new Date(c.created_at).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                                    </span>
                                </div>

                                {/* Join Code */}
                                <div className="mt-4 pt-4 border-t border-border-subtle">
                                    <p className="text-[10px] uppercase tracking-widest text-text-dim mb-1">Código de acceso</p>
                                    <code className="text-lg font-bold tracking-[0.3em] text-emerald-400">{c.join_code}</code>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
