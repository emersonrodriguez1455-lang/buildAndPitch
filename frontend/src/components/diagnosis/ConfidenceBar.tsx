import { formatPercent } from "../../utils/format";

export function ConfidenceBar({ confidence }: { confidence: number }) {
  const width = Math.max(4, Math.min(100, confidence * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[15px]">
        <span className="text-slate">Confianza del modelo</span>
        <span className="font-medium text-ink">{formatPercent(confidence)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-pill bg-mist">
        <div className="h-full rounded-pill bg-sienna transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-[14px] text-ash">
        Puntuación softmax del clasificador. No representa una probabilidad clínica verificada.
      </p>
    </div>
  );
}
