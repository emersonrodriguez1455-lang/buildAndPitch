import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { DiagnosisDetailPage } from "../pages/DiagnosisDetailPage";
import { DiagnosisPage } from "../pages/DiagnosisPage";
import { FarmsPage } from "../pages/FarmsPage";
import { HistoryPage } from "../pages/HistoryPage";
import { StatisticsPage } from "../pages/StatisticsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/diagnostico" element={<DiagnosisPage />} />
        <Route path="/diagnostico/:id" element={<DiagnosisDetailPage />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/fincas" element={<FarmsPage />} />
        <Route path="/estadisticas" element={<StatisticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
