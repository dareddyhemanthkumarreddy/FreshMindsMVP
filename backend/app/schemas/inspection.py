from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StageLatency(BaseModel):
    capture_ms: float = 3.2
    quality_gate_ms: float = 4.1
    identification_ms: float = 5.0
    inference_ms: float = 18.5
    postprocess_ms: float = 4.2
    decision_ms: float = 1.2
    actuation_ms: float = 5.1

class QualityGateDetail(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    passed: bool
    blur_score: float
    brightness_score: float
    glare_score: float
    framing_score: float
    contrast_score: float
    failure_reasons: List[str] = []

class AnomalyRegion(BaseModel):
    id: str
    box: List[float] # [ymin, xmin, ymax, xmax] normalized
    score: float
    defect_type: str
    severity: str
    in_critical_zone: bool
    zone_name: Optional[str] = None

class InspectionResponse(BaseModel):
    inspection_id: str
    timestamp: str
    product_id: str
    line: str
    machine: str
    batch: str
    shift: str
    camera: str
    quality_gate: QualityGateDetail
    result: str # PASS | REJECT | REVIEW | UNINSPECTABLE
    decision: str
    confidence: float
    severity: str # none | low | medium | high | critical
    critical_zone_hit: bool
    defect_type: str
    explanation: str
    recovery_attempts: int
    recovery_history: List[Dict[str, Any]] = []
    stage_latency: StageLatency
    total_latency_ms: float
    timing_deadline_ms: float
    missed_deadline: bool
    model_version: str
    threshold_version: str
    heatmap_data_url: Optional[str] = None
    regions: List[AnomalyRegion] = []
    reviewed_by_human: bool = False
    human_override: Optional[Dict[str, Any]] = None

class ReviewSubmission(BaseModel):
    inspector_name: str
    action: str # CONFIRM | OVERRIDE_PASS | OVERRIDE_REJECT
    reason: str
    annotated_defect: Optional[str] = None
