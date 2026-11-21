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
                  className="surface-quiet flex items-center justify-between px-3 py-2.5 text-[15px]"
                >
                  <span className="text-[#17191c]">{alt.label}</span>
                  <span className="text-[#555861]">{formatPercent(alt.confidence)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="surface-callout px-4 py-3 text-[15px]">
          <p className="callout-title text-[14px]">Aviso importante</p>
          <p className="callout-body mt-1">
            Este resultado es una estimación generada por inteligencia artificial. No constituye un diagnóstico
            agronómico definitivo. Se recomienda verificar los síntomas con un técnico agrícola.
          </p>
        </div>

        <div className="surface-callout px-4 py-3 text-[15px]">
          <p className="callout-title">Orientación general</p>
          <p className="callout-body mt-1">{diagnosis.recommendation}</p>
        </div>

        <div className="grid gap-2 text-[14px] text-[#555861] sm:grid-cols-2">
          <p>
            <span className="text-[#17191c]">Finca:</span> {diagnosis.farm_name}
          </p>
          <p>
            <span className="text-[#17191c]">Parcela:</span> {diagnosis.plot_name}
          </p>
          <p>
            <span className="text-[#17191c]">Fecha:</span> {formatDateTime(diagnosis.created_at)}
          </p>
          <p>
            <span className="text-[#17191c]">ID:</span> #{diagnosis.id}
          </p>
        </div>
      </div>
    </div>
  );
}
