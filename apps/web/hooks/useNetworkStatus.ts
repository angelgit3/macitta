import { useState, useEffect } from "react";

/**
 * Tracks browser online/offline status reactively.
 * SSR-safe: defaults to online when `navigator` is unavailable.
 */
export function useNetworkStatus() {
    const [isOffline, setIsOffline] = useState(
        typeof navigator !== "undefined" ? !navigator.onLine : false,
    );

    useEffect(() => {
        const goOnline = () => setIsOffline(false);
        const goOffline = () => setIsOffline(true);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    return { isOffline };
}
