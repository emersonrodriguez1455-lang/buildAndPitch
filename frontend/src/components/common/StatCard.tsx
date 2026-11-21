import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warn" | "ok";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  const peach = tone === "warn";

  return (
    <div className={`${peach ? "card-peach" : "card-elevated"} animate-enter`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[14px] ${peach ? "text-sienna/70" : "text-ash"}`}>{label}</p>
          <p
            className={`mt-2 text-[20px] font-medium tracking-tight ${
              peach ? "text-sienna" : "text-ink"
            }`}
          >
            {value}
          </p>
          {hint ? (
            <p className={`mt-1 text-[14px] ${peach ? "text-sienna/70" : "text-slate"}`}>{hint}</p>
          ) : null}
        </div>
        <div className={`rounded-full p-2.5 ${peach ? "bg-paper/50 text-sienna" : "bg-mist text-ink"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
