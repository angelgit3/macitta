import { ZenDock } from "@/components/ui/ZenDock";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen pb-32 relative">
            <main className="px-6 pt-6 flex flex-col gap-6">
                {children}
            </main>
            <ZenDock />
        </div>
    );
}
