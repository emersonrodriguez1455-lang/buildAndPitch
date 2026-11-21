import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, RefreshCw, ScanLine } from "lucide-react";
import type { Diagnosis } from "../../types";
import { formatDateTime, formatPercent } from "../../utils/format";

export function LatestPlanCard({ diagnosis }: { diagnosis: Diagnosis | null }) {
  if (!diagnosis || !diagnosis.care_plan) {
    return (
      <section className="rounded-2xl border border-dashed border-mint bg-white px-5 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-mint p-2.5 text-leaf">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Sin plan activo todavía</h3>
              <p className="mt-1 max-w-xl text-sm text-mist">
                Haz un análisis y aquí aparecerá la recomendación para consultarla cuando quieras.
              </p>
            </div>
          </div>
          <Link to="/diagnostico" className="btn-primary shrink-0">
            <ScanLine className="h-4 w-4" />
            Analizar hoja
          </Link>
        </div>
      </section>
    );
  }

  const plan = diagnosis.care_plan;
  const steps = plan.primary_steps.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-mint bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-mint/80 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Plan activo</p>
          <h3 className="mt-1 text-lg font-bold text-ink sm:text-xl">{diagnosis.predicted_class_label}</h3>
          <p className="mt-1 truncate text-sm text-mist">
            {diagnosis.farm_name} · {diagnosis.plot_name} · {formatDateTime(diagnosis.created_at)} ·{" "}
            {formatPercent(diagnosis.confidence)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {diagnosis.trend ? (
            <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-mist">
              {diagnosis.trend.label}
            </span>
          ) : null}
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-forest">
            Revisar en {plan.next_check_days} días
          </span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
        <div className="px-5 py-4">
          <p className="mb-3 text-sm font-medium text-ink">{plan.headline}</p>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-mist">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-ink">{step}</span>
              </li>
            ))}
          </ol>
          {plan.primary_steps.length > 3 ? (
            <Link
              to={`/diagnostico/${diagnosis.id}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-leaf hover:underline"
            >
              Ver todos los pasos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-2 border-t border-mint bg-canvas/50 px-5 py-4 lg:border-l lg:border-t-0">
          <Link to={`/diagnostico/${diagnosis.id}`} className="btn-secondary w-full justify-center">
            <ClipboardList className="h-4 w-4" />
            Ver recomendación
          </Link>
          <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary w-full justify-center">
            <RefreshCw className="h-4 w-4" />
            Dar seguimiento
          </Link>
        </div>
      </div>
    </section>
  );
}
