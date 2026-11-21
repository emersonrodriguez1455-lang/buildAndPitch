import type { CSSProperties } from "react";

type BoneProps = {
  className?: string;
  style?: CSSProperties;
};

/** Soft Steep pulse block — building unit for layout skeletons. */
export function Bone({ className = "", style }: BoneProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulseSoft rounded-input bg-mist ${className}`}
      style={style}
    />
  );
}

function SkeletonCaption({ label }: { label: string }) {
  return (
    <p className="mb-5 flex items-center gap-2 text-[14px] text-slate">
      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-ink" />
      {label}
    </p>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-shell space-y-16 pb-16" aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Preparando el panel…" />
      <header className="space-y-4">
        <Bone className="h-3 w-28" />
        <Bone className="h-12 w-full max-w-xl rounded-card" />
        <Bone className="h-4 w-80 max-w-full" />
        <div className="flex gap-2 pt-2">
          <Bone className="h-11 w-32 rounded-pill" />
          <Bone className="h-11 w-40 rounded-pill" />
        </div>
      </header>

      <section className="space-y-5">
        <Bone className="h-3 w-16" />
        <Bone className="h-9 w-56" />
        <Bone className="h-44 w-full rounded-elevated" />
      </section>

      <section className="space-y-5">
        <Bone className="h-3 w-20" />
        <Bone className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-28 w-full rounded-elevated" />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Bone className="h-64 w-full rounded-elevated" />
        <Bone className="h-64 w-full rounded-elevated" />
      </section>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Cargando historial…" />
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-elevated flex gap-3 !p-4">
            <Bone className="h-16 w-16 shrink-0 rounded-image" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-3/4 max-w-[12rem]" />
              <Bone className="h-3 w-24" />
              <Bone className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
      {/* Desktop table rows */}
      <div className="card-elevated hidden overflow-hidden !p-0 md:block">
        <div className="space-y-0">
          <div className="flex gap-4 bg-fog px-5 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-3 flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-t border-border px-5 py-4">
              <Bone className="h-12 w-12 shrink-0 rounded-image" />
              <Bone className="h-4 flex-1" />
              <Bone className="h-4 w-16" />
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-28" />
              <Bone className="h-7 w-20 rounded-pill" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FarmsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Cargando fincas y parcelas…" />
      <div className="grid gap-5 xl:grid-cols-2">
        {[0, 1].map((col) => (
          <section key={col} className="card-surface space-y-4">
            <Bone className="h-7 w-32" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Bone key={i} className="h-24 w-full rounded-elevated" />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function StatisticsSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Calculando estadísticas…" />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-28 w-full rounded-elevated" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Bone className="h-72 w-full rounded-elevated" />
        <Bone className="h-72 w-full rounded-elevated" />
      </div>
    </div>
  );
}

export function DiagnosisDetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Cargando detalle…" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Bone className="h-72 w-full rounded-elevated sm:h-96" />
        <div className="card-elevated space-y-4">
          <Bone className="h-3 w-36" />
          <Bone className="h-10 w-4/5 max-w-sm" />
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-full" />
          <Bone className="h-20 w-full rounded-card" />
          <Bone className="h-20 w-full rounded-card" />
        </div>
      </div>
      <Bone className="h-48 w-full rounded-elevated" />
    </div>
  );
}

export function FollowUpSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <SkeletonCaption label="Preparando seguimiento…" />
      <Bone className="h-40 w-full rounded-elevated" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Bone className="h-64 w-full rounded-elevated" />
        <Bone className="h-64 w-full rounded-elevated" />
      </div>
    </div>
  );
}

/** Compact result-reveal placeholders while timed stages advance. */
export function ResultRevealSkeleton({ stage }: { stage: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2" aria-busy="true">
      <Bone className="h-72 w-full rounded-elevated sm:h-96" />
      <div className="card-elevated space-y-4">
        {stage < 1 ? (
          <>
            <Bone className="h-3 w-40" />
            <Bone className="h-10 w-3/4" />
          </>
        ) : null}
        {stage < 2 ? <Bone className="h-4 w-full" /> : null}
        {stage < 3 ? (
          <>
            <Bone className="h-16 w-full rounded-card" />
            <Bone className="h-16 w-full rounded-card" />
          </>
        ) : null}
      </div>
    </div>
  );
}
