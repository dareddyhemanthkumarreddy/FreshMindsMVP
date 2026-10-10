export type InspectionResult = 'PASS' | 'REJECT' | 'REVIEW' | 'UNINSPECTABLE';
export type SeverityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface StageLatency {
  capture_ms: number;
  quality_gate_ms: number;
  identification_ms: number;
  inference_ms: number;
  postprocess_ms: number;
  decision_ms: number;
  actuation_ms: number;
}

export interface AnomalyRegion {
  id: string;
  box: number[]; // [ymin, xmin, ymax, xmax]
  score: number;
  defect_type: string;
  severity: SeverityLevel;
  in_critical_zone: boolean;
  zone_name?: string;
}

export interface RecoveryStep {
  attempt: number;
  camera: string;
  status: 'PASSED' | 'FAILED' | 'RETRY_REQUIRED' | 'FAILED_EXHAUSTED';
  score?: number;
  reason?: string;
  notes?: string;
}

export interface InspectionRecord {
  inspection_id: string;
  timestamp: string;
  product_id: string;
  product_name: string;
  detected_item?: string;
  image_url?: string;
  line: string;
  machine: string;
  batch: string;
  shift: string;
  camera: string;
  image_quality_score: number;
  quality_gate_passed: boolean;
  failure_reasons?: string[];
  result: InspectionResult;
  decision: InspectionResult;
  defect_type: string;
  confidence: number;
  severity: SeverityLevel;
  critical_zone: boolean;
  explanation: string;
  recovery_attempts: number;
  recovery_history?: RecoveryStep[];
  stage_latency: StageLatency;
  total_latency_ms: number;
  timing_deadline_ms: number;
  missed_deadline: boolean;
  model_version: string;
  threshold_version: string;
  regions?: AnomalyRegion[];
  reviewed_by_human?: boolean;
  human_override?: {
    inspector: string;
    action: string;
    reason: string;
    annotated_defect?: string;
    timestamp: string;
  } | null;
  is_fault_injected?: boolean;
}

export interface ProductProfile {
  product_id: string;
  name: string;
  dataset: string;
  image: string;
  defect_classes_count: number;
  nominal_speed_mps: number;
  deadline_budget_ms: number;
}
