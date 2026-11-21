import { Link } from "react-router-dom";
import { ClipboardList, RefreshCw, X } from "lucide-react";
import type { Diagnosis } from "../../types";

interface LatestPlanBannerProps {
  diagnosis: Diagnosis | null;
  dismissed: boolean;
  onDismiss: () => void;
}

export function LatestPlanBanner({ diagnosis, dismissed, onDismiss }: LatestPlanBannerProps) {
  if (!diagnosis || dismissed || !diagnosis.care_plan) return null;

  const firstStep = diagnosis.care_plan.primary_steps[0];

  return (
    <div className="border-b border-leaf/20 bg-mint/70 px-4 py-2.5 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex items-start gap-2.5">
          <div className="mt-0.5 rounded-lg bg-leaf/15 p-1.5 text-leaf">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest">Tu último plan a la mano</p>
            <p className="truncate text-sm font-semibold text-ink">
              {diagnosis.predicted_class_label}
              <span className="font-normal text-mist"> · {diagnosis.farm_name}</span>
            </p>
            <p className="line-clamp-1 text-xs text-mist">
              {diagnosis.care_plan.headline}
              {firstStep ? ` · Paso 1: ${firstStep}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/diagnostico/${diagnosis.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
            Ver recomendación
          </Link>
          <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary !px-3 !py-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Seguimiento
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-mist hover:bg-white hover:text-forest"
            aria-label="Ocultar por ahora"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
