export function LoadingBlock({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-mint bg-white px-4 py-10 text-sm text-mist">
      <span className="h-4 w-4 animate-pulseSoft rounded-full bg-leaf" />
      {label}
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-2xl bg-mint/60" />;
}
