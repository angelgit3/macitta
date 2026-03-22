export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-void flex flex-col items-center overflow-x-hidden">
            <main className="w-full flex-1 flex flex-col relative">
                {children}
            </main>
        </div>
    );
}
