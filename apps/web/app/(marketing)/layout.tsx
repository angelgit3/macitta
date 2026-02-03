export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-void flex flex-col items-center">
            <main className="w-full flex-1 flex flex-col relative px-6 py-12">
                {children}
            </main>
        </div>
    );
}
