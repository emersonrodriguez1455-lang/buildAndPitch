import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";
import type { Diagnosis } from "../../types";
import { formatDateTime, formatPercent } from "../../utils/format";

export function LatestPlanCard({ diagnosis }: { diagnosis: Diagnosis | null }) {
  if (!diagnosis || !diagnosis.care_plan) {
    return (
      <section className="card-surface">
        <p className="section-label">Plan activo</p>
        <h3 className="mt-2 font-display text-[26px] tracking-tight text-ink">Aún no hay un plan</h3>
        <p className="mt-2 max-w-xl text-[16px] text-slate">
          Cuando hagas un análisis, aquí quedará la última recomendación para consultarla cuando quieras.
        </p>
        <Link to="/diagnostico" className="btn-primary mt-6">
          <ScanLine className="h-4 w-4" />
          Analizar hoja
        </Link>
      </section>
    );
  }

  const plan = diagnosis.care_plan;
  const steps = plan.primary_steps.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-card">
      <div className="card-peach">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[14px] text-sienna/70">Plan activo</p>
            <h3 className="mt-1 font-display text-[32px] leading-tight tracking-tight text-sienna sm:text-[40px]">
              {diagnosis.predicted_class_label}
            </h3>
            <p className="mt-2 text-[15px] text-sienna/80">
              {diagnosis.farm_name} · {diagnosis.plot_name} · {formatDateTime(diagnosis.created_at)} ·{" "}
              {formatPercent(diagnosis.confidence)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {diagnosis.trend ? (
              <span className="rounded-pill bg-paper/60 px-3 py-1 text-[13px] text-sienna">
                {diagnosis.trend.label}
              </span>
            ) : null}
            <span className="rounded-pill bg-paper/60 px-3 py-1 text-[13px] text-sienna">
              Revisar en {plan.next_check_days} días
            </span>
          </div>
        </div>
        <p className="mt-5 text-[17px] text-sienna">{plan.headline}</p>
      </div>

      <div className="grid bg-mist lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5">
          <p className="section-label mb-3">Qué hacer ahora</p>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-[16px] text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] text-paper">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {plan.primary_steps.length > 3 ? (
            <Link to={`/diagnostico/${diagnosis.id}`} className="btn-ghost mt-2">
              Ver todos los pasos →
            </Link>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-2 border-t border-border p-5 lg:border-l lg:border-t-0">
          <Link to={`/diagnostico/${diagnosis.id}`} className="btn-secondary w-full justify-center">
            Ver recomendación
          </Link>
          <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary w-full justify-center">
            Dar seguimiento
          </Link>
        </div>
      </div>
    </section>
  );
}
