import { AppHeader } from "@/components/ui/AppHeader";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import type { TOEFLExam, TOEFLMode, TOEFLQuestion } from "@/types/models";
import { TOEFLPracticeClient } from "./TOEFLPracticeClient";

export const dynamic = "force-dynamic";

export default async function TOEFLPracticeRunPage({
    params,
    searchParams,
}: {
    params: Promise<{ examId: string }>;
    searchParams: Promise<{ mode?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    const { examId } = await params;
    const { mode } = await searchParams;
    const practiceMode: TOEFLMode = mode === "strict" ? "strict" : "flexible";

    const [{ data: exam }, { data: questions }] = await Promise.all([
        supabase.from("exams").select("*").eq("id", examId).single(),
        supabase.from("questions").select("*").eq("exam_id", examId).order("order_index", { ascending: true }),
    ]);

    if (!exam || !questions) {
        notFound();
    }

    return (
        <>
            <AppHeader />
            <TOEFLPracticeClient
                userId={user.id}
                exam={exam as TOEFLExam}
                questions={questions as TOEFLQuestion[]}
                mode={practiceMode}
            />
        </>
    );
}
