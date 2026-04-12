'use client';

import { useSync } from '@/hooks/useSync';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Cloud, RefreshCw } from 'lucide-react';

export function SyncManager() {
    const { isSyncing, performSync } = useSync();
    const { isOnline } = useNetworkStatus();

    return (
        <button
            onClick={() => performSync()}
            disabled={isSyncing}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-void/80 backdrop-blur-md transition-all active:scale-95 ${!isOnline
                ? 'border-red-500/20 text-red-400'
                : isSyncing
                    ? 'border-blue-500/20 text-blue-400 animate-pulse'
                    : 'border-green-500/20 text-green-400'
                }`}>
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
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
