import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import type { Diagnosis } from "../../types";

interface LatestPlanBannerProps {
  diagnosis: Diagnosis;
  onDismiss: () => void;
}

export function LatestPlanBanner({ diagnosis, onDismiss }: LatestPlanBannerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    const id = window.setTimeout(() => setOpen(true), 16);
    return () => window.clearTimeout(id);
  }, [diagnosis.id]);

  if (!diagnosis.care_plan) return null;

  return (
    <div
      className={`plan-banner-slot ${open ? "is-open" : ""}`}
      role="region"
      aria-label="Plan activo"
    >
      <div className="plan-banner-panel">
        <div className="mx-auto flex max-w-page flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <p className="min-w-0 text-[14px] leading-snug text-ink sm:truncate sm:text-[15px]">
            <span className="text-ash">Plan activo · </span>
            <span className="font-medium">{diagnosis.predicted_class_label}</span>
            <span className="text-slate"> — {diagnosis.care_plan.primary_steps[0]}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/diagnostico/${diagnosis.id}`}
              className="btn-ghost !py-2 text-[14px] sm:text-[15px]"
            >
              Ver recomendación →
            </Link>
            <Link
              to={`/diagnostico/${diagnosis.id}/seguimiento`}
              className="btn-primary !h-9 px-4 text-[14px]"
            >
              Seguir
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDismiss();
              }}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-[#ececec] bg-white text-[#17191c] transition-colors duration-150 hover:bg-[#f2f2f3]"
              aria-label="Ocultar plan activo"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
