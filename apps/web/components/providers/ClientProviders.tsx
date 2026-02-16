'use client';

import { useSync } from '@/hooks/useSync';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SyncManager() {
    const { isSyncing, lastSync, performSync } = useSync();
    const [online, setOnline] = useState(true);

    useEffect(() => {
        setOnline(navigator.onLine);
        const h1 = () => setOnline(true);
        const h2 = () => setOnline(false);
        window.addEventListener('online', h1);
        window.addEventListener('offline', h2);
        return () => {
            window.removeEventListener('online', h1);
            window.removeEventListener('offline', h2);
        };
    }, []);

    return (
        <button
            onClick={() => performSync()}
            disabled={isSyncing}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-void/80 backdrop-blur-md transition-all active:scale-95 ${!navigator.onLine
                ? 'border-red-500/20 text-red-400'
                : isSyncing
                    ? 'border-blue-500/20 text-blue-400 animate-pulse'
                    : 'border-green-500/20 text-green-400'
                }`}>
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">
                {!navigator.onLine ? 'Offline' : isSyncing ? 'Sincronizando' : 'Sincronizado'}
            </span>
        </button>
    );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const { isSyncing, lastSync, performSync } = useSync();

    // Auto-sync on mount
    useEffect(() => {
        performSync();
    }, []);

    return (
        <>
            <SyncManager />
            {children}
        </>
    );
}
