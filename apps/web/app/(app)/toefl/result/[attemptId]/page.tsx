import { createClient } from "@/utils/supabase/server";
import { TOEFLResultsGate } from "./TOEFLResultsGate";

export const dynamic = "force-dynamic";

export default async function TOEFLResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    const { attemptId } = await params;

    return (
        <TOEFLResultsGate
                attemptId={attemptId}
                userId={user.id}
            />
    );
}
