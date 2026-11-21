import {
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import type { CarePlan, TrendInfo } from "../../types";

function TrendBadge({ trend }: { trend?: TrendInfo | null }) {
  if (!trend) return null;
  const Icon =
    trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const tone =
    trend.direction === "up"
      ? "bg-mint text-leaf"
      : trend.direction === "down"
        ? "bg-alert/10 text-alert"
        : "bg-canvas text-mist";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      <Icon className="h-3.5 w-3.5" />
      {trend.label}
    </div>
  );
}

function modeMeta(mode: string) {
  if (mode === "prevencion") {
    return {
      icon: ShieldCheck,
      tone: "bg-mint text-leaf",
      label: "Prevención",
    };
  }
  if (mode === "verificar") {
    return {
      icon: Stethoscope,
      tone: "bg-warn/15 text-warn",
      label: "Verificar síntomas",
    };
  }
  return {
    icon: HeartPulse,
    tone: "bg-alert/10 text-alert",
    label: "Manejo y seguimiento",
  };
}

export function CarePlanPanel({
  carePlan,
  trend,
}: {
  carePlan?: CarePlan | null;
  trend?: TrendInfo | null;
}) {
  if (!carePlan) return null;
  const meta = modeMeta(carePlan.mode);
  const Icon = meta.icon;

  return (
    <section className="card-surface space-y-5 p-5 animate-fadeUp">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${meta.tone}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mist">{meta.label}</p>
            <h3 className="mt-1 text-lg font-bold text-ink">{carePlan.headline}</h3>
            <p className="mt-1 max-w-2xl text-sm text-mist">{carePlan.summary}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <TrendBadge trend={trend} />
          <p className="text-xs text-mist">Próxima revisión sugerida: {carePlan.next_check_days} días</p>
        </div>
      </div>

      {trend ? <p className="rounded-xl bg-canvas px-3 py-2 text-sm text-ink">{trend.description}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mint bg-canvas/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-forest">
            <ClipboardList className="h-4 w-4" />
            Pasos a seguir ahora
          </div>
          <ol className="space-y-2">
            {carePlan.primary_steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-ink">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-mint bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <CheckCircle2 className="h-4 w-4 text-leaf" />
            {carePlan.mode === "prevencion" ? "Checklist de verificación" : "También te ayuda prevenir"}
          </div>
          <ul className="space-y-2">
            {carePlan.secondary_steps.map((step) => (
              <li key={step} className="flex gap-2 text-sm text-mist">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-warn/30 bg-warn/10 p-3 text-sm text-ink">
        <p className="font-semibold text-warn">Apoyo técnico</p>
        <p className="mt-1">{carePlan.technician_advice}</p>
        <p className="mt-2 text-xs text-mist">{carePlan.disclaimer}</p>
      </div>
    </section>
  );
}
