import axios from "axios";
import type {
  Diagnosis,
  DiagnosisListResponse,
  DiagnosisTimelineResponse,
  DiseaseStatItem,
  Farm,
  FarmActivityItem,
  HealthResponse,
  ModelStatus,
  Plot,
  StatisticsSummary,
  TimelinePoint,
} from "../types";

// Same-origin in production (Docker / Railway). Local Vite uses backend :8000.
const API_BASE =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? "http://127.0.0.1:8000"
      : "";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export function getApiBase(): string {
  return API_BASE;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/api/health");
  return data;
}

export async function getModelStatus(): Promise<ModelStatus> {
  const { data } = await api.get<ModelStatus>("/api/model/status");
  return data;
}

export async function listFarms(): Promise<Farm[]> {
  const { data } = await api.get<Farm[]>("/api/farms");
  return data;
}

export async function createFarm(payload: Omit<Farm, "id" | "created_at" | "updated_at">): Promise<Farm> {
  const { data } = await api.post<Farm>("/api/farms", payload);
  return data;
}

export async function updateFarm(
  id: number,
  payload: Partial<Omit<Farm, "id" | "created_at" | "updated_at">>,
): Promise<Farm> {
  const { data } = await api.put<Farm>(`/api/farms/${id}`, payload);
  return data;
}

export async function deleteFarm(id: number): Promise<void> {
  await api.delete(`/api/farms/${id}`);
}

export async function listPlots(farmId?: number): Promise<Plot[]> {
  const { data } = await api.get<Plot[]>("/api/plots", {
    params: farmId ? { farm_id: farmId } : undefined,
  });
  return data;
}

export async function createPlot(
  payload: Omit<Plot, "id" | "created_at" | "updated_at" | "farm_name">,
): Promise<Plot> {
  const { data } = await api.post<Plot>("/api/plots", payload);
  return data;
}

export async function updatePlot(
  id: number,
  payload: Partial<Omit<Plot, "id" | "created_at" | "updated_at" | "farm_name">>,
): Promise<Plot> {
  const { data } = await api.put<Plot>(`/api/plots/${id}`, payload);
  return data;
}

export async function deletePlot(id: number): Promise<void> {
  await api.delete(`/api/plots/${id}`);
}

export async function createDiagnosis(formData: FormData): Promise<Diagnosis> {
  const { data } = await api.post<Diagnosis>("/api/diagnosis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function createFollowUp(diagnosisId: number, formData: FormData): Promise<Diagnosis> {
  const { data } = await api.post<Diagnosis>(`/api/diagnosis/${diagnosisId}/follow-up`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listDiagnoses(params: Record<string, string | number | undefined>): Promise<DiagnosisListResponse> {
  const { data } = await api.get<DiagnosisListResponse>("/api/diagnosis", { params });
  return data;
}

export async function getDiagnosis(id: number): Promise<Diagnosis> {
  const { data } = await api.get<Diagnosis>(`/api/diagnosis/${id}`);
  return data;
}

export async function getLatestDiagnosis(): Promise<Diagnosis | null> {
  const { data } = await api.get<Diagnosis | null>("/api/diagnosis/latest");
  return data;
}

export async function getDiagnosisTimeline(id: number): Promise<DiagnosisTimelineResponse> {
  const { data } = await api.get<DiagnosisTimelineResponse>(`/api/diagnosis/${id}/timeline`);
  return data;
}

export async function deleteDiagnosis(id: number): Promise<void> {
  await api.delete(`/api/diagnosis/${id}`);
}

export async function getSummary(): Promise<StatisticsSummary> {
  const { data } = await api.get<StatisticsSummary>("/api/statistics/summary");
  return data;
}

export async function getDiseaseStats(): Promise<DiseaseStatItem[]> {
  const { data } = await api.get<DiseaseStatItem[]>("/api/statistics/diseases");
  return data;
}

export async function getTimeline(granularity: "day" | "week" | "month" = "week"): Promise<TimelinePoint[]> {
  const { data } = await api.get<TimelinePoint[]>("/api/statistics/timeline", {
    params: { granularity },
  });
  return data;
}

export async function getFarmActivity(): Promise<FarmActivityItem[]> {
  const { data } = await api.get<FarmActivityItem[]>("/api/statistics/farms");
  return data;
}

export function extractErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado."): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || JSON.stringify(item)).join(" · ");
    }
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
