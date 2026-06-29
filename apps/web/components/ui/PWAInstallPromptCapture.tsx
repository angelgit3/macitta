"use client";

import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __macittaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

const INSTALL_DISMISSED_KEY = "macitta:pwa-install-dismissed-at";
const INSTALL_DISMISS_DAYS = 7;

function isDismissedRecently() {
  const dismissedAt = window.localStorage.getItem(INSTALL_DISMISSED_KEY);
  if (!dismissedAt) return false;

  const dismissedTime = Number(dismissedAt);
  if (!Number.isFinite(dismissedTime)) return false;

  const dismissWindowMs = INSTALL_DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedTime < dismissWindowMs;
}

function isAppInstalled() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function getInstallCopy() {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigatorWithStandalone.standalone !== undefined && /safari/.test(userAgent));

  if (isIOS) {
    return {
      icon: Share2,
      title: "Instala Macitta",
      body: "Toca Compartir y luego Agregar a pantalla de inicio.",
    };
  }

  return {
    icon: Download,
    title: "Instala Macitta",
    body: "Usa el boton Instalar o el menu del navegador para agregarla a tu pantalla.",
  };
}

export function PWAInstallPromptCapture() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installCopy, setInstallCopy] = useState({
    icon: Download,
    title: "Instala Macitta",
    body: "Agregala a tu pantalla de inicio para abrirla como app.",
  });

  useEffect(() => {
    const isMobileLike =
      window.matchMedia("(pointer: coarse)").matches &&
      window.matchMedia("(max-width: 920px)").matches;

    if (!isMobileLike || isAppInstalled() || isDismissedRecently()) {
      setShowInstallPrompt(false);
      return;
    }

    setInstallCopy(getInstallCopy());
    const showFallbackTimer = window.setTimeout(() => {
      setShowInstallPrompt(true);
    }, 1200);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__macittaInstallPrompt = promptEvent;
      setInstallPrompt(promptEvent);
      setShowInstallPrompt(true);
      window.dispatchEvent(new Event("macitta:installprompt"));
    };

    const handleAppInstalled = () => {
      window.__macittaInstallPrompt = undefined;
      setInstallPrompt(null);
      setShowInstallPrompt(false);
      window.dispatchEvent(new Event("macitta:appinstalled"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(showFallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstallPrompt(false);
    }

    window.__macittaInstallPrompt = undefined;
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    window.localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  const InstallIcon = installPrompt ? Download : installCopy.icon;

  return (
    <div className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[80] mx-auto max-w-md">
      <div className="glass-panel rounded-2xl border border-accent/25 bg-surface/95 px-3 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <InstallIcon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-ink">{installCopy.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-ink-muted">
              {installPrompt ? "Agregala a tu pantalla de inicio para abrirla como app." : installCopy.body}
            </p>

            {installPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="mt-2 inline-flex min-h-9 items-center justify-center rounded-xl bg-accent px-4 text-xs font-black text-void transition-transform active:scale-[0.98]"
              >
                Instalar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
            aria-label="Cerrar aviso de instalacion"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
