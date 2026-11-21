import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { LoadingBlock } from "../components/common/LoadingBlock";
import { PageHeader } from "../components/common/PageHeader";
import { ResultCard } from "../components/diagnosis/ResultCard";
import { Modal } from "../components/common/Modal";
import { useToast } from "../contexts/ToastContext";
import { deleteDiagnosis, extractErrorMessage, getDiagnosis } from "../services/api";
import type { Diagnosis } from "../types";

export function DiagnosisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getDiagnosis(Number(id));
        setDiagnosis(data);
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
        title={`Diagnóstico #${diagnosis.id}`}
        subtitle="Detalle completo de la inspección y orientación general."
        actions={
          <div className="flex flex-wrap gap-2">
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

      <ResultCard diagnosis={diagnosis} />

      {diagnosis.observations ? (
        <section className="card-surface mt-5 p-5">
          <h3 className="text-sm font-semibold text-ink">Observaciones registradas</h3>
          <p className="mt-2 text-sm text-mist">{diagnosis.observations}</p>
        </section>
      ) : null}

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
