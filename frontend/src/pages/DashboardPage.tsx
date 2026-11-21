import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  MapPinned,
  ScanLine,
  Sprout,
} from "lucide-react";
import { DiseaseChart } from "../components/charts/DiseaseChart";
import { TimelineChart } from "../components/charts/TimelineChart";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingBlock } from "../components/common/LoadingBlock";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/common/StatCard";
import { useToast } from "../contexts/ToastContext";
import {
  extractErrorMessage,
  getDiseaseStats,
  getSummary,
  getTimeline,
  listDiagnoses,
} from "../services/api";
import type { Diagnosis, DiseaseStatItem, StatisticsSummary, TimelinePoint } from "../types";
import { formatDateTime, formatPercent } from "../utils/format";

export function DashboardPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [diseases, setDiseases] = useState<DiseaseStatItem[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [recent, setRecent] = useState<Diagnosis[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryData, diseaseData, timelineData, history] = await Promise.all([
          getSummary(),
          getDiseaseStats(),
          getTimeline("week"),
          listDiagnoses({ page: 1, page_size: 5 }),
        ]);
        setSummary(summaryData);
        setDiseases(diseaseData);
        setTimeline(timelineData);
        setRecent(history.items);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudo cargar el dashboard."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [notify]);

  if (loading) return <LoadingBlock label="Preparando el panel de AgroAlerta..." />;

  return (
    <div>
      <PageHeader
        title="Bienvenido a AgroAlerta AI"
        subtitle="Monitorea la salud de tus cultivos de café con visión artificial experimental."
        actions={
          <Link to="/diagnostico" className="btn-primary">
            <ScanLine className="h-4 w-4" />
            Nuevo análisis
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fincas registradas" value={summary?.total_farms ?? 0} icon={MapPinned} />
        <StatCard label="Inspecciones" value={summary?.total_diagnoses ?? 0} icon={Activity} />
        <StatCard
          label="Posibles casos"
          value={summary?.possible_issues ?? 0}
          icon={AlertTriangle}
          tone="warn"
        />
        <StatCard
          label="Aparentemente sanas"
          value={`${summary?.healthy_percentage ?? 0}%`}
          icon={HeartPulse}
          tone="ok"
          hint="Sobre el total de inspecciones"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="card-surface p-5">
          <h3 className="mb-4 text-base font-semibold text-ink">Diagnósticos por categoría</h3>
          {diseases.length === 0 ? (
            <EmptyState
              icon={Sprout}
              title="Sin clasificaciones aún"
              description="Cuando realices inspecciones, aquí verás la distribución por clase del modelo."
            />
          ) : (
            <DiseaseChart data={diseases} />
          )}
        </section>

        <section className="card-surface p-5">
          <h3 className="mb-4 text-base font-semibold text-ink">Inspecciones en el tiempo</h3>
          {timeline.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Sin actividad temporal"
              description="El historial semanal aparecerá automáticamente al guardar diagnósticos."
            />
          ) : (
            <TimelineChart data={timeline} />
          )}
        </section>
      </div>

      <section className="card-surface mt-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">Últimos diagnósticos</h3>
          <Link to="/historial" className="text-sm font-medium text-leaf hover:underline">
            Ver historial
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title="Aún no hay inspecciones"
            description="Registra una finca, una parcela y carga la primera fotografía de hoja de café."
            action={
              <Link to="/diagnostico" className="btn-primary">
                Iniciar primer análisis
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-mist">
                <tr>
                  <th className="px-2 py-2">Clasificación</th>
                  <th className="px-2 py-2">Confianza</th>
                  <th className="px-2 py-2">Finca</th>
                  <th className="px-2 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-t border-mint/70">
                    <td className="px-2 py-3 font-medium text-ink">{item.predicted_class_label}</td>
                    <td className="px-2 py-3 text-mist">{formatPercent(item.confidence)}</td>
                    <td className="px-2 py-3 text-mist">{item.farm_name}</td>
                    <td className="px-2 py-3 text-mist">{formatDateTime(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
