'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[App Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold">Algo salió mal</h2>
            <p className="text-sm text-ink-faint">
                Ha ocurrido un error inesperado. Puedes intentar de nuevo.
            </p>
            <button
                onClick={reset}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent text-void border border-accent/20 hover:bg-accent-hover transition active:scale-95"
            >
                Reintentar
            </button>
        </div>
    );
}
