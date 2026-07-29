import { notFound } from "next/navigation";
import TOEFLPracticePage from "../../(app)/toefl/page";

export default function TOEFLPreviewPage() {
    if (process.env.NODE_ENV !== "development") notFound();

    return (
        <div className="relative mx-auto min-h-dvh w-full max-w-6xl overflow-x-hidden border-x border-border/60 bg-void px-5 sm:px-8 lg:px-10">
            <TOEFLPracticePage />
        </div>
    );
}
