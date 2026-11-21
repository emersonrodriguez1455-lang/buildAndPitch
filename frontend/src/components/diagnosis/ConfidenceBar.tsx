import { formatPercent } from "../../utils/format";

export function ConfidenceBar({ confidence }: { confidence: number }) {
  const width = Math.max(4, Math.min(100, confidence * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[15px]">
        <span className="text-slate">Confianza del modelo</span>
        <span className="font-medium text-ink">{formatPercent(confidence)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-pill" style={{ backgroundColor: "#f2f2f3" }}>
        <div
          className="h-full rounded-pill transition-all duration-500"
          style={{ width: `${width}%`, backgroundColor: "#5d2a1a" }}
        />
      </div>
      <p className="mt-2 text-[14px] text-[#777b86]">
        Puntuación softmax del clasificador. No representa una probabilidad clínica verificada.
      </p>
    </div>
  );
}
