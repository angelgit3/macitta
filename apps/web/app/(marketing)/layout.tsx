import { BackgroundEffects } from "@/components/ui/BackgroundEffects";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full min-h-screen bg-void flex flex-col items-center overflow-x-hidden relative">
            <BackgroundEffects variant="full-width" />
            <main className="w-full flex-1 flex flex-col relative z-10">
                {children}
            </main>
        </div>
    );
}
