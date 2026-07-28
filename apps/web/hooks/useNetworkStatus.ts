import { useState, useEffect } from "react";

/**
 * Single source of truth for online/offline status.
 * SSR-safe: defaults to online when `navigator` is unavailable.
 */
export function useNetworkStatus() {
    // Keep the server and first client render identical. The real browser state
    // is applied immediately after mount to avoid a hydration mismatch.
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        setIsOnline(window.navigator.onLine);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    return { isOnline, isOffline: !isOnline };
}
