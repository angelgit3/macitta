/**
 * Secure logger utility
 * En producción solo registra errores; en desarrollo registra todo.
 * Evita filtrar información interna del estado de la app en producción.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    /**
     * Errores: En producción registra solo el mensaje, nunca el objeto de error
     * completo (que puede exponer detalles del schema de Supabase).
     */
    error: (message: string, error?: unknown) => {
        if (isDev) {
            if (error && typeof error === "object") {
                const err = error as Record<string, unknown>;
                const formatted = {
                    message: err.message ?? (error instanceof Error ? error.message : undefined),
                    code: err.code,
                    details: err.details,
                    hint: err.hint,
                    ...err,
                };
                console.error(message, formatted);
            } else {
                console.error(message, error);
            }
        } else {
            console.error(message);
        }
    },
};
