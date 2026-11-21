const STORAGE_KEY = "agroalerta_banner_dismissed_id";

export function readDismissedBannerId(): number | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function rememberDismissedBannerId(id: number): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(id));
  } catch {
    // private mode
  }
}

export function clearDismissedBannerId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // private mode
  }
}
