import { Link } from "react-router-dom";
import type { DiagnosisTimelineResponse } from "../../types";
import { apiImageUrl, formatDateTime, formatPercent } from "../../utils/format";
import { getApiBase } from "../../services/api";

export function FollowUpTimeline({ timeline }: { timeline: DiagnosisTimelineResponse }) {
  return (
    <section className="card-surface p-5 animate-fadeUp">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Línea de seguimiento</h3>
          <p className="text-sm text-mist">Compara escaneos del mismo caso a lo largo del tiempo.</p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            timeline.overall_trend.direction === "up"
              ? "bg-mint text-leaf"
              : timeline.overall_trend.direction === "down"
                ? "bg-alert/10 text-alert"
                : "bg-canvas text-mist"
          }`}
        >
          Tendencia: {timeline.overall_trend.label}
        </div>
      </div>

      <div className="space-y-3">
        {timeline.items.map((item, index) => (
          <Link
            key={item.id}
            to={`/diagnostico/${item.id}`}
            className={`flex gap-3 rounded-2xl border p-3 transition hover:border-leaf/40 hover:bg-mint/20 ${
              item.is_current ? "border-leaf bg-mint/30" : "border-mint bg-white"
            }`}
          >
            <img
              src={apiImageUrl(item.image_url, getApiBase())}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">
                  Escaneo {index + 1}: {item.predicted_class_label}
                </p>
                {item.is_current ? (
                  <span className="rounded-full bg-leaf px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Actual
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-mist">
                {formatDateTime(item.created_at)} · Confianza {formatPercent(item.confidence)}
              </p>
              {item.trend ? <p className="mt-1 text-xs text-mist">{item.trend.label}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
