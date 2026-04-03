"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if user already dismissed
        if (localStorage.getItem("macitta-install-dismissed")) return;

        // Check if already installed (standalone mode)
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    async function handleInstall() {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    }

    function handleDismiss() {
        setDismissed(true);
        setDeferredPrompt(null);
        localStorage.setItem("macitta-install-dismissed", "1");
    }

    if (!deferredPrompt || dismissed) return null;

    return (
        <div className="bg-accent-focus/10 border border-accent-focus/20 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-focus/20 flex items-center justify-center shrink-0">
                <Download size={16} className="text-accent-focus" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">Instala Macitta</p>
                <p className="text-[10px] text-text-dim">Acceso rápido desde tu pantalla de inicio</p>
            </div>
            <button
                onClick={handleInstall}
                className="text-xs font-bold text-accent-focus hover:text-white transition-colors px-3 py-1.5 bg-accent-focus/15 rounded-lg shrink-0"
            >
                Instalar
            </button>
            <button
                onClick={handleDismiss}
                className="text-text-dim/40 hover:text-text-dim transition-colors shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}
