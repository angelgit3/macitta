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
            console.error(message, error);
        } else {
            // En producción, solo logeamos el mensaje sin datos sensibles
            console.error(message);
        }
    },
};
