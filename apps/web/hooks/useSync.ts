'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

export function useSync() {
    const supabase = createClient();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const performSync = async () => {
        if (isSyncing || !navigator.onLine) return;

        const queue = await db.syncQueue.orderBy('id').toArray();
        if (queue.length === 0) return;

        setIsSyncing(true);
        console.log(`[Sync] Processing ${queue.length} operations...`);

        try {
            for (const op of queue) {
                let success = false;

                try {
                    if (op.type === 'upsert_user_item') {
                        // Use OPTION B: Sync RPC with date comparison
                        const { error } = await supabase.rpc('sync_user_item', {
                            p_user_id: op.data.user_id,
                            p_card_id: op.data.card_id,
                            p_stability: op.data.stability,
                            p_difficulty: op.data.difficulty,
                            p_reps: op.data.reps,
                            p_lapses: op.data.lapses,
                            p_state: op.data.state,
                            p_last_review: op.data.last_review,
                            p_due_date: op.data.due_date
                        });
                        if (!error) success = true;
                        else console.error("Sync error (upsert):", error);
                    }
                    else if (op.type === 'insert_study_log') {
                        const { error } = await supabase.from('study_logs').insert(op.data);
                        if (!error) success = true;
                        else console.error("Sync error (log):", error);
                    }

                    if (success) {
                        await db.syncQueue.delete(op.id!);
                    }
                } catch (e) {
                    console.error("Critical sync item error:", e);
                }
            }
            setLastSync(new Date());
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync when coming online or periodic
    useEffect(() => {
        const handleOnline = () => performSync();
        window.addEventListener('online', handleOnline);

        // Initial sync attempt
        performSync();

        // Periodic sync every 30 seconds if queue not empty
        const interval = setInterval(() => {
            performSync();
        }, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, []);

    return { isSyncing, lastSync, performSync };
}
