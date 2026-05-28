import { AppHeader } from "@/components/ui/AppHeader";
import { createClient } from "@/utils/supabase/server";
import { TOEFLResultsClient } from "./TOEFLResultsClient";

export const dynamic = "force-dynamic";

export default async function TOEFLResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>No autorizado</div>;
    }

    const { attemptId } = await params;

    return (
        <>
            <AppHeader />
            <TOEFLResultsClient
                attemptId={attemptId}
                userId={user.id}
            />
        </>
    );
}
