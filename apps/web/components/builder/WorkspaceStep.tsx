"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDeckBuilder } from "../../contexts/DeckBuilderContext";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { CardSidebar } from "./CardSidebar";
import { CardEditor } from "./CardEditor";
import { exportDeckJson } from "../../contexts/deckBuilderUtils";
import { importDeckFromJson } from "../../app/actions/decks-import";
import { ZenButton } from "@/components/ui/ZenButton";

export function WorkspaceStep() {
  const { state, dispatch } = useDeckBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Hay contenido sin guardar mientras existan cartas en el builder.
  const isDirty = state.cards.length > 0;

  // Aviso nativo al cerrar/recargar la pestaña con trabajo sin guardar.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // beforeunload no cubre la navegación interna del App Router: intercepta
  // clicks en enlaces internos (dock, "Volver", etc.) y pide confirmación.
  useEffect(() => {
    if (!isDirty) return;
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("/")) return;
      const leave = window.confirm(
        "Tienes cartas sin guardar. Si sales ahora perderás el mazo completo. ¿Salir sin guardar?"
      );
      if (!leave) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const jsonString = exportDeckJson(state);
      const result = await importDeckFromJson(jsonString);
      
      if (result.success) {
        router.push("/vocabulario");
      }
    } catch (err: any) {
      // TODO: Wire up to error reporting SDK (e.g., Sentry)
      setError(err.message || "Error al guardar el mazo.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-[calc(100vh-theme(spacing.16))] w-full flex-col overflow-hidden rounded-2xl border border-border bg-void">
      {/* Glowing Edge Effect */}
      <div className="absolute inset-x-0 -top-px h-px w-full bg-accent/25"></div>

      {/* Header */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-surface px-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => dispatch({ type: "PREV_STEP" })}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-void/50 border border-border hover:border-accent hover:text-accent text-ink-faint transition-all"
            title="Volver a Metadatos"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold text-ink leading-tight tracking-tight">{state.metadata.name || "Nuevo Mazo"}</h2>
            <span className="mt-0.5 text-xs font-medium text-ink-faint">
              {state.cards.length} carta{state.cards.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {error && <span className="text-danger text-sm font-medium bg-danger/10 px-3 py-1.5 rounded-lg border border-danger/20">{error}</span>}
          <ZenButton
            onClick={handleSave}
            disabled={isSaving || state.cards.length === 0}
            className="px-6 py-2.5 gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Guardando..." : "Guardar Mazo"}
          </ZenButton>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex flex-col flex-1 overflow-hidden bg-void">
        <CardSidebar />
        <CardEditor />
      </div>
    </div>
  );
}
