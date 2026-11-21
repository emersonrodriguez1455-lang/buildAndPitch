import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDateTime(value: string): string {
  try {
    return format(parseISO(value), "dd MMM yyyy · HH:mm", { locale: es });
  } catch {
    return value;
  }
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function confidenceTone(confidence: number): string {
  if (confidence >= 0.7) return "text-leaf";
  if (confidence >= 0.45) return "text-warn";
  return "text-alert";
}

export function apiImageUrl(path: string, apiBase: string): string {
  if (path.startsWith("http")) return path;
  return `${apiBase.replace(/\/$/, "")}${path}`;
}
