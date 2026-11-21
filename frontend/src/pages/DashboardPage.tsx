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
import { DashboardSkeleton } from "../components/common/Skeleton";
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
  label,
  title,
  action,
  children,
}: {
  label: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="section-label">{label}</p>
          <h2 className="mt-1 font-display text-[32px] tracking-tight text-ink sm:text-[40px]">{title}</h2>
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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="page-shell space-y-16 pb-16">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="section-label">Panel principal</p>
          <h1 className="mt-2 font-display text-heading tracking-heading text-ink sm:text-heading-lg">
            Inteligencia que <em className="italic">protege</em> tus cultivos
          </h1>
          <p className="mt-4 text-body text-slate">
            Empieza por tu plan activo. Luego revisa el resumen y la actividad reciente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/historial" className="btn-secondary">
            Ver historial
          </Link>
          <Link to="/diagnostico" className="btn-primary">
            <ScanLine className="h-4 w-4" />
            Nuevo análisis
          </Link>
        </div>
      </header>

      <Section label="Acción" title="Tu plan de hoy">
        <LatestPlanCard diagnosis={latest} />
      </Section>

      <Section label="Resumen" title="Números de tu finca">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Fincas" value={summary?.total_farms ?? 0} icon={MapPinned} />
          <StatCard label="Inspecciones" value={summary?.total_diagnoses ?? 0} icon={Activity} />
          <StatCard label="Posibles casos" value={summary?.possible_issues ?? 0} icon={AlertTriangle} tone="warn" />
          <StatCard
            label="% aparentemente sanas"
            value={`${summary?.healthy_percentage ?? 0}%`}
            icon={HeartPulse}
            tone="ok"
          />
        </div>
      </Section>

      <Section
        label="Actividad"
        title="Últimos escaneos"
        action={
          <Link to="/historial" className="btn-ghost !py-0">
            Ver historial →
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
          <div className="grid gap-4 sm:grid-cols-2">
            {recent.map((item) => (
              <Link
                key={item.id}
                to={`/diagnostico/${item.id}`}
                className="card-elevated is-interactive flex gap-4"
              >
                <img
                  src={apiImageUrl(item.image_url, getApiBase())}
                  alt=""
                  className="h-16 w-16 rounded-image object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[16px] font-medium text-ink">{item.predicted_class_label}</p>
                    <span className="shrink-0 text-[13px] text-ash">
                      {item.is_healthy ? "Sana" : "Atención"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[14px] text-slate">
                    {item.farm_name} · {formatPercent(item.confidence)}
                  </p>
                  <p className="mt-1 text-[13px] text-ash">{formatDateTime(item.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section label="Tendencias" title="Cómo van tus cultivos">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="card-elevated">
            <p className="mb-4 text-[16px] font-medium text-ink">Por clasificación</p>
            {diseases.length === 0 ? (
              <EmptyState icon={Sprout} title="Sin datos" description="Las gráficas aparecerán con tus inspecciones." />
            ) : (
              <DiseaseChart data={diseases} />
            )}
          </div>
          <div className="card-elevated">
            <p className="mb-4 text-[16px] font-medium text-ink">En el tiempo</p>
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
