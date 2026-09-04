"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// The study session ships with the offline layer (Dexie), sync logic and
// review services (~250 kB). It loads as a deferred chunk so the route's
// first paint only pays for the shell.
const StudySessionContent = dynamic(
    () => import("./StudySessionClient").then((m) => m.StudySessionContent),
    { ssr: false, loading: () => <PracticeSkeleton label="tu sesión" /> },
);

export default function StudySessionPage({ params }: { params: Promise<{ deckId: string }> }) {
    return <StudySessionContent params={params} />;
}
