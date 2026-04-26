import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
    title: "Macitta",
    description: "Active Recall & Spaced Repetition System",
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
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-void text-stone-100 min-h-screen flex justify-center selection:bg-accent-focus selection:text-white transition-colors duration-300">
                <main className="w-full max-w-[480px] min-h-screen relative bg-void shadow-[0_0_40px_rgba(59,130,246,0.03)] border-x border-white/[0.02] transition-all duration-500 overflow-x-hidden">
                    {/* Glowing ambient background */}
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-accent-focus/20 rounded-full blur-[100px] pointer-events-none" />
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
                    
                    <div className="relative z-10 min-h-screen flex flex-col">
                        <ClientProviders>
                            {children}
                        </ClientProviders>
                    </div>
                </main>
            </body>
        </html>
    );
}
