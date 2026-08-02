/**
 * Secure logger utility
 * En producción solo registra errores; en desarrollo registra todo.
 * Evita filtrar información interna del estado de la app en producción.
 */

const isDev = process.env.NODE_ENV !== "production";

function serializeError(error: unknown): unknown {
    if (!error) return "Null or undefined error";
    if (typeof error === "string") return error;
    if (typeof error === "object") {
        const obj = error as Record<string, unknown>;
        const result: Record<string, unknown> = {};

        const keys = ["message", "code", "details", "hint", "status", "statusText", "name", "error_description"];
        for (const key of keys) {
            if (key in obj && obj[key] !== undefined && obj[key] !== "") {
                result[key] = obj[key];
            }
        }

        try {
            Object.assign(result, obj);
        } catch {
            // ignore
        }

        if (Object.keys(result).length === 0) {
            return String(error) !== "[object Object]" ? String(error) : error;
        }

        return result;
    }
    return String(error);
}

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (message: string, error?: unknown) => {
        if (isDev) {
            console.error(message, serializeError(error));
        } else {
            console.error(message);
        }
    },
};
