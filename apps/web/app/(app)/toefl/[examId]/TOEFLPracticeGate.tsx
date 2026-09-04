"use client";

import dynamic from "next/dynamic";
import { PracticeSkeleton } from "@/components/ui/PracticeSkeleton";
import type { TOEFLExam, TOEFLMode, TOEFLQuestion } from "@/types/models";

// The exam runner ships with audio handling, offline layer and sync logic.
// It loads as a deferred chunk so the route's first paint only pays for
// the shell while the server has already prepared the exam data.
const TOEFLPracticeClient = dynamic(
    () => import("./TOEFLPracticeClient").then((m) => m.TOEFLPracticeClient),
    { ssr: false, loading: () => <PracticeSkeleton label="tu examen" /> },
);

export function TOEFLPracticeGate({
    userId,
    exam,
    questions,
    mode,
}: {
    userId: string;
    exam: TOEFLExam;
    questions: TOEFLQuestion[];
    mode: TOEFLMode;
}) {
    return (
        <TOEFLPracticeClient
            userId={userId}
            exam={exam}
            questions={questions}
            mode={mode}
        />
    );
}
