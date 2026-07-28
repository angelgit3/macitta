import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    calculateStreak,
    aggregateActivity,
    calculateTotalTimeMs,
} from '@/lib/statsCalculator';

const STATS_CACHE_TTL_MS = 30_000;
const RECENT_ACCURACY_SAMPLE_SIZE = 500;

let statsCache: { value: UserStats; fetchedAt: number } | null = null;
let statsRequest: Promise<UserStats | null> | null = null;

// ─── Types ──────────────────────────────────────────────────────────

export interface UserStats {
    streak: number;
    totalTimeMs: number;
    masteredCards: number;
    totalCards: number;
    dailyActivity: { date: string; minutes: number }[];
    precision: number | null;
    dueCards: number;
    displayName: string;
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useUserStats() {
    const supabase = useMemo(() => createClient(), []);
    const [stats, setStats] = useState<UserStats | null>(() => statsCache?.value ?? null);
    const [loading, setLoading] = useState(() => !statsCache);

    const fetchStats = useCallback(async () => {
        const cached = statsCache;
        if (cached && Date.now() - cached.fetchedAt < STATS_CACHE_TTL_MS) {
            setStats(cached.value);
            setLoading(false);
            return;
        }

        setLoading(!cached);
        try {
            if (statsRequest) {
                const sharedStats = await statsRequest;
                if (sharedStats) setStats(sharedStats);
                return;
            }

            statsRequest = (async () => {
            // The middleware already validates protected routes. Here the ID only
            // scopes RLS-protected queries, so use the local session and avoid an
            // additional Auth API round trip whenever the dashboard mounts.
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) return null;

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
                    .select('state, due_date')
                    .eq('user_id', user.id),
                supabase
                    .from('cards')
                    .select('*', { count: 'exact', head: true }),
                Promise.resolve(
                    supabase
                        .from('study_logs')
                        .select('accuracy')
                        .eq('user_id', user.id)
                        .order('review_date', { ascending: false })
                        .limit(RECENT_ACCURACY_SAMPLE_SIZE),
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
            const now = Date.now();
            const unseenCards = Math.max(totalCards - userItems.length, 0);
            const scheduledDueCards = userItems.filter((item: { state: string; due_date: string | null }) =>
                item.state !== 'mastered' && (!item.due_date || new Date(item.due_date).getTime() <= now),
            ).length;
            const dueCards = unseenCards + scheduledDueCards;
            const displayName = String(
                user.user_metadata?.full_name
                ?? user.user_metadata?.user_name
                ?? user.email?.split('@')[0]
                ?? 'estudiante',
            ).split(/\s+/)[0];

            // Compute precision: average accuracy across all study logs, as percentage
            const precision = studyLogs.length > 0
                ? Math.round((studyLogs.reduce((sum: number, log: { accuracy: number | null }) => sum + (log.accuracy ?? 0), 0) / studyLogs.length) * 100)
                : null;

            return { streak, totalTimeMs, masteredCards, totalCards, dailyActivity, precision, dueCards, displayName };
            })();

            const freshStats = await statsRequest;
            if (freshStats) {
                statsCache = { value: freshStats, fetchedAt: Date.now() };
                setStats(freshStats);
            }
        } catch (err) {
            console.error("[Stats] Error fetching user stats:", err);
        } finally {
            statsRequest = null;
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, refresh: fetchStats };
}
