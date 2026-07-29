import { LISTENING_CATALOG } from "@macitta/shared";
import { notFound } from "next/navigation";
import { ListeningPracticeClient } from "../../(app)/listening/ListeningPracticeClient";

export default function ListeningPreviewPage() {
    if (process.env.NODE_ENV !== "development") notFound();
    return <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden border-x border-border/60 bg-void px-5 pb-16 sm:px-8 lg:px-10"><ListeningPracticeClient previewUserId="00000000-0000-4000-8000-000000000001" previewData={{ ...LISTENING_CATALOG, questionProgress: [], skillProgress: [], source: "cache" }} /></div>;
}
