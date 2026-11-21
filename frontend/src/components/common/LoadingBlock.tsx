export function LoadingBlock({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-card bg-mist px-4 py-12 text-[15px] text-slate">
      <span className="h-2 w-2 animate-pulseSoft rounded-full bg-ink" />
      {label}
    </div>
  );
}
