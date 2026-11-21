import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LatestPlanBanner } from "../diagnosis/LatestPlanBanner";
import { getHealth, getLatestDiagnosis } from "../../services/api";
import {
  clearDismissedBannerId,
  readDismissedBannerId,
  rememberDismissedBannerId,
} from "../../utils/bannerDismiss";
import { rememberLastDiagnosisId } from "../../utils/lastPlan";
import type { Diagnosis } from "../../types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/diagnostico": "Nuevo diagnóstico",
  "/historial": "Historial",
  "/fincas": "Fincas y parcelas",
  "/estadisticas": "Estadísticas",
};

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelReady, setModelReady] = useState<boolean | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [latest, setLatest] = useState<Diagnosis | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => readDismissedBannerId() != null);

  const title = useMemo(() => {
    if (location.pathname.includes("/seguimiento")) return "Seguimiento";
    if (location.pathname.startsWith("/diagnostico/")) return "Detalle del caso";
    return titles[location.pathname] || "AgroAlerta AI";
  }, [location.pathname]);

  const refreshLatest = useCallback(async () => {
    try {
      const data = await getLatestDiagnosis();
      setLatest(data);
      if (data) {
        // Quiet persist — do not emit "new plan" (that would reopen a dismissed banner)
        rememberLastDiagnosisId(data.id, { notify: false });
        const dismissedId = readDismissedBannerId();
        if (dismissedId === data.id) {
          setBannerDismissed(true);
        } else if (dismissedId != null && dismissedId !== data.id) {
          clearDismissedBannerId();
          setBannerDismissed(false);
        }
      } else {
        clearDismissedBannerId();
        setBannerDismissed(false);
      }
    } catch {
      // keep previous
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
  }, [location.pathname, refreshLatest]);

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: number }>).detail;
      const newId = detail?.id;
      const dismissedId = readDismissedBannerId();
      // Only reopen when a genuinely new diagnosis arrives
      if (newId != null && dismissedId != null && newId === dismissedId) {
        void refreshLatest();
        return;
      }
      clearDismissedBannerId();
      setBannerDismissed(false);
      void refreshLatest();
    };
    window.addEventListener("agroalerta:last-plan-updated", onUpdated);
    return () => window.removeEventListener("agroalerta:last-plan-updated", onUpdated);
  }, [refreshLatest]);

  const hideBannerOnDetail =
    location.pathname === "/dashboard" ||
    (latest != null &&
      (location.pathname === `/diagnostico/${latest.id}` ||
        location.pathname === `/diagnostico/${latest.id}/seguimiento`));

  const onDismissBanner = () => {
    if (latest) rememberDismissedBannerId(latest.id);
    setBannerDismissed(true);
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} latestId={latest?.id ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          modelReady={modelReady}
          modelLoading={modelLoading}
          onMenu={() => setSidebarOpen(true)}
          latest={latest}
        />
        {!hideBannerOnDetail && latest && !bannerDismissed ? (
          <LatestPlanBanner diagnosis={latest} onDismiss={onDismissBanner} />
        ) : null}
        <main key={location.pathname} className="page-enter flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Outlet context={{ modelReady, modelLoading, latestDiagnosis: latest, refreshLatest }} />
        </main>
      </div>
    </div>
  );
}
