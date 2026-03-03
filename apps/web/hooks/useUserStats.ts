import { useState, useEffect, useCallback } from 'react';
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
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useUserStats() {
    const supabase = createClient();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch only needed columns from study_sessions
            const { data: sessions } = await supabase
                .from('study_sessions')
                .select('started_at, total_time_ms')
                .eq('user_id', user.id)
                .order('started_at', { ascending: false });

            // 2. Fetch mastery state from user_items
            const { data: userItems } = await supabase
                .from('user_items')
                .select('state')
                .eq('user_id', user.id);

            // 3. Total available cards count
            const { count: totalCards } = await supabase
                .from('cards')
                .select('*', { count: 'exact', head: true });

            // Calculate stats using extracted functions
            const { activityMap, dailyActivity } = aggregateActivity(sessions || []);
            const streak = calculateStreak(activityMap);
            const totalTimeMs = calculateTotalTimeMs(sessions || []);
            const masteredCards = userItems?.filter(i => i.state === 'mastered').length || 0;

            setStats({
                streak,
                totalTimeMs,
                masteredCards,
                totalCards: totalCards || 0,
                dailyActivity,
            });
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
