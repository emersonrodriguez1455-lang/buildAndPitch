import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { CarePlanPanel } from "../components/diagnosis/CarePlanPanel";
import { ImageSourcePicker } from "../components/common/ImageSourcePicker";
import { FollowUpSkeleton } from "../components/common/Skeleton";
import { PageHeader } from "../components/common/PageHeader";
import { ResultCard, type ResultRevealStage } from "../components/diagnosis/ResultCard";
import { useToast } from "../contexts/ToastContext";
import { useProgressiveReveal } from "../hooks/useProgressiveReveal";
import {
  createFollowUp,
  extractErrorMessage,
  getDiagnosis,
} from "../services/api";
import type { Diagnosis } from "../types";
import { rememberLastDiagnosisId } from "../utils/lastPlan";

const RESULT_REVEAL_DELAYS = [350, 900, 1600, 2300];
const PLAN_REVEAL_DELAYS = [2800, 3600, 4400];

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 10;

export function FollowUpPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<Diagnosis | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [observations, setObservations] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const resultStage = useProgressiveReveal(Boolean(result), RESULT_REVEAL_DELAYS, result?.id);
  const planStage = useProgressiveReveal(Boolean(result), PLAN_REVEAL_DELAYS, result?.id);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getDiagnosis(Number(id));
        setParent(data);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudo cargar el caso."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, notify]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const canSubmit = useMemo(() => Boolean(file && parent && !analyzing), [file, parent, analyzing]);

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
  };

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const onAnalyze = async () => {
    if (!file || !parent || analyzing) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (observations.trim()) formData.append("observations", observations.trim());
      const diagnosis = await createFollowUp(parent.id, formData);
      setResult(diagnosis);
      rememberLastDiagnosisId(diagnosis.id);
      notify("Seguimiento registrado. El nuevo plan quedó a la mano en el panel superior.", "success");
    } catch (error) {
      notify(extractErrorMessage(error, "No se pudo registrar el seguimiento."), "error");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <FollowUpSkeleton />;
  if (!parent) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-ink">No se encontró el diagnóstico base.</p>
        <Link to="/historial" className="btn-secondary mt-4 inline-flex">
          Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Registrar seguimiento"
        subtitle={`Compara una nueva foto con el caso #${parent.id} · ${parent.farm_name} / ${parent.plot_name}`}
        actions={
          <button type="button" className="btn-secondary" onClick={() => navigate(`/diagnostico/${parent.id}`)}>
            <ArrowLeft className="h-4 w-4" />
            Volver al caso
          </button>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="card-elevated">
          <p className="section-label">Escaneo anterior</p>
          <p className="mt-2 font-display text-[28px] tracking-tight text-ink">{parent.predicted_class_label}</p>
          <p className="mt-1 text-[15px] text-slate">
            Confianza {(parent.confidence * 100).toFixed(1)}% · {parent.is_healthy ? "Aparentemente sana" : "Posible problema"}
          </p>
          {parent.care_plan ? (
            <p className="mt-3 text-[15px] text-slate">
              Sugerencia previa: revisar en {parent.care_plan.next_check_days} días.
            </p>
          ) : null}
        </div>
        <div className="card-surface text-[15px] text-slate">
          Toma la foto de la <strong className="text-ink">misma planta o sector</strong>, con buena luz y la hoja
          ocupando la mayor parte del encuadre. Así el seguimiento es comparable.
        </div>
      </div>

      {!result ? (
        <section className="card-surface">
          <div className="rounded-card border-2 border-dashed border-border bg-paper/70 px-4 py-8 text-center">
            {preview ? (
              <div className="mx-auto max-w-md">
                <img src={preview} alt="Vista previa" className="mb-4 max-h-72 w-full rounded-image object-cover" />
                <ImageSourcePicker onPick={assignFile} disabled={analyzing} variant="replace" />
                <div className="mt-2 flex justify-center">
                  <button type="button" className="btn-secondary" onClick={clearImage} disabled={analyzing}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <p className="text-[18px] text-ink">Nueva fotografía de seguimiento</p>
                <ImageSourcePicker onPick={assignFile} disabled={analyzing} />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="label-field" htmlFor="follow-obs">
              ¿Qué observas en campo? (opcional)
            </label>
            <textarea
              id="follow-obs"
              className="input-field min-h-24"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={analyzing}
              placeholder="Ej. menos manchas anaranjadas que la semana pasada"
            />
          </div>

          <button type="button" className="btn-primary mt-4" disabled={!canSubmit} onClick={onAnalyze}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {analyzing ? "Comparando con IA..." : "Analizar seguimiento"}
          </button>
        </section>
      ) : (
        <div className="space-y-5">
          <ResultCard
            diagnosis={result}
            revealStage={Math.min(4, resultStage) as ResultRevealStage}
          />
          <CarePlanPanel
            carePlan={result.care_plan}
            trend={result.trend}
            revealStage={Math.min(3, planStage) as 0 | 1 | 2 | 3}
          />
          {planStage >= 3 ? (
            <div className="flex flex-wrap gap-2 animate-fadeUp">
              <Link to={`/diagnostico/${result.id}`} className="btn-primary">
                Ver caso actualizado
              </Link>
              <Link to="/historial" className="btn-secondary">
                Ir al historial
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
