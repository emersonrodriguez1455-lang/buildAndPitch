const STORAGE_KEY = "agroalerta_last_diagnosis_id";

export function rememberLastDiagnosisId(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(id));
    window.dispatchEvent(new CustomEvent("agroalerta:last-plan-updated", { detail: { id } }));
  } catch {
    // ignore storage errors in private mode
  }
}

export function readLastDiagnosisId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}
