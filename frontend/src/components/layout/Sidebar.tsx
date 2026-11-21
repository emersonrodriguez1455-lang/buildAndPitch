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
        className={`fixed inset-0 z-40 bg-ink/20 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-paper transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="font-display text-[22px] tracking-tight text-ink">AgroAlerta</p>
            <p className="mt-1 text-[14px] text-ash">AI para café</p>
          </div>
          <button type="button" className="rounded-pill p-2 text-slate hover:bg-mist lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-pill px-4 py-2.5 text-[16px] transition ${
                  isActive ? "bg-ink text-paper" : "text-ink hover:bg-mist"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          {latestId ? (
            <NavLink
              to={`/diagnostico/${latestId}`}
              onClick={onClose}
              className={({ isActive }) =>
                `mt-3 flex items-center gap-3 rounded-pill px-4 py-2.5 text-[16px] transition ${
                  isActive ? "bg-peach text-sienna" : "bg-peach/60 text-sienna hover:bg-peach"
                }`
              }
            >
              <ClipboardList className="h-4 w-4" />
              Mi último plan
            </NavLink>
          ) : null}
        </nav>

        <div className="m-4 rounded-card bg-mist p-5 text-[14px] text-slate">
          <p className="text-[15px] text-ink">MVP de demostración</p>
          <p className="mt-2 leading-relaxed">
            Entorno de un solo usuario. Los resultados de IA requieren validación técnica.
          </p>
        </div>
      </aside>
    </>
  );
}
