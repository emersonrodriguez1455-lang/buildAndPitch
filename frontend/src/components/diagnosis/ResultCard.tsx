import type { Diagnosis } from "../../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../../utils/format";
import { getApiBase } from "../../services/api";
import { ConfidenceBar } from "./ConfidenceBar";

/** 0 = nada · 1 = imagen+clase · 2 = confianza · 3 = alts+avisos · 4 = meta completa */
export type ResultRevealStage = 0 | 1 | 2 | 3 | 4;

export function ResultCard({
  diagnosis,
  revealStage = 4,
}: {
  diagnosis: Diagnosis;
  revealStage?: ResultRevealStage;
}) {
  const imageSrc = apiImageUrl(diagnosis.image_url, getApiBase());
  const showClass = revealStage >= 1;
  const showConfidence = revealStage >= 2;
  const showDetails = revealStage >= 3;
  const showMeta = revealStage >= 4;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="overflow-hidden rounded-elevated bg-paper shadow-artifact animate-fadeUp">
        <img src={imageSrc} alt="Fotografía analizada" className="h-72 w-full object-cover sm:h-96" />
      </div>

      <div className="card-elevated space-y-5">
        {showClass ? (
          <div className="animate-fadeUp">
            <p className="section-label">Clasificación principal</p>
            <h3 className="mt-1 font-display text-[32px] leading-tight tracking-tight text-ink">
              {diagnosis.predicted_class_label}
            </h3>
            <p className="mt-1 text-[15px] text-ash">{diagnosis.predicted_class}</p>
          </div>
        ) : (
          <div className="space-y-2" aria-hidden>
            <div className="h-3 w-36 animate-pulseSoft rounded-input bg-mist" />
            <div className="h-9 w-3/4 max-w-xs animate-pulseSoft rounded-input bg-mist" />
          </div>
        )}

        {showConfidence ? (
          <div className="animate-fadeUp">
            <ConfidenceBar confidence={diagnosis.confidence} />
          </div>
        ) : showClass ? (
          <div className="h-4 w-full animate-pulseSoft rounded-input bg-mist" aria-hidden />
        ) : null}

        {showDetails && diagnosis.alternatives && diagnosis.alternatives.length > 0 ? (
          <div className="animate-fadeUp">
            <p className="mb-2 text-[15px] font-medium text-ink">Top alternativas</p>
            <div className="space-y-2">
              {diagnosis.alternatives.map((alt, index) => (
                <div
                  key={alt.class_name}
                  className="surface-quiet flex items-center justify-between px-3 py-2.5 text-[15px] animate-fadeUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className="text-[#17191c]">{alt.label}</span>
                  <span className="text-[#555861]">{formatPercent(alt.confidence)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showDetails ? (
          <>
            <div className="surface-callout px-4 py-3 text-[15px] animate-fadeUp">
              <p className="callout-title text-[14px]">Aviso importante</p>
              <p className="callout-body mt-1">
                Este resultado es una estimación generada por inteligencia artificial. No constituye un diagnóstico
                agronómico definitivo. Se recomienda verificar los síntomas con un técnico agrícola.
              </p>
            </div>

            <div className="surface-callout px-4 py-3 text-[15px] animate-fadeUp">
              <p className="callout-title">Orientación general</p>
              <p className="callout-body mt-1">{diagnosis.recommendation}</p>
            </div>
          </>
        ) : showConfidence ? (
          <div className="space-y-3" aria-hidden>
            <div className="h-20 w-full animate-pulseSoft rounded-card bg-mist" />
            <div className="h-20 w-full animate-pulseSoft rounded-card bg-mist" />
          </div>
        ) : null}

        {showMeta ? (
          <div className="grid gap-2 text-[14px] text-[#555861] sm:grid-cols-2 animate-fadeUp">
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
        ) : null}
      </div>
    </div>
  );
}
