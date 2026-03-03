import { useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SessionStats } from "@/types/study";

/**
 * Manages Supabase `study_sessions` lifecycle (start → end).
 * Encapsulates the session ID and timing so the parent hook
 * doesn't need to track them.
 */
export function useSessionManager() {
    const supabase = createClient();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const sessionStartTime = useRef<number>(Date.now());

    const startSession = useCallback(async (deckId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !navigator.onLine) return null;

            const { data } = await supabase
                .from("study_sessions")
                .insert({
                    user_id: user.id,
                    deck_id: deckId,
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (data) {
                setSessionId(data.id);
                sessionStartTime.current = Date.now();
                return data.id as string;
            }
            return null;
        } catch (err) {
            console.error("[SEM] Error starting session:", err);
            return null;
        }
    }, [supabase]);

    const endSession = useCallback(async (stats: SessionStats) => {
        if (!sessionId || !navigator.onLine) return;

        const totalDuration = Date.now() - sessionStartTime.current;
        try {
            await supabase
                .from("study_sessions")
                .update({
                    ended_at: new Date().toISOString(),
                    total_cards: stats.total,
                    correct_cards: stats.correct,
                    total_time_ms: totalDuration,
                })
                .eq("id", sessionId);

            return totalDuration;
        } catch (err) {
            console.error("[SEM] Error ending session:", err);
            return 0;
        }
    }, [sessionId, supabase]);

    return {
        sessionId,
        startSession,
        endSession,
    };
}
