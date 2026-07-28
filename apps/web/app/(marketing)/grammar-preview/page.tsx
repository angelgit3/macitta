import { GRAMMAR_CATALOG } from "@macitta/shared";
import { notFound } from "next/navigation";
import { GrammarPracticeClient } from "../../(app)/grammar/GrammarPracticeClient";

export default function GrammarPreviewPage() {
    if (process.env.NODE_ENV !== "development") notFound();

    return (
        <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden border-x border-border/60 bg-void px-5 pb-16 sm:px-8 lg:px-10">
            <GrammarPracticeClient
                previewUserId="00000000-0000-4000-8000-000000000001"
                previewData={{
                    ...GRAMMAR_CATALOG,
                    progress: [],
                    source: "cache",
                }}
            />
        </div>
    );
}
