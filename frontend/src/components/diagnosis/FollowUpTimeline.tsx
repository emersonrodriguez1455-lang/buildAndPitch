import { Link } from "react-router-dom";
import type { DiagnosisTimelineResponse } from "../../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../../utils/format";
import { getApiBase } from "../../services/api";

export function FollowUpTimeline({ timeline }: { timeline: DiagnosisTimelineResponse }) {
  return (
    <section className="card-surface animate-fadeUp">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Línea de seguimiento</p>
          <h3 className="mt-1 font-display text-[26px] tracking-tight text-ink">Evolución del caso</h3>
        </div>
        <div className="rounded-pill bg-paper px-3 py-1 text-[13px] text-slate">
          Tendencia: {timeline.overall_trend.label}
        </div>
      </div>

      <div className="space-y-3">
        {timeline.items.map((item, index) => (
          <Link
            key={item.id}
            to={`/diagnostico/${item.id}`}
            className={`flex gap-3 rounded-elevated p-3 transition ${
              item.is_current ? "bg-paper shadow-artifact" : "bg-paper/60 hover:bg-paper"
            }`}
          >
            <img
              src={apiImageUrl(item.image_url, getApiBase())}
              alt=""
              className="h-16 w-16 rounded-image object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink">
                  Escaneo {index + 1}: {item.predicted_class_label}
                </p>
                {item.is_current ? (
                  <span className="rounded-pill bg-ink px-2 py-0.5 text-[11px] text-paper">Actual</span>
                ) : null}
              </div>
              <p className="mt-1 text-[14px] text-slate">
                {formatDateTime(item.created_at)} · Confianza {formatPercent(item.confidence)}
              </p>
              {item.trend ? <p className="mt-1 text-[13px] text-ash">{item.trend.label}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
