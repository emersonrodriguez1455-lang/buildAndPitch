import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { CarePlan, TrendInfo } from "../../types";

function TrendBadge({ trend }: { trend?: TrendInfo | null }) {
  if (!trend) return null;
  const Icon =
    trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;

  return (
    <div className="inline-flex items-center gap-2 rounded-pill bg-mist px-3 py-1 text-[13px] text-slate">
      <Icon className="h-3.5 w-3.5" />
      {trend.label}
    </div>
  );
}

export function CarePlanPanel({
  carePlan,
  trend,
}: {
  carePlan?: CarePlan | null;
  trend?: TrendInfo | null;
}) {
  if (!carePlan) return null;

  const isPrevention = carePlan.mode === "prevencion";

  return (
    <section className="space-y-5 animate-fadeUp">
      <div className={isPrevention ? "card-peach" : "card-elevated"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-[14px] ${isPrevention ? "text-sienna/70" : "text-ash"}`}>
              {carePlan.mode === "prevencion"
                ? "Prevención"
                : carePlan.mode === "verificar"
                  ? "Verificar síntomas"
                  : "Manejo y seguimiento"}
            </p>
            <h3
              className={`mt-2 font-display text-[28px] leading-tight tracking-tight sm:text-[32px] ${
                isPrevention ? "text-sienna" : "text-ink"
              }`}
            >
              {carePlan.headline}
            </h3>
            <p className={`mt-3 max-w-2xl text-[16px] ${isPrevention ? "text-sienna/80" : "text-slate"}`}>
              {carePlan.summary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <TrendBadge trend={trend} />
            <p className={`text-[14px] ${isPrevention ? "text-sienna/70" : "text-ash"}`}>
              Próxima revisión: {carePlan.next_check_days} días
            </p>
          </div>
        </div>
      </div>

      {trend ? <p className="rounded-card bg-mist px-5 py-4 text-[15px] text-slate">{trend.description}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface">
          <p className="section-label mb-4">Pasos a seguir ahora</p>
          <ol className="space-y-3">
            {carePlan.primary_steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-[16px] text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] text-paper">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card-elevated">
          <p className="section-label mb-4">
            {carePlan.mode === "prevencion" ? "Checklist de verificación" : "También ayuda prevenir"}
          </p>
          <ul className="space-y-3">
            {carePlan.secondary_steps.map((step) => (
              <li key={step} className="flex gap-2 text-[16px] text-slate">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-card border border-border bg-fog px-5 py-4 text-[15px] text-slate">
        <p className="font-medium text-ink">Apoyo técnico</p>
        <p className="mt-2">{carePlan.technician_advice}</p>
        <p className="mt-2 text-[14px] text-ash">{carePlan.disclaimer}</p>
      </div>
    </section>
  );
}
