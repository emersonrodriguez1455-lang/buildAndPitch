import { confidenceTone, formatPercent } from "../../utils/format";

export function ConfidenceBar({ confidence }: { confidence: number }) {
  const width = Math.max(4, Math.min(100, confidence * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-mist">Confianza del modelo</span>
        <span className={`font-semibold ${confidenceTone(confidence)}`}>{formatPercent(confidence)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-mint">
        <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-xs text-mist">
        Puntuación softmax del clasificador. No representa una probabilidad clínica verificada.
      </p>
    </div>
  );
}
