'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Global Error]', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-void text-stone-100 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <div className="text-4xl">⚠️</div>
                    <h2 className="text-xl font-bold">Error crítico</h2>
                    <p className="text-sm text-stone-400">
                        La aplicación encontró un error grave.
                    </p>
                    <button
                        onClick={reset}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-accent-focus text-white hover:brightness-110 transition active:scale-95"
                    >
                        Recargar
                    </button>
                </div>
            </body>
        </html>
    );
}
