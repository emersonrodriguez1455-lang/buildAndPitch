import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getHealth } from "../../services/api";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/diagnostico": "Nuevo diagnóstico",
  "/historial": "Historial de diagnósticos",
  "/fincas": "Fincas y parcelas",
  "/estadisticas": "Estadísticas",
};

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  const title = useMemo(() => {
    if (location.pathname.startsWith("/diagnostico/")) return "Detalle del diagnóstico";
    return titles[location.pathname] || "AgroAlerta AI";
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const health = await getHealth();
        if (!active) return;
        setModelReady(health.model.available);
        setModelLoading(health.model.loading);
      } catch {
        if (!active) return;
        setModelReady(false);
        setModelLoading(false);
      }
    };
    poll();
    const id = window.setInterval(poll, 8000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          modelReady={modelReady}
          modelLoading={modelLoading}
          onMenu={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet context={{ modelReady, modelLoading }} />
        </main>
      </div>
    </div>
  );
}
