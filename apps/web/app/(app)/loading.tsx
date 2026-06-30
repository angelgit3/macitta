function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-4 rounded-full bg-white/7 ${className}`} />;
}

export default function AppLoading() {
  return (
    <div
      className="flex w-full flex-col gap-6 pb-24 motion-safe:animate-pulse"
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div className="mx-auto h-11 w-32 rounded-xl bg-white/7" />

      <section className="product-panel rounded-2xl p-5 sm:p-7" aria-hidden="true">
        <SkeletonLine className="w-24" />
        <div className="mt-4 h-8 w-3/5 max-w-md rounded-xl bg-white/9" />
        <div className="mt-5 space-y-3">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="min-h-24 rounded-2xl border border-border bg-surface/60 p-5">
            <div className="size-5 rounded-md bg-white/9" />
            <SkeletonLine className="mt-4 w-2/3" />
          </div>
        ))}
      </section>

      <span className="sr-only">Cargando la siguiente pantalla.</span>
    </div>
  );
}
