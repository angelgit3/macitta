"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { ZenButton } from "@/components/ui/ZenButton";

const CONSENT_KEY = "macitta_cookie_consent";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already responded to consent
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (!storedConsent) {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(CONSENT_KEY, "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de privacidad y almacenamiento de cookies"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 sm:bottom-6 sm:right-6 sm:left-auto"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-void/92 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Cookie size={20} />
          </div>

          <div className="space-y-2 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-ink">Cookies y Almacenamiento Local</h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[0.6875rem] font-bold text-success">
                <ShieldCheck size={11} /> Esenciales
              </span>
            </div>

            <p className="text-xs leading-5 text-ink-muted">
              Utilizamos almacenamiento local y cookies estrictamente necesarias para autenticar tu cuenta y sincronizar tus repasos sin conexión (PWA). <strong className="text-ink font-semibold">No usamos rastreadores publicitarios.</strong>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <ZenButton variant="primary" size="sm" onClick={handleAccept}>
                Entendido
              </ZenButton>

              <Link
                href="/privacidad#cookies-offline"
                className="text-xs font-semibold text-ink-muted transition-colors hover:text-accent underline"
              >
                Más información sobre cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
