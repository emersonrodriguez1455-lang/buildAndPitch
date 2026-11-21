import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingBlock } from "../components/common/LoadingBlock";
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

      <div className="card-surface mb-5 grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-mist" />
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
        <LoadingBlock label="Cargando historial..." />
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
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-canvas text-xs uppercase text-mist">
                <tr>
                  <th className="px-4 py-3">Fotografía</th>
                  <th className="px-4 py-3">Clasificación</th>
                  <th className="px-4 py-3">Confianza</th>
                  <th className="px-4 py-3">Finca</th>
                  <th className="px-4 py-3">Parcela</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Seguimiento</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-mint/70 hover:bg-mint/20">
                    <td className="px-4 py-3">
                      <Link to={`/diagnostico/${item.id}`}>
                        <img
                          src={apiImageUrl(item.image_url, getApiBase())}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/diagnostico/${item.id}`} className="font-medium text-ink hover:text-leaf">
                        {item.predicted_class_label}
                      </Link>
                      {item.trend ? <p className="mt-1 text-xs text-mist">{item.trend.label}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-mist">{formatPercent(item.confidence)}</td>
                    <td className="px-4 py-3 text-mist">{item.farm_name}</td>
                    <td className="px-4 py-3 text-mist">{item.plot_name}</td>
                    <td className="px-4 py-3 text-mist">{formatDateTime(item.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.is_healthy ? "bg-mint text-leaf" : "bg-warn/15 text-warn"
                        }`}
                      >
                        {item.is_healthy ? "Aparentemente sana" : "Posible problema"}
                      </span>
                      {(item.follow_up_count ?? 0) > 0 ? (
                        <p className="mt-1 text-xs text-mist">{item.follow_up_count} seguimiento(s)</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/diagnostico/${item.id}/seguimiento`}
                        className="inline-flex items-center gap-1 rounded-lg bg-mint px-2.5 py-1.5 text-xs font-semibold text-forest hover:bg-leaf hover:text-white"
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
          <div className="flex items-center justify-between border-t border-mint px-4 py-3 text-sm text-mist">
            <span>
              {total} registro{total === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="px-2 py-2">
                {page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
