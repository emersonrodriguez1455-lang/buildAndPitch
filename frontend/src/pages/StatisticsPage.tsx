import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
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
  getFarmActivity,
  getSummary,
  getTimeline,
} from "../services/api";
import type { DiseaseStatItem, FarmActivityItem, StatisticsSummary, TimelinePoint } from "../types";
import { Activity, AlertTriangle, HeartPulse, MapPinned } from "lucide-react";

export function StatisticsPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [diseases, setDiseases] = useState<DiseaseStatItem[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [farms, setFarms] = useState<FarmActivityItem[]>([]);
  const [granularity, setGranularity] = useState<"week" | "month">("week");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryData, diseaseData, timelineData, farmData] = await Promise.all([
          getSummary(),
          getDiseaseStats(),
          getTimeline(granularity),
          getFarmActivity(),
        ]);
        setSummary(summaryData);
        setDiseases(diseaseData);
        setTimeline(timelineData);
        setFarms(farmData);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudieron cargar las estadísticas."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [granularity, notify]);

  if (loading) return <LoadingBlock label="Calculando estadísticas..." />;

  const healthyIssue = [
    {
      name: "Aparentemente sanas",
      value: Math.max(0, (summary?.total_diagnoses ?? 0) - (summary?.possible_issues ?? 0)),
    },
    { name: "Posibles problemas", value: summary?.possible_issues ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Estadísticas"
        subtitle="Indicadores construidos únicamente a partir de inspecciones reales guardadas."
        actions={
          <select
            className="input-field w-auto"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as "week" | "month")}
          >
            <option value="week">Por semana</option>
            <option value="month">Por mes</option>
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Fincas" value={summary?.total_farms ?? 0} icon={MapPinned} />
        <StatCard label="Inspecciones" value={summary?.total_diagnoses ?? 0} icon={Activity} />
        <StatCard label="Posibles problemas" value={summary?.possible_issues ?? 0} icon={AlertTriangle} tone="warn" />
        <StatCard label="% saludables" value={`${summary?.healthy_percentage ?? 0}%`} icon={HeartPulse} tone="ok" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="card-surface p-5">
          <h3 className="mb-4 font-semibold text-ink">Por clasificación</h3>
          {diseases.length === 0 ? (
            <EmptyState icon={BarChart3} title="Sin datos" description="Aún no hay diagnósticos para graficar." />
          ) : (
            <DiseaseChart data={diseases} />
          )}
        </section>

        <section className="card-surface p-5">
          <h3 className="mb-4 font-semibold text-ink">Evolución temporal</h3>
          {timeline.length === 0 ? (
            <EmptyState icon={BarChart3} title="Sin datos" description="La línea de tiempo aparecerá con nuevas inspecciones." />
          ) : (
            <TimelineChart data={timeline} />
          )}
        </section>

        <section className="card-surface p-5">
          <h3 className="mb-4 font-semibold text-ink">Saludables vs posibles problemas</h3>
          {(summary?.total_diagnoses ?? 0) === 0 ? (
            <EmptyState icon={BarChart3} title="Sin datos" description="Realiza inspecciones para ver la distribución." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthyIssue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDF3E5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#738078" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#738078" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#DDF3E5" }} />
                  <Bar dataKey="value" fill="#163B2B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card-surface p-5">
          <h3 className="mb-4 font-semibold text-ink">Actividad por finca</h3>
          {farms.length === 0 ? (
            <EmptyState icon={MapPinned} title="Sin fincas" description="Registra fincas y diagnósticos para comparar actividad." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farms}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDF3E5" />
                  <XAxis dataKey="farm_name" tick={{ fontSize: 11, fill: "#738078" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#738078" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#DDF3E5" }} />
                  <Bar dataKey="diagnosis_count" name="Inspecciones" fill="#238B57" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
