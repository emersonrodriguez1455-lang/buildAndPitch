import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warn" | "ok";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  const toneClass =
    tone === "warn" ? "bg-warn/15 text-warn" : tone === "ok" ? "bg-mint text-leaf" : "bg-mint text-forest";

  return (
    <div className="card-surface p-4 animate-fadeUp">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-mist">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs text-mist">{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
