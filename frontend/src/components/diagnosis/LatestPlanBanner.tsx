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

  return (
    <div className="border-b border-mint bg-white px-4 py-2 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <ClipboardList className="h-4 w-4 shrink-0 text-leaf" />
          <p className="truncate text-sm text-ink">
            <span className="font-semibold">Plan activo:</span> {diagnosis.predicted_class_label}
            <span className="text-mist"> · {diagnosis.care_plan.primary_steps[0]}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to={`/diagnostico/${diagnosis.id}`}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-forest hover:bg-mint"
          >
            Ver
          </Link>
          <Link
            to={`/diagnostico/${diagnosis.id}/seguimiento`}
            className="inline-flex items-center gap-1 rounded-lg bg-leaf px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest"
          >
            <RefreshCw className="h-3 w-3" />
            Seguir
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-mist hover:bg-canvas hover:text-forest"
            aria-label="Ocultar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
