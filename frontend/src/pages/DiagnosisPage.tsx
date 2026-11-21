import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ImagePlus, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { CarePlanPanel } from "../components/diagnosis/CarePlanPanel";
import { ResultCard } from "../components/diagnosis/ResultCard";
import { useToast } from "../contexts/ToastContext";
import {
  createDiagnosis,
  extractErrorMessage,
  listFarms,
  listPlots,
} from "../services/api";
import type { Diagnosis, Farm, Plot } from "../types";

const STEPS = [
  "Imagen cargada",
  "Validando fotografía",
  "Procesando imagen",
  "Ejecutando inteligencia artificial",
  "Generando resultado",
  "Diagnóstico completado",
];

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

export function DiagnosisPage() {
  const { notify } = useToast();
  const outlet = useOutletContext<{ modelReady: boolean | null; modelLoading: boolean }>();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [farmId, setFarmId] = useState("");
  const [plotId, setPlotId] = useState("");
  const [observations, setObservations] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState<Diagnosis | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const farmData = await listFarms();
        setFarms(farmData);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudieron cargar las fincas."), "error");
      }
    };
    void load();
  }, [notify]);

  useEffect(() => {
    const loadPlots = async () => {
      if (!farmId) {
        setPlots([]);
        setPlotId("");
        return;
      }
      try {
        const plotData = await listPlots(Number(farmId));
        setPlots(plotData);
        setPlotId("");
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudieron cargar las parcelas."), "error");
      }
    };
    void loadPlots();
  }, [farmId, notify]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const canSubmit = useMemo(
    () => Boolean(file && farmId && plotId && !analyzing),
    [file, farmId, plotId, analyzing],
  );

  const assignFile = (next: File | null) => {
    if (!next) return;
    if (!ACCEPTED.includes(next.type) && !/\.(jpe?g|png|webp)$/i.test(next.name)) {
      notify("Formato no permitido. Use JPG, JPEG, PNG o WEBP.", "error");
      return;
    }
    if (next.size > MAX_MB * 1024 * 1024) {
      notify(`La imagen supera el máximo de ${MAX_MB} MB.`, "error");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult(null);
    setStepIndex(0);
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setStepIndex(-1);
  };

  const onAnalyze = async () => {
    if (!file || !farmId || !plotId || analyzing) return;
    if (outlet?.modelReady === false) {
      notify("El modelo de IA no está disponible. Espere a que cargue o revise el backend.", "error");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setStepIndex(1);

    const timers = [
      window.setTimeout(() => setStepIndex(2), 400),
      window.setTimeout(() => setStepIndex(3), 900),
      window.setTimeout(() => setStepIndex(4), 1600),
    ];

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("farm_id", farmId);
      formData.append("plot_id", plotId);
      if (observations.trim()) formData.append("observations", observations.trim());

      const diagnosis = await createDiagnosis(formData);
      setStepIndex(5);
      setResult(diagnosis);
      notify("Diagnóstico completado y guardado.", "success");
    } catch (error) {
      setStepIndex(file ? 0 : -1);
      notify(extractErrorMessage(error, "No se pudo completar el análisis."), "error");
    } finally {
      timers.forEach((id) => window.clearTimeout(id));
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nuevo diagnóstico"
        subtitle="Carga una fotografía de hoja de café para clasificación experimental con ConvNeXt."
      />

      {outlet?.modelReady === false ? (
        <div className="mb-5 rounded-2xl border border-alert/30 bg-alert/10 px-4 py-3 text-sm text-ink">
          El motor de inteligencia artificial no está disponible en este momento.
          {outlet.modelLoading ? " El modelo aún se está cargando." : " Verifique la conexión o reinicie el backend."}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="card-surface p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) assignFile(dropped);
            }}
            className={`rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
              dragging ? "border-leaf bg-mint/40" : "border-mint bg-canvas/60"
            }`}
          >
            {preview ? (
              <div className="mx-auto max-w-md">
                <img src={preview} alt="Vista previa" className="mb-4 max-h-72 w-full rounded-xl object-cover" />
                <div className="flex flex-wrap justify-center gap-2">
                  <label className="btn-secondary cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Reemplazar
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => assignFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <button type="button" className="btn-secondary" onClick={clearImage} disabled={analyzing}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-leaf">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <p className="font-semibold text-ink">Arrastra una fotografía aquí</p>
                <p className="mt-1 text-sm text-mist">JPG, JPEG, PNG o WEBP · máximo {MAX_MB} MB</p>
                <label className="btn-primary mt-4 cursor-pointer">
                  Seleccionar imagen
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => assignFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="farm">
                Finca
              </label>
              <select
                id="farm"
                className="input-field"
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                disabled={analyzing}
              >
                <option value="">Seleccione una finca</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field" htmlFor="plot">
                Parcela
              </label>
              <select
                id="plot"
                className="input-field"
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                disabled={!farmId || analyzing}
              >
                <option value="">Seleccione una parcela</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id}>
                    {plot.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="label-field" htmlFor="observations">
              Observaciones (opcional)
            </label>
            <textarea
              id="observations"
              className="input-field min-h-24"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={analyzing}
              placeholder="Ej. hoja del tercio medio, lado norte de la parcela"
            />
          </div>

          <button type="button" className="btn-primary mt-5 w-full sm:w-auto" disabled={!canSubmit} onClick={onAnalyze}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {analyzing ? "Analizando..." : "Iniciar análisis"}
          </button>
        </section>

        <section className="card-surface p-5">
          <h3 className="text-base font-semibold text-ink">Estado del proceso</h3>
          <ol className="mt-4 space-y-3">
            {STEPS.map((step, index) => {
              const active = index <= stepIndex;
              const current = index === stepIndex && analyzing;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                    active ? "bg-mint/60 text-forest" : "bg-canvas text-mist"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      active ? "bg-leaf text-white" : "bg-white text-mist"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={current ? "animate-pulseSoft font-semibold" : ""}>{step}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-5 text-xs leading-relaxed text-mist">
            El modelo clasifica la imagen completa; no localiza lesiones con cajas. La primera ejecución puede
            tardar mientras se descargan los pesos.
          </p>
        </section>
      </div>

      {result ? (
        <section className="mt-6 space-y-5">
          <h3 className="text-lg font-semibold text-ink">Resultado del diagnóstico</h3>
          <ResultCard diagnosis={result} />
          <CarePlanPanel carePlan={result.care_plan} trend={result.trend} />
          <div className="flex flex-wrap gap-2">
            <Link to={`/diagnostico/${result.id}`} className="btn-secondary">
              Ver detalle del caso
            </Link>
            <Link to={`/diagnostico/${result.id}/seguimiento`} className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Programar seguimiento
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
