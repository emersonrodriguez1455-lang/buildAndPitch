import type { Diagnosis } from "../../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../../utils/format";
import { getApiBase } from "../../services/api";
import { ConfidenceBar } from "./ConfidenceBar";

export function ResultCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const imageSrc = apiImageUrl(diagnosis.image_url, getApiBase());

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="overflow-hidden rounded-elevated bg-paper shadow-artifact">
        <img src={imageSrc} alt="Fotografía analizada" className="h-72 w-full object-cover sm:h-96" />
      </div>

      <div className="card-elevated space-y-5 animate-fadeUp">
        <div>
          <p className="section-label">Clasificación principal</p>
          <h3 className="mt-1 font-display text-[32px] leading-tight tracking-tight text-ink">
            {diagnosis.predicted_class_label}
          </h3>
          <p className="mt-1 text-[15px] text-ash">{diagnosis.predicted_class}</p>
        </div>

        <ConfidenceBar confidence={diagnosis.confidence} />

        {diagnosis.alternatives && diagnosis.alternatives.length > 0 ? (
          <div>
            <p className="mb-2 text-[15px] font-medium text-ink">Top alternativas</p>
            <div className="space-y-2">
              {diagnosis.alternatives.map((alt) => (
                <div
                  key={alt.class_name}
                  className="flex items-center justify-between rounded-input bg-mist px-3 py-2 text-[15px]"
                >
                  <span className="text-ink">{alt.label}</span>
                  <span className="text-slate">{formatPercent(alt.confidence)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-card bg-mist px-4 py-3 text-[15px] text-ink">
          <p className="text-[14px] text-ash">Aviso importante</p>
          <p className="mt-1 text-slate">
            Este resultado es una estimación generada por inteligencia artificial. No constituye un diagnóstico
            agronómico definitivo. Se recomienda verificar los síntomas con un técnico agrícola.
          </p>
        </div>

        <div className="rounded-card bg-mist px-4 py-3 text-[15px] text-ink">
          <p className="font-medium">Orientación general</p>
          <p className="mt-1 text-slate">{diagnosis.recommendation}</p>
        </div>

        <div className="grid gap-2 text-[14px] text-slate sm:grid-cols-2">
          <p>
            <span className="text-ink">Finca:</span> {diagnosis.farm_name}
          </p>
          <p>
            <span className="text-ink">Parcela:</span> {diagnosis.plot_name}
          </p>
          <p>
            <span className="text-ink">Fecha:</span> {formatDateTime(diagnosis.created_at)}
          </p>
          <p>
            <span className="text-ink">ID:</span> #{diagnosis.id}
          </p>
        </div>
      </div>
    </div>
  );
}
