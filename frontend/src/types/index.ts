export interface Farm {
  id: number;
  name: string;
  department: string;
  municipality: string;
  location: string;
  area_hectares: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plot {
  id: number;
  farm_id: number;
  name: string;
  coffee_variety: string | null;
  area_hectares: number | null;
  altitude: number | null;
  observations: string | null;
  farm_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlternativeScore {
  class_name: string;
  label: string;
  confidence: number;
}

export interface Diagnosis {
  id: number;
  farm_id: number;
  plot_id: number;
  farm_name: string;
  plot_name: string;
  predicted_class: string;
  predicted_class_label: string;
  confidence: number;
  recommendation: string;
  observations: string | null;
  model_name: string;
  model_version: string;
  created_at: string;
  image_url: string;
  is_healthy: boolean;
  status: string;
  alternatives?: AlternativeScore[];
  original_filename?: string;
}

export interface DiagnosisListResponse {
  items: Diagnosis[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StatisticsSummary {
  total_farms: number;
  total_plots: number;
  total_diagnoses: number;
  possible_issues: number;
  healthy_percentage: number;
  recent_activity_count: number;
}

export interface DiseaseStatItem {
  class_name: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TimelinePoint {
  period: string;
  count: number;
  healthy_count: number;
  issue_count: number;
}

export interface FarmActivityItem {
  farm_id: number;
  farm_name: string;
  diagnosis_count: number;
  healthy_count: number;
  issue_count: number;
}

export interface HealthResponse {
  status: string;
  app: string;
  environment: string;
  model: {
    loaded: boolean;
    loading: boolean;
    available: boolean;
    error: string | null;
  };
  mvp_note: string;
}

export interface ModelStatus {
  loaded: boolean;
  loading: boolean;
  available: boolean;
  device: string | null;
  model_name: string;
  model_version: string;
  model_repo: string;
  classes: string[];
  error: string | null;
  disclaimer: string;
}
