import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    calculateStreak,
    aggregateActivity,
    calculateTotalTimeMs,
} from '@/lib/statsCalculator';

// ─── Types ──────────────────────────────────────────────────────────

export interface UserStats {
    streak: number;
    totalTimeMs: number;
    masteredCards: number;
    totalCards: number;
    dailyActivity: { date: string; minutes: number }[];
    precision: number | null;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useUserStats() {
    const supabase = useMemo(() => createClient(), []);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Run all 3 queries in parallel
            // Fetch sessions from last 90 days only (enough for streak + activity graph)
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const [sessionsRes, userItemsRes, totalCardsRes, studyLogsRes] = await Promise.all([
                supabase
                    .from('study_sessions')
                    .select('started_at, total_time_ms')
                    .eq('user_id', user.id)
                    .gte('started_at', ninetyDaysAgo.toISOString())
                    .order('started_at', { ascending: false }),
                supabase
                    .from('user_items')
                    .select('state')
                    .eq('user_id', user.id),
                supabase
                    .from('cards')
                    .select('*', { count: 'exact', head: true }),
                Promise.resolve(
                    supabase
                        .from('study_logs')
                        .select('accuracy')
                        .eq('user_id', user.id),
                ).catch(() => ({ data: null, error: null })),
            ]);

            const sessions = sessionsRes.data ?? [];
            const userItems = userItemsRes.data ?? [];
            const totalCards = totalCardsRes.count ?? 0;
            const studyLogs = studyLogsRes?.data ?? [];

            const { activityMap, dailyActivity } = aggregateActivity(sessions);
            const streak = calculateStreak(activityMap);
            const totalTimeMs = calculateTotalTimeMs(sessions);
            const masteredCards = userItems.filter((i: { state: string }) => i.state === 'mastered').length;

            // Compute precision: average accuracy across all study logs, as percentage
            const precision = studyLogs.length > 0
                ? Math.round((studyLogs.reduce((sum: number, log: { accuracy: number | null }) => sum + (log.accuracy ?? 0), 0) / studyLogs.length) * 100)
                : null;

            setStats({ streak, totalTimeMs, masteredCards, totalCards, dailyActivity, precision });
        } catch (err) {
            console.error("[Stats] Error fetching user stats:", err);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refresh: fetchStats };
}
