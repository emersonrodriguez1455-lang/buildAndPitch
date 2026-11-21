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
import { StatCard } from "../components/common/StatCard";
import { LatestPlanCard } from "../components/diagnosis/LatestPlanCard";
import { useToast } from "../contexts/ToastContext";
import {
  extractErrorMessage,
  getApiBase,
  getDiseaseStats,
  getLatestDiagnosis,
  getSummary,
  getTimeline,
  listDiagnoses,
} from "../services/api";
import type { Diagnosis, DiseaseStatItem, StatisticsSummary, TimelinePoint } from "../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../utils/format";

function Section({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{eyebrow}</p>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [diseases, setDiseases] = useState<DiseaseStatItem[]>([]);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [recent, setRecent] = useState<Diagnosis[]>([]);
  const [latest, setLatest] = useState<Diagnosis | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryData, diseaseData, timelineData, history, latestData] = await Promise.all([
          getSummary(),
          getDiseaseStats(),
          getTimeline("week"),
          listDiagnoses({ page: 1, page_size: 4 }),
          getLatestDiagnosis(),
        ]);
        setSummary(summaryData);
        setDiseases(diseaseData);
        setTimeline(timelineData);
        setRecent(history.items);
        setLatest(latestData);
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
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-mist">Panel principal</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Hola, Emerson</h1>
          <p className="mt-1 max-w-xl text-sm text-mist">
            Empieza por tu plan activo. Luego revisa el resumen y la actividad reciente.
          </p>
        </div>
        <Link to="/diagnostico" className="btn-primary shrink-0">
          <ScanLine className="h-4 w-4" />
          Nuevo análisis
        </Link>
      </header>

      <Section eyebrow="1 · Acción" title="Tu plan de hoy">
        <LatestPlanCard diagnosis={latest} />
      </Section>

      <Section eyebrow="2 · Resumen" title="Números de tu finca">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Fincas" value={summary?.total_farms ?? 0} icon={MapPinned} />
          <StatCard label="Inspecciones" value={summary?.total_diagnoses ?? 0} icon={Activity} />
          <StatCard
            label="Posibles casos"
            value={summary?.possible_issues ?? 0}
            icon={AlertTriangle}
            tone="warn"
          />
          <StatCard
            label="% aparentemente sanas"
            value={`${summary?.healthy_percentage ?? 0}%`}
            icon={HeartPulse}
            tone="ok"
          />
        </div>
      </Section>

      <Section
        eyebrow="3 · Actividad"
        title="Últimos escaneos"
        action={
          <Link to="/historial" className="text-sm font-semibold text-leaf hover:underline">
            Ver historial
          </Link>
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title="Aún no hay inspecciones"
            description="Registra una finca, una parcela y carga la primera fotografía."
            action={
              <Link to="/diagnostico" className="btn-primary">
                Iniciar primer análisis
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((item) => (
              <Link
                key={item.id}
                to={`/diagnostico/${item.id}`}
                className="flex gap-3 rounded-2xl border border-mint bg-white p-3 transition hover:border-leaf/40 hover:shadow-soft"
              >
                <img
                  src={apiImageUrl(item.image_url, getApiBase())}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold text-ink">{item.predicted_class_label}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.is_healthy ? "bg-mint text-leaf" : "bg-warn/15 text-warn"
                      }`}
                    >
                      {item.is_healthy ? "Sana" : "Atención"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-mist">
                    {item.farm_name} · {formatPercent(item.confidence)}
                  </p>
                  <p className="mt-1 text-xs text-mist">{formatDateTime(item.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow="4 · Tendencias" title="Cómo van tus cultivos">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-mint bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Por clasificación</h3>
            {diseases.length === 0 ? (
              <EmptyState
                icon={Sprout}
                title="Sin datos"
                description="Las gráficas aparecerán con tus inspecciones."
              />
            ) : (
              <DiseaseChart data={diseases} />
            )}
          </div>
          <div className="rounded-2xl border border-mint bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">En el tiempo</h3>
            {timeline.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sin datos"
                description="La evolución semanal se construye sola al guardar diagnósticos."
              />
            ) : (
              <TimelineChart data={timeline} />
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
