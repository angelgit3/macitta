'use client';

import { useSync } from '@/hooks/useSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Cloud, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SyncManager() {
    const [mounted, setMounted] = useState(false);
    const { isSyncing, performSync } = useSync();
    const { isOnline } = useNetworkStatus();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => performSync()}
            disabled={isSyncing}
            className={`fixed top-3 right-3 z-50 min-h-9 min-w-9 sm:min-w-0 flex items-center justify-center sm:justify-start gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border bg-void/80 backdrop-blur-md transition-all active:scale-95 ${!isOnline
                ? 'border-red-500/20 text-red-400'
                : isSyncing
                    ? 'border-accent-focus/20 text-accent-focus animate-pulse'
                    : 'border-accent-success/20 text-accent-success'
                }`}>
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
            <span className="hidden sm:inline text-[10px] font-bold uppercase">
                {!isOnline ? 'Offline' : isSyncing ? 'Sincronizando' : 'Sincronizado'}
            </span>
        </button>
    );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SyncManager />
            {children}
        </>
    );
}
