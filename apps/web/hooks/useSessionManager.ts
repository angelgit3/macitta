import { useState, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SessionStats } from "@/types/study";
import { db } from "@/lib/db";

/**
 * Manages Supabase `study_sessions` lifecycle (start → end).
 * Uses refs for sessionId and startTime to avoid stale closures
 * in React callbacks.
 */
export function useSessionManager() {
    const supabase = useMemo(() => createClient(), []);
    const sessionIdRef = useRef<string | null>(null);
    const sessionStartTime = useRef<number>(Date.now());

    // Expose sessionId as state for consumers that need reactivity
    const [sessionId, setSessionId] = useState<string | null>(null);

    const startSession = useCallback(async (deckId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            if (navigator.onLine) {
                // Online: use existing Supabase insert path
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
                    sessionIdRef.current = data.id;
                    setSessionId(data.id);
                    sessionStartTime.current = Date.now();
                    return data.id as string;
                }
                return null;
            } else {
                // Offline: generate sessionId and queue start_session op
                const sessionId = crypto.randomUUID();
                sessionIdRef.current = sessionId;
                setSessionId(sessionId);
                sessionStartTime.current = Date.now();

                await db.syncQueue.add({
                    type: "start_session",
                    data: {
                        session_id: sessionId,
                        user_id: user.id,
                        deck_id: deckId,
                        started_at: new Date().toISOString(),
                    },
                    created_at: new Date().toISOString(),
                });

                return sessionId;
            }
        } catch (err) {
            console.error("[SREM] Error starting session:", err);
            return null;
        }
    }, [supabase]);

    const endSession = useCallback(async (stats: SessionStats) => {
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) return 0;

        const totalDuration = Date.now() - sessionStartTime.current;

        if (navigator.onLine) {
            // Online: use existing Supabase update path
            try {
                await supabase
                    .from("study_sessions")
                    .update({
                        ended_at: new Date().toISOString(),
                        total_cards: stats.total,
                        correct_cards: stats.correct,
                        total_time_ms: totalDuration,
                    })
                    .eq("id", currentSessionId);

                sessionIdRef.current = null;
                setSessionId(null);

                return totalDuration;
            } catch (err) {
                console.error("[SREM] Error ending session:", err);
                return 0;
            }
        } else {
            // Offline: queue end_session + increment_session_time ops
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await db.syncQueue.add({
                        type: "end_session",
                        data: {
                            session_id: currentSessionId,
                            user_id: user.id,
                            ended_at: new Date().toISOString(),
                            total_cards: stats.total,
                            correct_cards: stats.correct,
                            total_time_ms: totalDuration,
                        },
                        created_at: new Date().toISOString(),
                    });
                }

                await db.syncQueue.add({
                    type: "increment_session_time",
                    data: {
                        session_id: currentSessionId,
                        time_ms: totalDuration,
                    },
                    created_at: new Date().toISOString(),
                });

                sessionIdRef.current = null;
                setSessionId(null);

                return totalDuration;
            } catch (err) {
                console.error("[SREM] Error ending session (offline):", err);
                return 0;
            }
        }
    }, [supabase]);

    return { sessionId, startSession, endSession };
}
