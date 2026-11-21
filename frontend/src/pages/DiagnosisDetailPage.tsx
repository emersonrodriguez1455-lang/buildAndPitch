import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import { CarePlanPanel } from "../components/diagnosis/CarePlanPanel";
import { FollowUpTimeline } from "../components/diagnosis/FollowUpTimeline";
import { LoadingBlock } from "../components/common/LoadingBlock";
import { PageHeader } from "../components/common/PageHeader";
import { ResultCard } from "../components/diagnosis/ResultCard";
import { Modal } from "../components/common/Modal";
import { useToast } from "../contexts/ToastContext";
import {
  deleteDiagnosis,
  extractErrorMessage,
  getDiagnosis,
  getDiagnosisTimeline,
} from "../services/api";
import type { Diagnosis, DiagnosisTimelineResponse } from "../types";

export function DiagnosisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [timeline, setTimeline] = useState<DiagnosisTimelineResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [data, timelineData] = await Promise.all([
          getDiagnosis(Number(id)),
          getDiagnosisTimeline(Number(id)),
        ]);
        setDiagnosis(data);
        setTimeline(timelineData);
      } catch (error) {
        notify(extractErrorMessage(error, "No se pudo cargar el diagnóstico."), "error");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, notify]);

  const onDelete = async () => {
    if (!diagnosis) return;
    try {
      setDeleting(true);
      await deleteDiagnosis(diagnosis.id);
      notify("Diagnóstico eliminado.", "success");
      navigate("/historial");
    } catch (error) {
      notify(extractErrorMessage(error, "No se pudo eliminar."), "error");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <LoadingBlock label="Cargando detalle..." />;
  if (!diagnosis) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-ink">Diagnóstico no encontrado.</p>
        <Link to="/historial" className="btn-secondary mt-4 inline-flex">
          Volver al historial
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Caso #${diagnosis.id}`}
        subtitle="Resultado, plan de acción y evolución del seguimiento."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Dar seguimiento
            </Link>
            <Link to="/historial" className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Historial
            </Link>
            <button type="button" className="btn-secondary text-alert" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        }
      />

      <div className="mb-5 rounded-2xl border border-leaf/20 bg-mint/40 px-4 py-3 text-sm text-ink">
        {diagnosis.is_healthy ? (
          <>
            <strong>Estado:</strong> aparentemente sano. Usa el plan de prevención y agenda una revisión en{" "}
            {diagnosis.care_plan?.next_check_days ?? 14} días.
          </>
        ) : (
          <>
            <strong>Estado:</strong> posible problema ({diagnosis.predicted_class_label}). Verifica en campo,
            sigue los pasos de manejo y registra un nuevo escaneo para ver si mejora.
          </>
        )}
        {(diagnosis.follow_up_count ?? 0) > 0 ? (
          <span className="ml-1 text-mist">· {diagnosis.follow_up_count} seguimiento(s) registrados</span>
        ) : null}
      </div>

      <ResultCard diagnosis={diagnosis} />

      <div className="mt-5">
        <CarePlanPanel carePlan={diagnosis.care_plan} trend={diagnosis.trend} />
      </div>

      {timeline ? (
        <div className="mt-5">
          <FollowUpTimeline timeline={timeline} />
        </div>
      ) : null}

      {diagnosis.observations ? (
        <section className="card-surface mt-5 p-5">
          <h3 className="text-sm font-semibold text-ink">Observaciones registradas</h3>
          <p className="mt-2 text-sm text-mist">{diagnosis.observations}</p>
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to={`/diagnostico/${diagnosis.id}/seguimiento`} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          Nueva foto de seguimiento
        </Link>
      </div>

      <Modal
        open={confirmOpen}
        title="Eliminar diagnóstico"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary bg-alert hover:bg-alert/90" onClick={onDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Confirmar eliminación"}
            </button>
          </>
        }
      >
        <p className="text-sm text-mist">
          Se eliminará el registro y la fotografía asociada. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  );
}
