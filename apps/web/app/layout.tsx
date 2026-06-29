import type { Metadata, Viewport } from "next";
import { PWAInstallPromptCapture } from "@/components/ui/PWAInstallPromptCapture";
import "./globals.css";

export const metadata: Metadata = {
    title: "Macitta",
    description: "Estudio de inglés con repetición espaciada, modo offline y práctica TOEFL.",
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
                {children}
            </body>
        </html>
    );
}
