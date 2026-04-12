import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";

export const metadata: Metadata = {
    title: "Macitta",
    description: "Active Recall & Spaced Repetition System",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
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
            <body className="bg-void text-stone-100 min-h-screen flex justify-center selection:bg-accent-focus selection:text-white">
                <main className="w-full max-w-[480px] min-h-screen relative bg-void shadow-2xl shadow-void/50 border-x border-white/5">
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                </main>
            </body>
        </html>
    );
}
