import { NavLink } from "react-router-dom";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Leaf,
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
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-forest/40 transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-mint/60 bg-forest text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-leaf p-2">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">AgroAlerta AI</p>
              <p className="text-[11px] text-mint/80">Inteligencia que protege tus cultivos.</p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-1 hover:bg-white/10 lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-leaf text-white" : "text-mint hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-2xl bg-white/10 p-4 text-xs text-mint">
          <p className="font-semibold text-white">MVP de demostración</p>
          <p className="mt-1 leading-relaxed">
            Entorno de un solo usuario. Los resultados de IA requieren validación técnica.
          </p>
        </div>
      </aside>
    </>
  );
}
