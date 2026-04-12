'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@/lib/logger';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { SyncOperation } from '@/lib/db';

const MAX_RETRIES = 5;

// ─── Hook ───────────────────────────────────────────────────────────

export function useSync() {
    const supabase = createClient();
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const syncingRef = useRef(false);

    const performSync = useCallback(async () => {
        if (syncingRef.current || !isOnline) return;

        const queue = await db.syncQueue.orderBy('id').toArray();
        if (queue.length === 0) return;

        syncingRef.current = true;
        setIsSyncing(true);
        logger.log(`[Sync] Processing ${queue.length} operations...`);

        try {
            for (const op of queue) {
                const retries = (op as any).retryCount ?? 0;
                const success = await processOperation(op);
                if (success) {
                    await db.syncQueue.delete(op.id!);
                } else if (retries >= MAX_RETRIES) {
                    // Give up after MAX_RETRIES to avoid infinite retry loop
                    logger.error(`[Sync] Dropping failed operation after ${MAX_RETRIES} retries: ${op.type} (id: ${op.id})`);
                    await db.syncQueue.delete(op.id!);
                } else {
                    // Increment retry count
                    await db.syncQueue.update(op.id!, { retryCount: retries + 1 });
                }
            }
            setLastSync(new Date());
        } finally {
            syncingRef.current = false;
            setIsSyncing(false);
        }
    }, [supabase, isOnline]);

    /**
     * Process a single sync operation.
     * Handles all 5 SyncOperation types.
     */
    async function processOperation(op: SyncOperation): Promise<boolean> {
        try {
            switch (op.type) {
                case 'upsert_user_item': {
                    const { error } = await supabase.rpc('sync_user_item', {
                        p_user_id: op.data.user_id,
                        p_card_id: op.data.card_id,
                        p_stability: op.data.stability,
                        p_difficulty: op.data.difficulty,
                        p_reps: op.data.reps,
                        p_lapses: op.data.lapses,
                        p_state: op.data.state,
                        p_last_review: op.data.last_review,
                        p_due_date: op.data.due_date,
                    });
                    if (error) {
                        logger.error("[Sync] upsert_user_item error", error);
                        return false;
                    }
                    return true;
                }

                case 'insert_study_log': {
                    const { error } = await supabase
                        .from('study_logs')
                        .insert(op.data);
                    if (error) {
                        logger.error("[Sync] insert_study_log error", error);
                        return false;
                    }
                    return true;
                }

                case 'start_session': {
                    const { error } = await supabase
                        .from('study_sessions')
                        .insert({
                            id: op.data.session_id,
                            user_id: op.data.user_id,
                            deck_id: op.data.deck_id,
                            started_at: op.data.started_at,
                        });
                    if (error) {
                        logger.error("[Sync] start_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'end_session': {
                    const { error } = await supabase
                        .from('study_sessions')
                        .update({
                            ended_at: op.data.ended_at,
                            total_cards: op.data.total_cards,
                            correct_cards: op.data.correct_cards,
                            total_time_ms: op.data.total_time_ms,
                        })
                        .eq('id', op.data.session_id);
                    if (error) {
                        logger.error("[Sync] end_session error", error);
                        return false;
                    }
                    return true;
                }

                case 'increment_session_time': {
                    const { error } = await supabase.rpc('increment_session_time', {
                        p_session_id: op.data.session_id,
                        p_time_ms: op.data.time_ms,
                    });
                    if (error) {
                        logger.error("[Sync] increment_session_time error", error);
                        return false;
                    }
                    return true;
                }

                default: {
                    logger.warn("[Sync] Unknown operation type:", (op as any).type);
                    return false;
                }
            }
        } catch (e) {
            logger.error("[Sync] Critical error processing operation", e);
            return false;
        }
    }

    // Periodic sync every 30 seconds (online status comes from useNetworkStatus)
    useEffect(() => {
        const interval = setInterval(performSync, 30000);
        return () => clearInterval(interval);
    }, [performSync]);

    return { isSyncing, lastSync, performSync };
}
