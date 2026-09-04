import type { Metadata, Viewport } from "next";
import { PWAInstallPromptCapture } from "@/components/ui/PWAInstallPromptCapture";
import { CookieConsentBanner } from "@/components/ui/CookieConsentBanner";
import "./globals.css";

// Nonce-based CSP requires request-time rendering so Next.js can copy the
// middleware nonce onto every framework and React bootstrap script.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.macitta.app",
    ),
    title: "Macitta",
    description: "Estudio de inglés con repetición espaciada, modo offline y práctica TOEFL.",
    openGraph: {
        type: "website",
        siteName: "Macitta",
        locale: "es_MX",
        title: "Macitta — Recuerda el inglés cuando de verdad lo necesitas",
        description: "Vocabulario, lecturas y práctica TOEFL con repetición espaciada. Incluso sin conexión.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Macitta — estudio de inglés con repetición espaciada, offline-first",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Macitta — Recuerda el inglés cuando de verdad lo necesitas",
        description: "Vocabulario, lecturas y práctica TOEFL con repetición espaciada. Incluso sin conexión.",
        images: ["/og-image.png"],
    },
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Macitta",
    },
};

export const viewport: Viewport = {
    themeColor: "#0D0E17",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es-MX" className="dark">
            <body className="bg-void text-ink min-h-screen flex justify-center selection:bg-accent/30 selection:text-ink transition-colors duration-300">
                <PWAInstallPromptCapture />
                <CookieConsentBanner />
                {children}
            </body>
        </html>
    );
}
