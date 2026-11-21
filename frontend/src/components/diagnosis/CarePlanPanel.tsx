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

/** 0 hidden · 1 headline · 2 primary steps · 3 secondary + advice */
export type CarePlanRevealStage = 0 | 1 | 2 | 3;

export function CarePlanPanel({
  carePlan,
  trend,
  revealStage = 3,
}: {
  carePlan?: CarePlan | null;
  trend?: TrendInfo | null;
  revealStage?: CarePlanRevealStage;
}) {
  if (!carePlan || revealStage < 1) return null;

  const isPrevention = carePlan.mode === "prevencion";
  const showSteps = revealStage >= 2;
  const showSecondary = revealStage >= 3;

  return (
    <section className="space-y-5">
      <div className={`${isPrevention ? "card-peach" : "card-elevated"} animate-fadeUp`}>
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

      {showSteps && trend ? (
        <p className="surface-callout px-5 py-4 text-[15px] text-[#555861] animate-fadeUp">{trend.description}</p>
      ) : null}

      {showSteps ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card-surface animate-fadeUp">
            <p className="section-label mb-4">Pasos a seguir ahora</p>
            <ol className="space-y-3">
              {carePlan.primary_steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 text-[16px] text-ink animate-fadeUp"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <span className="step-badge">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {showSecondary ? (
            <div className="card-elevated animate-fadeUp">
              <p className="section-label mb-4">
                {carePlan.mode === "prevencion" ? "Checklist de verificación" : "También ayuda prevenir"}
              </p>
              <ul className="space-y-3">
                {carePlan.secondary_steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-2 text-[16px] text-slate animate-fadeUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="card-elevated space-y-3" aria-hidden>
              <div className="h-3 w-40 animate-pulseSoft rounded-input bg-mist" />
              <div className="h-4 w-full animate-pulseSoft rounded-input bg-mist" />
              <div className="h-4 w-5/6 animate-pulseSoft rounded-input bg-mist" />
              <div className="h-4 w-4/5 animate-pulseSoft rounded-input bg-mist" />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2" aria-hidden>
          <div className="h-48 animate-pulseSoft rounded-elevated bg-mist" />
          <div className="h-48 animate-pulseSoft rounded-elevated bg-mist" />
        </div>
      )}

      {showSecondary ? (
        <div className="rounded-card border border-border bg-fog px-5 py-4 text-[15px] text-slate animate-fadeUp">
          <p className="font-medium text-ink">Apoyo técnico</p>
          <p className="mt-2">{carePlan.technician_advice}</p>
          <p className="mt-2 text-[14px] text-ash">{carePlan.disclaimer}</p>
        </div>
      ) : null}
    </section>
  );
}
