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
      <div className="mx-auto flex max-w-page items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] text-ink">
          <span className="text-ash">Plan activo · </span>
          <span className="font-medium">{diagnosis.predicted_class_label}</span>
          <span className="text-slate"> — {diagnosis.care_plan.primary_steps[0]}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={`/diagnostico/${diagnosis.id}`} className="btn-ghost !py-0 text-[15px]">
            Ver recomendación →
          </Link>
          <Link
            to={`/diagnostico/${diagnosis.id}/seguimiento`}
            className="rounded-pill bg-ink px-4 py-2 text-[14px] text-paper"
          >
            Seguir
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-pill p-1.5 text-ash hover:bg-mist hover:text-ink"
            aria-label="Ocultar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
