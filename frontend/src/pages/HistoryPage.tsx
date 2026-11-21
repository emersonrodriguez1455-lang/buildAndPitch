import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { HistorySkeleton } from "../components/common/Skeleton";
import { PageHeader } from "../components/common/PageHeader";
import { CLASS_OPTIONS } from "../constants/classes";
import { useToast } from "../contexts/ToastContext";
import {
  extractErrorMessage,
  getApiBase,
  listDiagnoses,
  listFarms,
} from "../services/api";
import type { Diagnosis, Farm } from "../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../utils/format";

function StatusPill({ item }: { item: Diagnosis }) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-[13px] ${
        item.is_healthy ? "bg-mist text-ink" : "bg-peach text-sienna"
      }`}
    >
      {item.is_healthy ? "Aparentemente sana" : "Posible problema"}
    </span>
  );
}

function HistoryCard({ item }: { item: Diagnosis }) {
  return (
    <article className="card-elevated !p-4 animate-fadeUp">
      <div className="flex gap-3">
        <Link to={`/diagnostico/${item.id}`} className="shrink-0">
          <img
            src={apiImageUrl(item.image_url, getApiBase())}
            alt=""
            className="h-16 w-16 rounded-image object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/diagnostico/${item.id}`} className="block font-medium text-ink hover:underline">
            {item.predicted_class_label}
          </Link>
          <p className="mt-0.5 text-[13px] text-slate">{formatPercent(item.confidence)} confianza</p>
          <p className="mt-1 truncate text-[13px] text-ash">
            {item.farm_name} · {item.plot_name}
          </p>
          <p className="mt-0.5 text-[13px] text-ash">{formatDateTime(item.created_at)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <StatusPill item={item} />
          {item.trend ? <p className="mt-1 text-[13px] text-slate">{item.trend.label}</p> : null}
          {(item.follow_up_count ?? 0) > 0 ? (
            <p className="mt-1 text-[13px] text-slate">{item.follow_up_count} seguimiento(s)</p>
          ) : null}
        </div>
        <Link
          to={`/diagnostico/${item.id}/seguimiento`}
          className="inline-flex items-center gap-1 rounded-pill border border-ink px-3 py-1.5 text-[13px] text-ink transition hover:bg-mist"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Seguir
        </Link>
      </div>
    </article>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-4 text-[15px] text-slate md:px-5">
      <span>
        {total} registro{total === 1 ? "" : "s"}
      </span>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" disabled={page <= 1} onClick={onPrev}>
          Anterior
        </button>
        <span className="px-2 py-2">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <button type="button" className="btn-secondary" disabled={page >= totalPages} onClick={onNext}>
          Siguiente
        </button>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Diagnosis[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [q, setQ] = useState("");
  const [farmId, setFarmId] = useState("");
  const [predictedClass, setPredictedClass] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    void listFarms()
      .then(setFarms)
      .catch((error) => notify(extractErrorMessage(error), "error"));
  }, [notify]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listDiagnoses({
          page,
          page_size: 8,
          q: q || undefined,
          farm_id: farmId ? Number(farmId) : undefined,
          predicted_class: predictedClass || undefined,
          date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
          date_to: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
        });
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudo cargar el historial."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, q, farmId, predictedClass, dateFrom, dateTo, notify]);

  return (
    <div>
      <PageHeader
        title="Historial de diagnósticos"
        subtitle="Consulta inspecciones, da seguimiento y compara si el cultivo mejora."
      />

      <div className="card-surface mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate" />
          <input
            className="input-field pl-9"
            placeholder="Buscar por clasificación u observaciones"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>
        <select
          className="input-field"
          value={farmId}
          onChange={(e) => {
            setPage(1);
            setFarmId(e.target.value);
          }}
        >
          <option value="">Todas las fincas</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
        <select
          className="input-field"
          value={predictedClass}
          onChange={(e) => {
            setPage(1);
            setPredictedClass(e.target.value);
          }}
        >
          <option value="">Todas las clases</option>
          {CLASS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 xl:col-span-1 md:col-span-2 xl:grid-cols-2">
          <input
            type="date"
            className="input-field"
            value={dateFrom}
            onChange={(e) => {
              setPage(1);
              setDateFrom(e.target.value);
            }}
          />
          <input
            type="date"
            className="input-field"
            value={dateTo}
            onChange={(e) => {
              setPage(1);
              setDateTo(e.target.value);
            }}
          />
        </div>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin resultados"
          description="No hay diagnósticos con los filtros actuales. Realiza un nuevo análisis para comenzar."
          action={
            <Link to="/diagnostico" className="btn-primary">
              Nuevo diagnóstico
            </Link>
          }
        />
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>

          {/* Desktop: table */}
          <div className="card-elevated hidden overflow-hidden !p-0 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-[15px]">
                <thead className="bg-fog text-[13px] text-ash">
                  <tr>
                    <th className="px-5 py-4 font-normal">Fotografía</th>
                    <th className="px-5 py-4 font-normal">Clasificación</th>
                    <th className="px-5 py-4 font-normal">Confianza</th>
                    <th className="px-5 py-4 font-normal">Finca</th>
                    <th className="px-5 py-4 font-normal">Parcela</th>
                    <th className="px-5 py-4 font-normal">Fecha</th>
                    <th className="px-5 py-4 font-normal">Estado</th>
                    <th className="px-5 py-4 font-normal">Seguimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border hover:bg-fog">
                      <td className="px-5 py-4">
                        <Link to={`/diagnostico/${item.id}`}>
                          <img
                            src={apiImageUrl(item.image_url, getApiBase())}
                            alt=""
                            className="h-12 w-12 rounded-image object-cover"
                          />
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/diagnostico/${item.id}`} className="text-ink hover:underline">
                          {item.predicted_class_label}
                        </Link>
                        {item.trend ? <p className="mt-1 text-[13px] text-slate">{item.trend.label}</p> : null}
                      </td>
                      <td className="px-5 py-4 text-slate">{formatPercent(item.confidence)}</td>
                      <td className="px-5 py-4 text-slate">{item.farm_name}</td>
                      <td className="px-5 py-4 text-slate">{item.plot_name}</td>
                      <td className="px-5 py-4 text-slate">{formatDateTime(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <StatusPill item={item} />
                        {(item.follow_up_count ?? 0) > 0 ? (
                          <p className="mt-1 text-[13px] text-slate">{item.follow_up_count} seguimiento(s)</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/diagnostico/${item.id}/seguimiento`}
                          className="inline-flex items-center gap-1 rounded-pill border border-ink px-3 py-1.5 text-[13px] text-ink transition hover:bg-mist"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Seguir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
