"""
QualityLens - Quality Decision Engine
Produces PASS / REJECT / REVIEW / UNINSPECTABLE decisions.
Enforces:
1. Never PASS when image quality is unreliable.
2. Low confidence / novel unknown anomaly -> REVIEW (never auto-reject or auto-pass).
3. Severity escalation when defects intersect safety-critical zones.
4. Plain-language explanation grounded in evidence.
"""

from typing import Dict, Any, List

class QualityDecisionEngine:
    def evaluate_decision(
        self,
        product_id: str,
        quality_gate_result: Dict[str, Any],
        anomaly_score: float,
        calibrated_thresholds: Dict[str, float],
        defect_type: str,
        confidence: float,
        critical_zone_hit: bool,
        zone_name: str = "General Body"
    ) -> Dict[str, Any]:
        
        # Rule 1: Optical Gate Check
        if not quality_gate_result.get("passed", False):
            return {
                "result": "UNINSPECTABLE",
                "decision": "UNINSPECTABLE",
                "severity": "none",
                "confidence": confidence,
                "reason_code": "QUAL_GATE_FAILED",
                "explanation": f"Image quality gate failed: {', '.join(quality_gate_result.get('failure_reasons', ['Low quality']))}. Actuation paused pending optical recovery."
            }

        normal_cutoff = calibrated_thresholds.get("normal_cutoff", 0.485)
        reject_cutoff = calibrated_thresholds.get("reject_cutoff", 0.548)

        # Rule 2: Unknown anomaly check
        if defect_type == "unknown_anomaly" and anomaly_score > normal_cutoff:
            return {
                "result": "REVIEW",
                "decision": "REVIEW",
                "severity": "medium",
                "confidence": confidence,
                "reason_code": "ANOMALY_NOVEL_UNKNOWN",
                "explanation": f"Statistical outlier detected (score {anomaly_score:.3f} > cutoff {normal_cutoff:.3f}) with no matching prototype in catalog. Routed to quality inspector."
            }

        # Rule 3: Anomaly score below normal cutoff
        if anomaly_score <= normal_cutoff:
            return {
                "result": "PASS",
                "decision": "PASS",
                "severity": "none",
                "confidence": confidence,
                "reason_code": "ALL_BOUNDS_NOMINAL",
                "explanation": f"All feature embeddings within calibrated tolerance (score {anomaly_score:.3f} <= cutoff {normal_cutoff:.3f})."
            }

        # Rule 4: Borderline review band
        if normal_cutoff < anomaly_score < reject_cutoff:
            return {
                "result": "REVIEW",
                "decision": "REVIEW",
                "severity": "low",
                "confidence": confidence,
                "reason_code": "UNCERTAIN_REVIEW_BAND",
                "explanation": f"Score {anomaly_score:.3f} falls in calibration review band [{normal_cutoff:.3f}, {reject_cutoff:.3f}]. Automated confidence {confidence*100:.1f}% below auto-reject threshold."
            }

        # Rule 5: Definite defect (> reject_cutoff)
        # Severity calculation
        base_severity = "high" if critical_zone_hit else "medium"
        if anomaly_score > 0.85:
            base_severity = "critical" if critical_zone_hit else "high"

        if critical_zone_hit:
            explanation = f"Critical defect '{defect_type}' detected in safety-critical zone '{zone_name}' (score {anomaly_score:.3f}). Exceeds reject limit {reject_cutoff:.3f}."
        else:
            explanation = f"Defect '{defect_type}' detected (score {anomaly_score:.3f} > limit {reject_cutoff:.3f}). Exceeds cosmetic and dimensional tolerances."

        return {
            "result": "REJECT",
            "decision": "REJECT",
            "severity": base_severity,
            "confidence": confidence,
            "reason_code": "DEFECT_CONFIRMED",
            "explanation": explanation
        }
