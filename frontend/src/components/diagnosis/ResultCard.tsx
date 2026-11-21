import { AlertTriangle, CheckCircle2, Leaf } from "lucide-react";
import type { Diagnosis } from "../../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../../utils/format";
import { getApiBase } from "../../services/api";
import { ConfidenceBar } from "./ConfidenceBar";

export function ResultCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const imageSrc = apiImageUrl(diagnosis.image_url, getApiBase());

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card-surface overflow-hidden">
        <img src={imageSrc} alt="Fotografía analizada" className="h-72 w-full object-cover sm:h-96" />
      </div>

      <div className="card-surface space-y-4 p-5 animate-fadeUp">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2 ${diagnosis.is_healthy ? "bg-mint text-leaf" : "bg-warn/15 text-warn"}`}>
            {diagnosis.is_healthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-mist">Clasificación principal</p>
            <h3 className="text-xl font-bold text-ink">{diagnosis.predicted_class_label}</h3>
            <p className="text-sm text-mist">{diagnosis.predicted_class}</p>
          </div>
        </div>

        <ConfidenceBar confidence={diagnosis.confidence} />

        {diagnosis.alternatives && diagnosis.alternatives.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Top alternativas</p>
            <div className="space-y-2">
              {diagnosis.alternatives.map((alt) => (
                <div key={alt.class_name} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-sm">
                  <span className="text-ink">{alt.label}</span>
                  <span className="font-medium text-mist">{formatPercent(alt.confidence)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-warn/30 bg-warn/10 p-3 text-sm text-ink">
          <div className="mb-1 flex items-center gap-2 font-semibold text-warn">
            <AlertTriangle className="h-4 w-4" />
            Aviso importante
          </div>
          Este resultado es una estimación generada por inteligencia artificial. No constituye un diagnóstico
          agronómico definitivo. Se recomienda verificar los síntomas con un técnico agrícola.
        </div>

        <div className="rounded-xl bg-mint/50 p-3 text-sm text-ink">
          <div className="mb-1 flex items-center gap-2 font-semibold text-forest">
            <Leaf className="h-4 w-4" />
            Orientación general de inspección
          </div>
          {diagnosis.recommendation}
        </div>

        <div className="grid gap-2 text-sm text-mist sm:grid-cols-2">
          <p>
            <span className="font-medium text-ink">Finca:</span> {diagnosis.farm_name}
          </p>
          <p>
            <span className="font-medium text-ink">Parcela:</span> {diagnosis.plot_name}
          </p>
          <p>
            <span className="font-medium text-ink">Fecha:</span> {formatDateTime(diagnosis.created_at)}
          </p>
          <p>
            <span className="font-medium text-ink">ID:</span> #{diagnosis.id}
          </p>
        </div>
      </div>
    </div>
  );
}
