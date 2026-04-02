"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { JoinClassForm } from "@/components/ui/JoinClassForm";
import {
    Users, Trophy, Loader2, LogOut,
    BookOpen, GraduationCap, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";

type MyClass = {
    classroom_id: string;
    name: string;
    join_code: string;
    teacher_name: string;
    joined_at: string;
    student_count: number;
};

type ClassRankEntry = {
    student_id: string;
    username: string;
    precision: number | null;
    streak_current: number;
    total_reviews: number;
};

export function MisClasesClient({ userId }: { userId: string }) {
    const supabase = useMemo(() => createClient(), []);
    const [classes, setClasses] = useState<MyClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rankingData, setRankingData] = useState<Record<string, ClassRankEntry[]>>({});
    const [rankingLoading, setRankingLoading] = useState<string | null>(null);
    const [leavingId, setLeavingId] = useState<string | null>(null);
    const [confirmLeaveId, setConfirmLeaveId] = useState<string | null>(null);



    useEffect(() => { loadClasses(); }, []);

    async function loadClasses() {
        setLoading(true);

        // 1. Get all classroom_ids for this student
        const { data: memberships } = await supabase
            .from("classroom_students")
            .select("classroom_id, joined_at")
            .eq("student_id", userId);

        if (!memberships || memberships.length === 0) {
            setClasses([]);
            setLoading(false);
            return;
        }

        const classIds = memberships.map(m => m.classroom_id);

        // 2. Fetch classrooms, then teachers + member counts in parallel
        const { data: classrooms } = await supabase
            .from("classrooms")
            .select("id, name, join_code, teacher_id")
            .in("id", classIds);

        if (!classrooms) { setClasses([]); setLoading(false); return; }

        const teacherIds = [...new Set(classrooms.map(c => c.teacher_id))];

        const [teachersRes, membersRes] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, username, full_name, email")
                .in("id", teacherIds),
            supabase
                .from("classroom_students")
                .select("classroom_id")
                .in("classroom_id", classIds),
        ]);

        const countMap: Record<string, number> = {};
        membersRes.data?.forEach(m => {
            countMap[m.classroom_id] = (countMap[m.classroom_id] || 0) + 1;
        });

        const teacherMap: Record<string, string> = {};
        teachersRes.data?.forEach(t => {
            teacherMap[t.id] = t.username || t.full_name || t.email || "Maestro";
        });

        const membershipMap: Record<string, string> = {};
        memberships.forEach(m => {
            membershipMap[m.classroom_id] = m.joined_at;
        });

        const result: MyClass[] = classrooms.map(c => ({
            classroom_id: c.id,
            name: c.name,
            join_code: c.join_code,
            teacher_name: teacherMap[c.teacher_id] || "Maestro",
            joined_at: membershipMap[c.id],
            student_count: countMap[c.id] || 0,
        }));

        setClasses(result);
        setLoading(false);
    }

    async function loadRanking(classroomId: string) {
        if (rankingData[classroomId]) return; // cached
        setRankingLoading(classroomId);

        // Get all students in this classroom
        const { data: members } = await supabase
            .from("classroom_students")
            .select("student_id")
            .eq("classroom_id", classroomId);

        if (!members || members.length === 0) {
            setRankingData(prev => ({ ...prev, [classroomId]: [] }));
            setRankingLoading(null);
            return;
        }

        const studentIds = members.map(m => m.student_id);

        // Get profiles + study_logs in parallel
        const [profilesRes, logsRes] = await Promise.all([
            supabase
                .from("profiles")
                .select("id, username, streak_current")
                .in("id", studentIds),
            supabase
                .from("study_logs")
                .select("user_id, accuracy")
                .in("user_id", studentIds),
        ]);

        const profiles = profilesRes.data;
        const logs = logsRes.data;

        // Calculate precision per student
        const precisionMap: Record<string, { sum: number; count: number }> = {};
        const reviewCountMap: Record<string, number> = {};
        logs?.forEach(l => {
            if (!precisionMap[l.user_id]) precisionMap[l.user_id] = { sum: 0, count: 0 };
            precisionMap[l.user_id].sum += l.accuracy;
            precisionMap[l.user_id].count += 1;
            reviewCountMap[l.user_id] = (reviewCountMap[l.user_id] || 0) + 1;
        });

        const ranking: ClassRankEntry[] = (profiles || []).map(p => ({
            student_id: p.id,
            username: p.username || "Sin nombre",
            precision: precisionMap[p.id]
                ? Math.round((precisionMap[p.id].sum / precisionMap[p.id].count) * 100)
                : null,
            streak_current: p.streak_current || 0,
            total_reviews: reviewCountMap[p.id] || 0,
        }));

        // Sort by precision desc, then streak desc
        ranking.sort((a, b) => {
            const pa = a.precision ?? -1;
            const pb = b.precision ?? -1;
            if (pb !== pa) return pb - pa;
            return b.streak_current - a.streak_current;
        });

        setRankingData(prev => ({ ...prev, [classroomId]: ranking }));
        setRankingLoading(null);
    }

    function toggleExpand(classroomId: string) {
        if (expandedId === classroomId) {
            setExpandedId(null);
        } else {
            setExpandedId(classroomId);
            loadRanking(classroomId);
        }
    }

    async function leaveClass(classroomId: string) {
        setLeavingId(classroomId);
        const { error } = await supabase
            .from("classroom_students")
            .delete()
            .eq("classroom_id", classroomId)
            .eq("student_id", userId);

        if (error) {
            console.error("[MisClases] Error leaving class:", error);
        } else {
            setClasses(prev => prev.filter(c => c.classroom_id !== classroomId));
        }
        setConfirmLeaveId(null);
        setLeavingId(null);
    }



    function getMyRank(classroomId: string): number | null {
        const ranking = rankingData[classroomId];
        if (!ranking) return null;
        const idx = ranking.findIndex(r => r.student_id === userId);
        return idx >= 0 ? idx + 1 : null;
    }

    function formatDate(d: string | null) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-accent-focus mb-3" size={28} />
                <p className="text-sm text-text-dim">Cargando clases...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black">Mis Clases</h1>
                <p className="text-sm text-text-dim mt-1">Grupos a los que perteneces</p>
            </div>

            {/* Join a class */}
            <JoinClassForm onJoined={loadClasses} />

            {/* Empty state */}
            {classes.length === 0 && (
                <div className="text-center py-16 bg-stone-surface/50 rounded-2xl border border-border-subtle border-dashed">
                    <GraduationCap size={48} className="mx-auto text-text-dim mb-4 opacity-30" />
                    <h3 className="font-semibold text-text-dim mb-2">No estás en ninguna clase</h3>
                    <p className="text-sm text-text-dim/60">
                        Pídele el código a tu maestro y úsalo arriba para unirte.
                    </p>
                </div>
            )}

            {/* Classes list */}
            {classes.map(cls => {
                const isExpanded = expandedId === cls.classroom_id;
                const ranking = rankingData[cls.classroom_id];
                const myRank = getMyRank(cls.classroom_id);
                const isLoadingRank = rankingLoading === cls.classroom_id;

                return (
                    <div key={cls.classroom_id}
                        className="bg-stone-surface border border-border-subtle rounded-2xl overflow-hidden">

                        {/* Class header */}
                        <button
                            onClick={() => toggleExpand(cls.classroom_id)}
                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="w-12 h-12 rounded-xl bg-accent-focus/15 flex items-center justify-center shrink-0">
                                <BookOpen size={20} className="text-accent-focus" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base truncate">{cls.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-text-dim mt-0.5">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap size={11} />
                                        {cls.teacher_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={11} />
                                        {cls.student_count}
                                    </span>
                                </div>
                            </div>
                            {isExpanded
                                ? <ChevronUp size={18} className="text-text-dim shrink-0" />
                                : <ChevronDown size={18} className="text-text-dim shrink-0" />
                            }
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                            <div className="border-t border-border-subtle">
                                {/* Class info strip */}
                                <div className="grid grid-cols-3 divide-x divide-border-subtle">
                                    <div className="py-3 text-center">
                                        <div className="text-xs text-text-dim/60 mb-0.5">Código</div>
                                        <div className="text-sm font-bold tracking-widest text-emerald-400">
                                            {cls.join_code}
                                        </div>
                                    </div>
                                    <div className="py-3 text-center">
                                        <div className="text-xs text-text-dim/60 mb-0.5">Inscrito</div>
                                        <div className="text-sm font-medium">{formatDate(cls.joined_at)}</div>
                                    </div>
                                    <div className="py-3 text-center">
                                        <div className="text-xs text-text-dim/60 mb-0.5">Mi puesto</div>
                                        <div className="text-sm font-bold">
                                            {myRank ? `#${myRank}` : isLoadingRank ? "..." : "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* Ranking */}
                                <div className="border-t border-border-subtle">
                                    <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle/60">
                                        <Trophy size={13} className="text-yellow-400" />
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                                            Ranking del grupo
                                        </span>
                                    </div>

                                    {isLoadingRank ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="animate-spin text-text-dim" size={18} />
                                        </div>
                                    ) : ranking && ranking.length > 0 ? (
                                        <div>
                                            {ranking.map((entry, i) => {
                                                const isMe = entry.student_id === userId;
                                                return (
                                                    <div
                                                        key={entry.student_id}
                                                        className={`flex items-center gap-3 px-5 py-3 ${i < ranking.length - 1 ? "border-b border-border-subtle/30" : ""
                                                            } ${isMe ? "bg-accent-focus/[0.05]" : ""}`}
                                                    >
                                                        <span className={`w-6 text-center text-xs font-bold ${i === 0 ? "text-yellow-400"
                                                            : i === 1 ? "text-zinc-400"
                                                                : i === 2 ? "text-amber-700"
                                                                    : "text-text-dim/40"
                                                            }`}>
                                                            #{i + 1}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${isMe ? "text-accent-focus" : ""}`}>
                                                                {entry.username}{isMe ? " (tú)" : ""}
                                                            </p>
                                                            <p className="text-[10px] text-text-dim">
                                                                {entry.total_reviews} reviews · racha {entry.streak_current}d
                                                            </p>
                                                        </div>
                                                        <span className={`text-sm font-bold ${entry.precision !== null
                                                            ? entry.precision >= 80 ? "text-green-400"
                                                                : entry.precision >= 60 ? "text-yellow-400"
                                                                    : "text-red-400"
                                                            : "text-text-dim"
                                                            }`}>
                                                            {entry.precision !== null ? `${entry.precision}%` : "—"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center text-xs text-text-dim/50">
                                            Nadie ha estudiado aún. ¡Sé el primero!
                                        </div>
                                    )}
                                </div>

                                {/* Leave button */}
                                <div className="border-t border-border-subtle p-4">
                                    {confirmLeaveId === cls.classroom_id ? (
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-red-400 shrink-0" />
                                            <span className="text-xs text-text-dim flex-1">¿Seguro que quieres salir?</span>
                                            <button
                                                onClick={() => leaveClass(cls.classroom_id)}
                                                disabled={leavingId === cls.classroom_id}
                                                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                {leavingId === cls.classroom_id
                                                    ? <Loader2 className="animate-spin" size={12} />
                                                    : "Sí, salir"
                                                }
                                            </button>
                                            <button
                                                onClick={() => setConfirmLeaveId(null)}
                                                className="text-xs text-text-dim hover:text-white transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmLeaveId(cls.classroom_id)}
                                            className="flex items-center gap-2 text-xs text-text-dim/50 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut size={12} />
                                            Abandonar grupo
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
