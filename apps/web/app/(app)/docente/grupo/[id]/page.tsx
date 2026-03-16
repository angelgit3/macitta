"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Users, Clock, Flame, Target, Loader2, Trash2,
    BookOpen, AlertTriangle, BarChart2, TrendingDown
} from "lucide-react";

type Classroom = { id: string; name: string; join_code: string };

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

type DayActivity = { date: string; reviews: number };
type DifficultCard = { card_id: string; question: string; avg_accuracy: number; review_count: number };

export default function ClassroomPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const supabase = createClient();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [activityData, setActivityData] = useState<DayActivity[]>([]);
    const [difficultCards, setDifficultCards] = useState<DifficultCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => { loadData(); }, [id]);

    async function loadData() {
        setLoading(true);

        // ── Classroom info ──────────────────────────────────────────
        const { data: cls } = await supabase
            .from("classrooms")
            .select("id, name, join_code")
            .eq("id", id)
            .single();
        if (!cls) { router.push("/docente"); return; }
        setClassroom(cls);

        // ── Members ─────────────────────────────────────────────────
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

        // ── Profiles ────────────────────────────────────────────────
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, email, avatar_url, streak_current")
            .in("id", studentIds);

        const profileMap: Record<string, any> = {};
        (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

        // ── Last sessions ────────────────────────────────────────────
        const { data: sessions } = await supabase
            .from("study_sessions")
            .select("user_id, started_at")
            .in("user_id", studentIds)
            .order("started_at", { ascending: false });

        const lastSessionMap: Record<string, string> = {};
        (sessions ?? []).forEach((s: any) => {
            if (!lastSessionMap[s.user_id]) lastSessionMap[s.user_id] = s.started_at;
        });

        // ── Study logs for stats ─────────────────────────────────────
        const { data: logs } = await supabase
            .from("study_logs")
            .select("user_id, accuracy, grade, review_date, card_id")
            .in("user_id", studentIds);

        // Per-student stats
        const statsMap: Record<string, { correctSum: number; count: number }> = {};
        (logs ?? []).forEach((l: any) => {
            if (!statsMap[l.user_id]) statsMap[l.user_id] = { count: 0, correctSum: 0 };
            statsMap[l.user_id].count++;
            statsMap[l.user_id].correctSum += (l.accuracy ?? 0);
        });

        // ── Build students array ─────────────────────────────────────
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

        // ── Activity chart: reviews per day, last 14 days ────────────
        const today = new Date();
        const days: DayActivity[] = [];
        const reviewCountByDate: Record<string, number> = {};

        (logs ?? []).forEach((l: any) => {
            const dateStr = l.review_date?.slice(0, 10);
            if (dateStr) reviewCountByDate[dateStr] = (reviewCountByDate[dateStr] ?? 0) + 1;
        });

        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            days.push({ date: dateStr, reviews: reviewCountByDate[dateStr] ?? 0 });
        }
        setActivityData(days);

        // ── Difficult cards: lowest avg accuracy with >2 reviews ─────
        const cardStatsMap: Record<string, { sum: number; count: number; question?: string }> = {};

        (logs ?? []).forEach((l: any) => {
            if (!l.card_id) return;
            if (!cardStatsMap[l.card_id]) cardStatsMap[l.card_id] = { sum: 0, count: 0 };
            cardStatsMap[l.card_id].sum += (l.accuracy ?? 0);
            cardStatsMap[l.card_id].count++;
        });

        // Fetch questions for cards that have enough reviews
        const difficultCardIds = Object.entries(cardStatsMap)
            .filter(([, v]) => v.count >= 3)
            .sort(([, a], [, b]) => (a.sum / a.count) - (b.sum / b.count))
            .slice(0, 8)
            .map(([id]) => id);

        if (difficultCardIds.length > 0) {
            const { data: cardData } = await supabase
                .from("cards")
                .select("id, question")
                .in("id", difficultCardIds);

            const cardQuestionMap: Record<string, string> = {};
            (cardData ?? []).forEach((c: any) => { cardQuestionMap[c.id] = c.question; });

            const difficult: DifficultCard[] = difficultCardIds.map(cid => ({
                card_id: cid,
                question: cardQuestionMap[cid] ?? "Desconocido",
                avg_accuracy: Math.round((cardStatsMap[cid].sum / cardStatsMap[cid].count)),
                review_count: cardStatsMap[cid].count,
            }));
            setDifficultCards(difficult);
        }

        setLoading(false);
    }

    async function removeStudent(studentId: string) {
        if (!confirm("¿Eliminar al alumno del grupo?")) return;
        await supabase.from("classroom_students").delete()
            .eq("classroom_id", id).eq("student_id", studentId);
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
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return d.toLocaleDateString("es-MX", { month: "short", day: "numeric" });
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-void">
            <Loader2 className="animate-spin text-text-dim" size={28} />
        </div>
    );

    const totalReviews = activityData.reduce((s, d) => s + d.reviews, 0);
    const maxReviews = Math.max(...activityData.map(d => d.reviews), 1);
    const avgPrecision = students.length > 0 && students.some(s => s.precision !== null)
        ? Math.round(students.filter(s => s.precision !== null)
            .reduce((sum, s) => sum + (s.precision ?? 0), 0)
            / students.filter(s => s.precision !== null).length)
        : null;
    const activeToday = students.filter(s => s.last_session && formatDate(s.last_session) === "Hoy").length;
    const todayStr = new Date().toISOString().slice(0, 10);

    return (
        <div className="min-h-screen bg-void p-6 pb-32">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back */}
                <Link href="/docente" className="inline-flex items-center gap-2 text-text-dim hover:text-white transition-colors text-sm">
                    <ArrowLeft size={16} /> Mis grupos
                </Link>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                        <button onClick={deleteClassroom} disabled={deleting}
                            className="p-2 text-text-dim hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Eliminar grupo">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Summary stats */}
                {students.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "Alumnos", value: students.length, color: "text-emerald-400" },
                            {
                                label: "Precisión prom.", color: avgPrecision !== null
                                    ? (avgPrecision >= 80 ? "text-green-400" : avgPrecision >= 60 ? "text-yellow-400" : "text-red-400")
                                    : "text-text-dim",
                                value: avgPrecision !== null ? `${avgPrecision}%` : "—"
                            },
                            { label: "Activos hoy", value: activeToday, color: "text-blue-400" },
                            { label: "Reviews (14d)", value: totalReviews, color: "text-purple-400" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-stone-surface border border-border-subtle rounded-2xl p-4 text-center">
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-[10px] uppercase tracking-wider text-text-dim mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Activity chart — only when there's data */}
                {students.length > 0 && totalReviews > 0 && (
                    <div className="bg-stone-surface border border-border-subtle rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart2 size={16} className="text-purple-400" />
                            <h2 className="text-sm font-semibold">Actividad del grupo — últimos 14 días</h2>
                        </div>
                        <p className="text-xs text-text-dim mb-4">{totalReviews} tarjetas revisadas en total</p>

                        <div className="flex items-end gap-1.5 h-28">
                            {activityData.map((day, i) => {
                                const heightPct = Math.round((day.reviews / maxReviews) * 100);
                                const isToday = day.date === todayStr;
                                const dayLabel = new Date(day.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "narrow" });
                                return (
                                    <div key={day.date} className="flex flex-col items-center gap-1 flex-1 group relative">
                                        {/* Tooltip */}
                                        {day.reviews > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-void border border-border-subtle rounded-lg px-2 py-0.5 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                {day.reviews} rev.
                                            </div>
                                        )}
                                        <div
                                            className={`w-full rounded-t-md transition-all duration-300 ${isToday
                                                ? "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                                : day.reviews > 0
                                                    ? "bg-purple-500/40 hover:bg-purple-500/60"
                                                    : "bg-white/5"
                                                }`}
                                            style={{ height: `${Math.max(heightPct, day.reviews > 0 ? 8 : 3)}%` }}
                                        />
                                        {/* Show label only every 2 days on mobile */}
                                        <span className={`text-[9px] ${isToday ? "text-purple-400 font-bold" : "text-text-dim"}`}>
                                            {i % 2 === 0 || isToday ? dayLabel : ""}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Difficult verbs */}
                {difficultCards.length > 0 && (
                    <div className="bg-stone-surface border border-border-subtle rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={16} className="text-red-400" />
                            <h2 className="text-sm font-semibold">Tarjetas más difíciles del grupo</h2>
                        </div>
                        <p className="text-xs text-text-dim mb-4">Mínimo 3 intentos en el grupo para aparecer aquí</p>

                        <div className="space-y-2">
                            {difficultCards.map((card) => (
                                <div key={card.card_id} className="flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{card.question}</p>
                                        <p className="text-xs text-text-dim">{card.review_count} intentos</p>
                                    </div>
                                    {/* Accuracy bar */}
                                    <div className="w-32 flex items-center gap-2 shrink-0">
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${card.avg_accuracy >= 80 ? "bg-green-400"
                                                    : card.avg_accuracy >= 60 ? "bg-yellow-400"
                                                        : "bg-red-400"
                                                    }`}
                                                style={{ width: `${card.avg_accuracy}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-bold w-8 text-right ${card.avg_accuracy >= 80 ? "text-green-400"
                                            : card.avg_accuracy >= 60 ? "text-yellow-400"
                                                : "text-red-400"
                                            }`}>
                                            {card.avg_accuracy}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Students table */}
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
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle">
                            <Users size={14} className="text-text-dim" />
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-dim">Alumnos inscritos</h2>
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr,60px,80px,100px,36px] gap-3 px-5 py-2 border-b border-border-subtle text-[10px] uppercase tracking-widest text-text-dim/60">
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

                                <div className="flex items-center gap-1 justify-center text-sm font-bold">
                                    <Flame size={13} className="text-orange-400" />
                                    <span>{s.streak_current}</span>
                                </div>

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

                                <div className="flex items-center gap-1 text-xs text-text-dim justify-center">
                                    <Clock size={12} />
                                    <span>{formatDate(s.last_session)}</span>
                                </div>

                                <button onClick={() => removeStudent(s.student_id)}
                                    className="text-text-dim hover:text-red-400 transition-colors p-1 flex justify-center"
                                    title="Eliminar del grupo">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* No activity notice */}
                {students.length > 0 && students.every(s => s.total_reviews === 0) && (
                    <div className="flex items-center gap-2 text-xs text-text-dim/60 p-3 bg-stone-surface/40 rounded-xl border border-border-subtle/50">
                        <AlertTriangle size={13} />
                        <span>Ningún alumno ha completado sesiones de estudio aún. Las analíticas aparecerán automáticamente cuando estudien.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
