import { Menu, UserRound } from "lucide-react";

interface TopbarProps {
  title: string;
  modelReady: boolean | null;
  modelLoading: boolean;
  onMenu: () => void;
}

export function Topbar({ title, modelReady, modelLoading, onMenu }: TopbarProps) {
  const statusLabel = modelLoading
    ? "Cargando modelo..."
    : modelReady
      ? "IA disponible"
      : modelReady === false
        ? "IA no disponible"
        : "Verificando IA";

  const statusColor = modelLoading
    ? "bg-warn"
    : modelReady
      ? "bg-leaf"
      : modelReady === false
        ? "bg-alert"
        : "bg-mist";

  return (
    <header className="sticky top-0 z-30 border-b border-mint/70 bg-canvas/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-xl border border-mint bg-white p-2 text-forest lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-mist">Sección</p>
            <h2 className="text-base font-semibold text-ink sm:text-lg">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-mint bg-white px-3 py-1.5 text-xs font-medium text-ink sm:flex">
            <span className={`h-2 w-2 rounded-full ${statusColor}`} />
            {statusLabel}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-mint bg-white px-2.5 py-1.5">
            <div className="rounded-full bg-mint p-1.5 text-leaf">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="hidden pr-1 sm:block">
              <p className="text-xs font-semibold text-ink">Usuario demo</p>
              <p className="text-[10px] text-mist">MVP local</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
