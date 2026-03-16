"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Clock, Flame, Target, Loader2, Trash2, BookOpen, AlertTriangle } from "lucide-react";

type Classroom = {
    id: string;
    name: string;
    join_code: string;
};

type Student = {
    student_id: string;
    joined_at: string;
    username: string;
    email: string;
    avatar_url: string;
    streak_current: number;
    last_session: string | null;
    precision: number | null;
    total_reviews: number;
};

export default function ClassroomPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = createClient();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        setLoading(true);

        // Load classroom info
        const { data: cls } = await supabase
            .from("classrooms")
            .select("id, name, join_code")
            .eq("id", id)
            .single();

        if (!cls) { router.push("/docente"); return; }
        setClassroom(cls);

        // Load student memberships
        const { data: members } = await supabase
            .from("classroom_students")
            .select("student_id, joined_at")
            .eq("classroom_id", id)
            .order("joined_at", { ascending: false });

        if (!members || members.length === 0) {
            setStudents([]);
            setLoading(false);
            return;
        }

        const studentIds = members.map((m: any) => m.student_id);

        // Load profiles for those students
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, email, avatar_url, streak_current")
            .in("id", studentIds);

        // Load last session per student (most recent started_at)
        const { data: sessions } = await supabase
            .from("study_sessions")
            .select("user_id, started_at")
            .in("user_id", studentIds)
            .order("started_at", { ascending: false });

        // Build a map: student_id -> latest session
        const lastSessionMap: Record<string, string> = {};
        (sessions ?? []).forEach((s: any) => {
            if (!lastSessionMap[s.user_id]) {
                lastSessionMap[s.user_id] = s.started_at;
            }
        });

        // Load accuracy from study_logs
        const { data: logs } = await supabase
            .from("study_logs")
            .select("user_id, accuracy, grade")
            .in("user_id", studentIds);

        // Calculate per-student precision and total reviews
        const statsMap: Record<string, { total: number; correctSum: number; count: number }> = {};
        (logs ?? []).forEach((l: any) => {
            if (!statsMap[l.user_id]) statsMap[l.user_id] = { total: 0, correctSum: 0, count: 0 };
            statsMap[l.user_id].count++;
            statsMap[l.user_id].correctSum += (l.accuracy ?? 0);
        });

        const profileMap: Record<string, any> = {};
        (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

        const enriched: Student[] = members.map((m: any) => {
            const profile = profileMap[m.student_id] ?? {};
            const stats = statsMap[m.student_id];
            const precision = stats && stats.count > 0
                ? Math.round(stats.correctSum / stats.count)
                : null;
            return {
                student_id: m.student_id,
                joined_at: m.joined_at,
                username: profile.username ?? "—",
                email: profile.email ?? "—",
                avatar_url: profile.avatar_url ?? "",
                streak_current: profile.streak_current ?? 0,
                last_session: lastSessionMap[m.student_id] ?? null,
                precision,
                total_reviews: stats?.count ?? 0,
            };
        });

        setStudents(enriched);
        setLoading(false);
    }

    async function removeStudent(studentId: string) {
        if (!confirm("¿Eliminar al alumno del grupo?")) return;
        await supabase
            .from("classroom_students")
            .delete()
            .eq("classroom_id", id)
            .eq("student_id", studentId);
        setStudents(prev => prev.filter(s => s.student_id !== studentId));
    }

    async function deleteClassroom() {
        if (!confirm(`¿Eliminar el grupo "${classroom?.name}"? Esta acción no se puede deshacer.`)) return;
        setDeleting(true);
        await supabase.from("classrooms").delete().eq("id", id);
        router.push("/docente");
    }

    function formatDate(date: string | null) {
        if (!date) return "—";
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-void">
            <Loader2 className="animate-spin text-text-dim" size={28} />
        </div>
    );

    const avgPrecision = students.length > 0
        ? Math.round(students.filter(s => s.precision !== null).reduce((sum, s) => sum + (s.precision ?? 0), 0)
            / (students.filter(s => s.precision !== null).length || 1))
        : null;

    const activeToday = students.filter(s =>
        s.last_session && formatDate(s.last_session) === "Hoy"
    ).length;

    return (
        <div className="min-h-screen bg-void p-6 pb-32">
            <div className="max-w-4xl mx-auto">

                {/* Back link */}
                <Link href="/docente" className="inline-flex items-center gap-2 text-text-dim hover:text-white transition-colors text-sm mb-6">
                    <ArrowLeft size={16} /> Mis grupos
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{classroom?.name}</h1>
                        <p className="text-text-dim text-sm mt-1">
                            {students.length} {students.length === 1 ? "alumno inscrito" : "alumnos inscritos"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] uppercase tracking-widest text-text-dim mb-0.5">Código de acceso</p>
                            <code className="text-2xl font-bold tracking-[0.3em] text-emerald-400">{classroom?.join_code}</code>
                        </div>
                        <button
                            onClick={deleteClassroom}
                            disabled={deleting}
                            className="p-2 text-text-dim hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Eliminar grupo"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats summary row */}
                {students.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-emerald-400">{students.length}</div>
                            <div className="text-[10px] uppercase tracking-wider text-text-dim mt-1">Alumnos</div>
                        </div>
                        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 text-center">
                            <div className={`text-2xl font-bold ${avgPrecision !== null ? (avgPrecision >= 80 ? "text-green-400" : avgPrecision >= 60 ? "text-yellow-400" : "text-red-400") : "text-text-dim"}`}>
                                {avgPrecision !== null ? `${avgPrecision}%` : "—"}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-text-dim mt-1">Precisión prom.</div>
                        </div>
                        <div className="bg-stone-surface border border-border-subtle rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{activeToday}</div>
                            <div className="text-[10px] uppercase tracking-wider text-text-dim mt-1">Activos hoy</div>
                        </div>
                    </div>
                )}

                {/* Students Table */}
                {students.length === 0 ? (
                    <div className="text-center py-20 bg-stone-surface/50 rounded-2xl border border-border-subtle border-dashed">
                        <Users size={48} className="mx-auto text-text-dim mb-4 opacity-30" />
                        <h3 className="font-semibold text-text-dim mb-2">Sin alumnos aún</h3>
                        <p className="text-sm text-text-dim/60">
                            Comparte el código{" "}
                            <span className="text-emerald-400 font-bold tracking-widest">{classroom?.join_code}</span>
                            {" "}con tus alumnos.
                        </p>
                    </div>
                ) : (
                    <div className="bg-stone-surface border border-border-subtle rounded-2xl overflow-hidden">
                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr,60px,80px,100px,36px] gap-3 px-5 py-3 border-b border-border-subtle text-[10px] uppercase tracking-widest text-text-dim">
                            <span>Alumno</span>
                            <span className="text-center">Racha</span>
                            <span className="text-center">Precisión</span>
                            <span className="text-center">Últ. sesión</span>
                            <span></span>
                        </div>

                        {students.map((s, i) => (
                            <div
                                key={s.student_id}
                                className={`grid grid-cols-[1fr,60px,80px,100px,36px] gap-3 items-center px-5 py-4 ${i < students.length - 1 ? "border-b border-border-subtle/40" : ""} hover:bg-white/[0.02] transition-colors`}
                            >
                                {/* Student info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    {s.avatar_url ? (
                                        <img src={s.avatar_url} alt={s.username} className="w-9 h-9 rounded-full shrink-0 bg-void" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <BookOpen size={14} className="text-emerald-400" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{s.username}</p>
                                        <p className="text-xs text-text-dim truncate">{s.email}</p>
                                    </div>
                                </div>

                                {/* Streak */}
                                <div className="flex items-center gap-1 justify-center text-sm font-bold">
                                    <Flame size={13} className="text-orange-400" />
                                    <span>{s.streak_current}</span>
                                </div>

                                {/* Precision */}
                                <div className="flex items-center gap-1 justify-center text-sm font-medium">
                                    <Target size={13} className="text-blue-400" />
                                    <span className={
                                        s.precision !== null
                                            ? s.precision >= 80 ? "text-green-400"
                                                : s.precision >= 60 ? "text-yellow-400"
                                                    : "text-red-400"
                                            : "text-text-dim"
                                    }>
                                        {s.precision !== null ? `${s.precision}%` : "—"}
                                    </span>
                                </div>

                                {/* Last session */}
                                <div className="flex items-center gap-1 text-xs text-text-dim justify-center">
                                    <Clock size={12} />
                                    <span>{formatDate(s.last_session)}</span>
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => removeStudent(s.student_id)}
                                    className="text-text-dim hover:text-red-400 transition-colors p-1 flex justify-center"
                                    title="Eliminar del grupo"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* No-data notice */}
                {students.length > 0 && students.every(s => s.total_reviews === 0) && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-text-dim/60 p-3 bg-stone-surface/40 rounded-xl border border-border-subtle/50">
                        <AlertTriangle size={13} />
                        <span>Ningún alumno ha completado sesiones de estudio aún. Los datos de precisión aparecerán aquí cuando estudien.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
