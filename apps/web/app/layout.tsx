import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Maccita God",
    description: "Active Recall & Spaced Repetition System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className="bg-void text-stone-100 min-h-screen flex justify-center selection:bg-accent-focus selection:text-white">
                {/* Mobile Tunnel Constraint */}
                <main className="w-full max-w-[480px] min-h-screen relative bg-void shadow-2xl shadow-void/50 border-x border-white/5">
                    {children}
                </main>
            </body>
        </html>
    );
}
