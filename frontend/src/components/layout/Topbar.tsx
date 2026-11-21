import { Link } from "react-router-dom";
import { ClipboardList, Menu } from "lucide-react";
import type { Diagnosis } from "../../types";

interface TopbarProps {
  title: string;
  modelReady: boolean | null;
  modelLoading: boolean;
  onMenu: () => void;
  latest: Diagnosis | null;
}

export function Topbar({ title, modelReady, modelLoading, onMenu, latest }: TopbarProps) {
  const statusLabel = modelLoading
    ? "Cargando modelo…"
    : modelReady
      ? "IA lista"
      : modelReady === false
        ? "IA no disponible"
        : "Verificando…";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-paper/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-pill border border-border p-2 text-ink lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="section-label">Sección</p>
            <h2 className="font-display text-[22px] tracking-tight text-ink sm:text-[26px]">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {latest ? (
            <Link
              to={`/diagnostico/${latest.id}`}
              className="hidden max-w-[240px] items-center gap-2 rounded-pill bg-peach px-4 py-2 text-[14px] text-sienna md:flex"
              title={latest.care_plan?.headline || latest.predicted_class_label}
            >
              <ClipboardList className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Plan: {latest.predicted_class_label}</span>
            </Link>
          ) : null}
          <div className="status-chip hidden sm:inline-flex" aria-live="polite">
            <span className={`status-chip-dot ${modelReady ? "" : "is-muted"}`} aria-hidden />
            <span>{statusLabel}</span>
          </div>
          <div className="avatar-chip" aria-hidden>
            ER
          </div>
        </div>
      </div>
    </header>
  );
}
