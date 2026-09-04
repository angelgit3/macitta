"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// Listening practice ships with its audio catalog, offline layer and sync
// logic (~250 kB). It loads as a deferred chunk so the route's first paint
// only pays for the shell.
const ListeningPracticeClient = dynamic(
    () => import("./ListeningPracticeClient").then((m) => m.ListeningPracticeClient),
    { ssr: false, loading: () => <PracticeSkeleton label="listening" /> },
);

export default function ListeningPage() {
    return <ListeningPracticeClient />;
}
