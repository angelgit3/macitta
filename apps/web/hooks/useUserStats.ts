import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface UserStats {
    streak: number;
    totalTimeMs: number;
    masteredCards: number;
    totalCards: number;
    dailyActivity: { date: string; minutes: number }[];
}

export function useUserStats() {
    const supabase = createClient();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch total time and streak data from study_sessions
            const { data: sessions } = await supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('started_at', { ascending: false });

            // 2. Fetch mastery from user_items
            const { data: userItems } = await supabase
                .from('user_items')
                .select('state')
                .eq('user_id', user.id);

            // 3. Fetch total available cards (Verbos Irregulares)
            const { count: totalCards } = await supabase
                .from('cards')
                .select('*', { count: 'exact', head: true });

            // Calculations
            let totalTimeMs = 0;
            let streak = 0;
            const activityMap: Record<string, number> = {};

            if (sessions) {
                sessions.forEach(s => {
                    totalTimeMs += s.total_time_ms || 0;
                    const date = new Date(s.started_at).toISOString().split('T')[0];
                    activityMap[date] = (activityMap[date] || 0) + (s.total_time_ms || 0) / 60000;
                });

                // Simple Streak Calculation
                const today = new Date().toISOString().split('T')[0];
                let currentIter = new Date();
                while (true) {
                    const checkDate = currentIter.toISOString().split('T')[0];
                    if (activityMap[checkDate]) {
                        streak++;
                        currentIter.setDate(currentIter.getDate() - 1);
                    } else {
                        // If it's today and no study yet, check yesterday to avoid breaking streak too early
                        if (checkDate === today) {
                            currentIter.setDate(currentIter.getDate() - 1);
                            continue;
                        }
                        break;
                    }
                }
            }

            const masteredCards = userItems?.filter(i => i.state === 'review').length || 0;

            const dailyActivity = Object.entries(activityMap)
                .map(([date, minutes]) => ({ date, minutes }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-7); // Last 7 days

            setStats({
                streak,
                totalTimeMs,
                masteredCards,
                totalCards: totalCards || 0,
                dailyActivity
            });

        } catch (err) {
            console.error("Error fetching user stats:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, refresh: fetchStats };
}
