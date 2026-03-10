// ─── Types ──────────────────────────────────────────────────────────

interface SessionRecord {
    started_at: string;
    total_time_ms: number | null;
}

interface DailyActivity {
    date: string;
    minutes: number;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD in LOCAL timezone (not UTC) */
function toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// ─── Streak Calculation ─────────────────────────────────────────────

/**
 * Calculates the current consecutive-day study streak.
 * Tolerates "today not studied yet" — if the user hasn't studied today,
 * the streak starts counting from yesterday to avoid a premature break.
 */
export function calculateStreak(activityMap: Record<string, number>): number {
    let streak = 0;
    const today = toLocalDateStr(new Date());
    const cursor = new Date();

    while (true) {
        const checkDate = toLocalDateStr(cursor);

        if (activityMap[checkDate]) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else if (checkDate === today) {
            // Today with no study yet — skip, check yesterday
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// ─── Activity Aggregation ───────────────────────────────────────────

/**
 * Transforms raw session records into a daily activity map (date → minutes)
 * and a sorted array of the last N days. Uses LOCAL timezone for all dates.
 */
export function aggregateActivity(
    sessions: SessionRecord[],
    lastNDays = 7,
): { activityMap: Record<string, number>; dailyActivity: DailyActivity[] } {
    const activityMap: Record<string, number> = {};

    for (const s of sessions) {
        const ms = s.total_time_ms || 0;
        const date = toLocalDateStr(new Date(s.started_at));
        activityMap[date] = (activityMap[date] || 0) + ms / 60000;
    }

    // Always generate the last N days, filling gaps with 0
    const dailyActivity: DailyActivity[] = [];
    for (let i = lastNDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = toLocalDateStr(d);
        dailyActivity.push({ date: dateStr, minutes: activityMap[dateStr] || 0 });
    }

    return { activityMap, dailyActivity };
}

/**
 * Sums total study time from session records.
 */
export function calculateTotalTimeMs(sessions: SessionRecord[]): number {
    return sessions.reduce((sum, s) => sum + (s.total_time_ms || 0), 0);
}
