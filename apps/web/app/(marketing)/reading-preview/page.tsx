import { READING_CATALOG } from "@macitta/shared";
import { notFound } from "next/navigation";
import { ReadingPracticeClient } from "../../(app)/reading/ReadingPracticeClient";

export default function ReadingPreviewPage() {
    if (process.env.NODE_ENV !== "development") notFound();

    return (
        <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden border-x border-border/60 bg-void px-5 pb-16 sm:px-8 lg:px-10">
            <ReadingPracticeClient
                previewUserId="00000000-0000-4000-8000-000000000001"
                previewData={{
                    ...READING_CATALOG,
                    questionProgress: [],
                    skillProgress: [],
                    exposures: [],
                    source: "cache",
                }}
            />
        </div>
    );
}
