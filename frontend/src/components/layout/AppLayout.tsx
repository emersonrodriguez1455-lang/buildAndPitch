import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LatestPlanBanner } from "../diagnosis/LatestPlanBanner";
import { getHealth, getLatestDiagnosis } from "../../services/api";
import { rememberLastDiagnosisId } from "../../utils/lastPlan";
import type { Diagnosis } from "../../types";
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
  const [latest, setLatest] = useState<Diagnosis | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const title = useMemo(() => {
    if (location.pathname.includes("/seguimiento")) return "Seguimiento del caso";
    if (location.pathname.startsWith("/diagnostico/")) return "Detalle del caso";
    return titles[location.pathname] || "AgroAlerta AI";
  }, [location.pathname]);

  const refreshLatest = useCallback(async () => {
    try {
      const data = await getLatestDiagnosis();
      setLatest(data);
      if (data) rememberLastDiagnosisId(data.id);
    } catch {
      // keep previous banner content if backend briefly fails
    }
  }, []);

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

  useEffect(() => {
    void refreshLatest();
    setBannerDismissed(false);
  }, [location.pathname, refreshLatest]);

  useEffect(() => {
    const onUpdated = () => {
      void refreshLatest();
      setBannerDismissed(false);
    };
    window.addEventListener("agroalerta:last-plan-updated", onUpdated);
    return () => window.removeEventListener("agroalerta:last-plan-updated", onUpdated);
  }, [refreshLatest]);

  const hideBannerOnDetail =
    latest != null &&
    (location.pathname === `/diagnostico/${latest.id}` ||
      location.pathname === `/diagnostico/${latest.id}/seguimiento`);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} latestId={latest?.id ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          modelReady={modelReady}
          modelLoading={modelLoading}
          onMenu={() => setSidebarOpen(true)}
          latest={latest}
        />
        {!hideBannerOnDetail ? (
          <LatestPlanBanner
            diagnosis={latest}
            dismissed={bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet context={{ modelReady, modelLoading, latestDiagnosis: latest, refreshLatest }} />
        </main>
      </div>
    </div>
  );
}
