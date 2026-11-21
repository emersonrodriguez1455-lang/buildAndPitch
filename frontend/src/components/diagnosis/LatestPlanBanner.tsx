import { Link } from "react-router-dom";
import { X } from "lucide-react";
import type { Diagnosis } from "../../types";

interface LatestPlanBannerProps {
  diagnosis: Diagnosis | null;
  dismissed: boolean;
  onDismiss: () => void;
}

export function LatestPlanBanner({ diagnosis, dismissed, onDismiss }: LatestPlanBannerProps) {
  if (!diagnosis || dismissed || !diagnosis.care_plan) return null;

  return (
    <div className="border-b border-border bg-fog px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-page flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-[14px] text-ink sm:truncate sm:text-[15px]">
          <span className="text-ash">Plan activo · </span>
          <span className="font-medium">{diagnosis.predicted_class_label}</span>
          <span className="text-slate"> — {diagnosis.care_plan.primary_steps[0]}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={`/diagnostico/${diagnosis.id}`} className="btn-ghost !py-0 text-[14px] sm:text-[15px]">
            Ver recomendación →
          </Link>
          <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary !h-9 px-4 text-[14px]">
            Seguir
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-pill p-2 text-ash hover:bg-mist hover:text-ink"
            aria-label="Ocultar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
