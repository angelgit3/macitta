"use client";

import { DeckBuilderProvider, useDeckBuilder } from "@/contexts/DeckBuilderContext";
import { MetadataStep } from "@/components/builder/MetadataStep";
import { WorkspaceStep } from "@/components/builder/WorkspaceStep";

function BuilderWizard() {
  const { state } = useDeckBuilder();

  return (
    <div className="min-h-screen bg-void text-white">
      {state.activeStep === "METADATA" ? <MetadataStep /> : <WorkspaceStep />}
    </div>
  );
}

export default function NuevoVocabularioPage() {
  return (
    <DeckBuilderProvider>
      <BuilderWizard />
    </DeckBuilderProvider>
  );
}
