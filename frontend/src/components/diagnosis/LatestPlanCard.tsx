import { Link } from "react-router-dom";
import { ClipboardList, RefreshCw, ScanLine } from "lucide-react";
import type { Diagnosis } from "../../types";
import { formatDateTime } from "../../utils/format";

export function LatestPlanCard({ diagnosis }: { diagnosis: Diagnosis | null }) {
  if (!diagnosis || !diagnosis.care_plan) {
    return (
      <section className="card-surface border-dashed p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-mint p-2.5 text-leaf">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">Aún no tienes un plan activo</h3>
            <p className="mt-1 text-sm text-mist">
              Cuando hagas un análisis, aquí quedará guardada la última recomendación para consultarla cuando quieras.
            </p>
            <Link to="/diagnostico" className="btn-primary mt-4">
              <ScanLine className="h-4 w-4" />
              Hacer primer análisis
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const plan = diagnosis.care_plan;

  return (
    <section className="card-surface overflow-hidden animate-fadeUp">
      <div className="border-b border-mint bg-gradient-to-r from-mint/80 to-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">Plan activo · siempre disponible</p>
            <h3 className="mt-1 text-xl font-bold text-ink">{plan.headline}</h3>
            <p className="mt-1 text-sm text-mist">
              {diagnosis.predicted_class_label} · {diagnosis.farm_name} / {diagnosis.plot_name}
            </p>
            <p className="mt-1 text-xs text-mist">Último escaneo: {formatDateTime(diagnosis.created_at)}</p>
          </div>
          {diagnosis.trend ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                diagnosis.trend.direction === "up"
                  ? "bg-white text-leaf"
                  : diagnosis.trend.direction === "down"
                    ? "bg-alert/10 text-alert"
                    : "bg-white text-mist"
              }`}
            >
              {diagnosis.trend.label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Qué hacer ahora</p>
          <ol className="space-y-2">
            {plan.primary_steps.slice(0, 4).map((step, index) => (
              <li key={step} className="flex gap-3 rounded-xl bg-canvas px-3 py-2 text-sm text-ink">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          {plan.primary_steps.length > 4 ? (
            <p className="mt-2 text-xs text-mist">+{plan.primary_steps.length - 4} pasos más en el detalle del caso</p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-mint bg-canvas/50 p-4">
          <p className="text-sm text-mist">{plan.summary}</p>
          <p className="text-xs font-medium text-forest">
            Próxima revisión sugerida: dentro de {plan.next_check_days} días
          </p>
          <div className="flex flex-col gap-2">
            <Link to={`/diagnostico/${diagnosis.id}`} className="btn-secondary w-full">
              <ClipboardList className="h-4 w-4" />
              Ver recomendación completa
            </Link>
            <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary w-full">
              <RefreshCw className="h-4 w-4" />
              Registrar seguimiento
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
