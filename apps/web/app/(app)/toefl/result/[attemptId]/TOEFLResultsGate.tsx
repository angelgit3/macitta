"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";

// The results view loads review services and history handling as a
// deferred chunk; the shell paints first.
const TOEFLResultsClient = dynamic(
    () => import("./TOEFLResultsClient").then((m) => m.TOEFLResultsClient),
    { ssr: false, loading: () => <PracticeSkeleton label="tus resultados" /> },
);

export function TOEFLResultsGate({
    attemptId,
    userId,
}: {
    attemptId: string;
    userId: string;
}) {
    return <TOEFLResultsClient attemptId={attemptId} userId={userId} />;
}
