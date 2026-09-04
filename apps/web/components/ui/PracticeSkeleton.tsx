import { MacittaMarkIcon } from "@/components/ui/Logo";

/**
 * PracticeSkeleton — shown while a heavy practice experience
 * (grammar, listening, reading, study session, TOEFL exam) loads as a
 * deferred chunk. Calm, branded, and quiet: the task surface arrives whole.
 */
export function PracticeSkeleton({ label }: { label?: string }) {
  return (
    <div
      className="flex min-h-[50dvh] w-full flex-col items-center justify-center gap-5"
      role="status"
      aria-live="polite"
      aria-label={label ? `Preparando ${label}` : "Preparando la sesión"}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface motion-safe:animate-pulse">
        <MacittaMarkIcon size={30} color="var(--color-accent)" />
      </div>
      <p className="text-sm font-bold text-ink-faint">
        {label ? `Preparando ${label}…` : "Preparando tu sesión…"}
      </p>
    </div>
  );
}
