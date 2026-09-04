"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// Reading practice ships with its passage bank, offline layer and sync
// logic (~250 kB). It loads as a deferred chunk so the route's first paint
// only pays for the shell.
const ReadingPracticeClient = dynamic(
    () => import("./ReadingPracticeClient").then((m) => m.ReadingPracticeClient),
    { ssr: false, loading: () => <PracticeSkeleton label="reading" /> },
);

export default function ReadingPage() {
    return <ReadingPracticeClient />;
}
