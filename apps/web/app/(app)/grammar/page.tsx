"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// Grammar practice ships with its content bank, offline layer and sync
// logic (~250 kB). It loads as a deferred chunk so the route's first paint
// only pays for the shell.
const GrammarPracticeClient = dynamic(
    () => import("./GrammarPracticeClient").then((m) => m.GrammarPracticeClient),
    { ssr: false, loading: () => <PracticeSkeleton label="grammar" /> },
);

export default function GrammarPage() {
    return <GrammarPracticeClient />;
}
