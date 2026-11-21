import { useEffect, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Advances stage from 0 → delays.length with timed delays after `active` is true.
 * Resets when `active` is false or `resetKey` changes.
 */
export function useProgressiveReveal(
  active: boolean,
  delaysMs: readonly number[],
  resetKey?: string | number | null,
) {
  const maxStage = delaysMs.length;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }

    if (prefersReducedMotion()) {
      setStage(maxStage);
      return;
    }

    setStage(0);
    const timers = delaysMs.map((ms, index) =>
      window.setTimeout(() => setStage(index + 1), ms),
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, resetKey, maxStage, delaysMs]);

  return stage;
}
