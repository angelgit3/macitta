"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Clock, Flame, Target, Loader2, Trash2 } from "lucide-react";

type Classroom = {
    id: string;
    name: string;
    join_code: string;
};

type Student = {
    student_id: string;
    joined_at: string;
    profiles: {
        username: string;
        email: string;
        avatar_url: string;
        streak_current: number;
    };
    last_session: string | null;
    precision: number | null;
};

export default function ClassroomPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = createClient();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        // Load classroom info
        const { data: cls } = await supabase
            .from("classrooms")
            .select("id, name, join_code")
            .eq("id", id)
            .single();

        if (!cls) { router.push("/docente"); return; }
        setClassroom(cls);

        // Load students with their profiles + streak
        const { data: cs } = await supabase
            .from("classroom_students")
            .select(`
                student_id,
                joined_at,
                profiles!inner(username, email, avatar_url, streak_current)
            `)
            .eq("classroom_id", id)
            .order("joined_at", { ascending: false });

        if (cs) {
            // Fetch last session date and precision per student
            const enriched = await Promise.all(
                cs.map(async (row: any) => {
                    const { data: sessions } = await supabase
                        .from("study_sessions")
                        .select("started_at")
                        .eq("user_id", row.student_id)
                        .order("started_at", { ascending: false })
                        .limit(1);

                    const { data: logs } = await supabase
                        .from("study_logs")
                        .select("accuracy")
                        .eq("user_id", row.student_id);

                    const accuracy = logs && logs.length > 0
                        ? Math.round(logs.reduce((sum: number, l: any) => sum + (l.accuracy ?? 0), 0) / logs.length)
                        : null;

                    return {
                        ...row,
                        last_session: sessions?.[0]?.started_at ?? null,
                        precision: accuracy,
                    };
                })
            );
            setStudents(enriched);
        }
        setLoading(false);
    }

    async function removeStudent(studentId: string) {
        await supabase
            .from("classroom_students")
            .delete()
            .eq("classroom_id", id)
            .eq("student_id", studentId);
        setStudents(prev => prev.filter(s => s.student_id !== studentId));
    }

    function formatDate(date: string | null) {
        if (!date) return "—";
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Ayer";
        return `Hace ${diffDays} días`;
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-void">
            <Loader2 className="animate-spin text-text-dim" size={28} />
        </div>
    );

    return (
        <div className="min-h-screen bg-void p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <Link href="/docente" className="inline-flex items-center gap-2 text-text-dim hover:text-white transition-colors text-sm mb-4">
                        <ArrowLeft size={16} /> Mis grupos
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{classroom?.name}</h1>
                            <p className="text-text-dim text-sm mt-1">{students.length} {students.length === 1 ? "alumno inscrito" : "alumnos inscritos"}</p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end">
                            <p className="text-[10px] uppercase tracking-widest text-text-dim mb-0.5">Código de acceso</p>
                            <code className="text-2xl font-bold tracking-[0.3em] text-emerald-400">{classroom?.join_code}</code>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                {students.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto text-text-dim mb-4 opacity-30" />
                        <h3 className="font-semibold text-text-dim mb-2">Sin alumnos aún</h3>
                        <p className="text-sm text-text-dim/60">
                            Comparte el código <span className="text-emerald-400 font-bold">{classroom?.join_code}</span> con tus alumnos para que se unan.
                        </p>
                    </div>
                ) : (
                    <div className="bg-stone-surface border border-border-subtle rounded-2xl overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 border-b border-border-subtle text-[10px] uppercase tracking-widest text-text-dim">
                            <span>Alumno</span>
                            <span className="text-center">Racha</span>
                            <span className="text-center">Precisión</span>
                            <span className="text-center">Última sesión</span>
                            <span></span>
                        </div>

                        {students.map((s, i) => (
                            <div
                                key={s.student_id}
                                className={`grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 items-center px-5 py-4 ${i < students.length - 1 ? "border-b border-border-subtle/50" : ""} hover:bg-white/[0.02] transition-colors`}
                            >
                                {/* Student info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={s.profiles.avatar_url}
                                        alt={s.profiles.username}
                                        className="w-9 h-9 rounded-full shrink-0 bg-void"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{s.profiles.username}</p>
                                        <p className="text-xs text-text-dim truncate">{s.profiles.email}</p>
                                    </div>
                                </div>

                                {/* Streak */}
                                <div className="flex items-center gap-1 justify-center text-sm font-bold">
                                    <Flame size={14} className="text-orange-400" />
                                    <span>{s.profiles.streak_current}</span>
                                </div>

                                {/* Precision */}
                                <div className="flex items-center gap-1 justify-center text-sm font-medium">
                                    <Target size={14} className="text-blue-400" />
                                    <span className={s.precision !== null ? (s.precision >= 80 ? "text-green-400" : s.precision >= 60 ? "text-yellow-400" : "text-red-400") : "text-text-dim"}>
                                        {s.precision !== null ? `${s.precision}%` : "—"}
                                    </span>
                                </div>

                                {/* Last session */}
                                <div className="flex items-center gap-1.5 text-sm text-text-dim justify-center">
                                    <Clock size={13} />
                                    <span>{formatDate(s.last_session)}</span>
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => removeStudent(s.student_id)}
                                    className="text-text-dim hover:text-red-400 transition-colors p-1"
                                    title="Eliminar del grupo"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
