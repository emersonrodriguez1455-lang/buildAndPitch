import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  History,
  LayoutDashboard,
  MapPinned,
  ScanLine,
  X,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/diagnostico", label: "Nuevo diagnóstico", icon: ScanLine },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/fincas", label: "Fincas y parcelas", icon: MapPinned },
  { to: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  latestId: number | null;
}

export function Sidebar({ open, onClose, latestId }: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar-backdrop fixed inset-0 z-40 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`sidebar-panel fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] flex-col border-r border-border shadow-popover transition-transform duration-300 lg:static lg:w-72 lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
          <div>
            <p className="font-display text-[22px] tracking-tight text-ink">AgroAlerta</p>
            <p className="mt-1 text-[14px] text-ash">AI para café</p>
          </div>
          <button
            type="button"
            className="rounded-pill p-2.5 text-ink hover:bg-mist lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 sm:px-4" aria-label="Principal">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
          {latestId ? (
            <NavLink
              to={`/diagnostico/${latestId}`}
              onClick={onClose}
              className="nav-link-accent mt-3"
            >
              <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
              <span>Mi último plan</span>
            </NavLink>
          ) : null}
        </nav>

        <div className="m-3 border-t border-border px-1 pt-4 sm:m-4">
          <p className="section-label mb-2">Modelo conectado</p>
          <div
            className="inline-flex max-w-full items-center gap-2 rounded-pill border border-border bg-fog px-3 py-1.5"
            title="ixrbhii/coffee-disease-convnext · Hugging Face"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
            <span className="truncate text-[13px] text-ink">ConvNeXt · café</span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ash">
            Clasificador científico entrenado en enfermedades del café
          </p>
        </div>
      </aside>
    </>
  );
}
