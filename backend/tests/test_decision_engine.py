import pytest
from app.services.decision import QualityDecisionEngine

def test_decision_engine_uninspectable_on_failed_gate():
    engine = QualityDecisionEngine()
    qual = {"passed": False, "failure_reasons": ["Optical blur detected"]}
    decision = engine.evaluate_decision(
        product_id="transistor",
        quality_gate_result=qual,
        anomaly_score=0.30,
        calibrated_thresholds={"normal_cutoff": 0.485, "reject_cutoff": 0.548},
        defect_type="none",
        confidence=0.95,
        critical_zone_hit=False
    )
    assert decision["result"] == "UNINSPECTABLE"
    assert decision["reason_code"] == "QUAL_GATE_FAILED"

def test_decision_engine_pass_on_nominal():
    engine = QualityDecisionEngine()
    qual = {"passed": True, "failure_reasons": []}
    decision = engine.evaluate_decision(
        product_id="transistor",
        quality_gate_result=qual,
        anomaly_score=0.32,
        calibrated_thresholds={"normal_cutoff": 0.485, "reject_cutoff": 0.548},
        defect_type="none",
        confidence=0.98,
        critical_zone_hit=False
    )
    assert decision["result"] == "PASS"

def test_decision_engine_review_on_unknown_anomaly():
    engine = QualityDecisionEngine()
    qual = {"passed": True, "failure_reasons": []}
    decision = engine.evaluate_decision(
        product_id="transistor",
        quality_gate_result=qual,
        anomaly_score=0.72,
        calibrated_thresholds={"normal_cutoff": 0.485, "reject_cutoff": 0.548},
        defect_type="unknown_anomaly",
        confidence=0.71,
        critical_zone_hit=False
    )
    assert decision["result"] == "REVIEW"
    assert decision["reason_code"] == "ANOMALY_NOVEL_UNKNOWN"

def test_decision_engine_reject_escalates_on_critical_zone():
    engine = QualityDecisionEngine()
    qual = {"passed": True, "failure_reasons": []}
    decision = engine.evaluate_decision(
        product_id="transistor",
        quality_gate_result=qual,
        anomaly_score=0.89,
        calibrated_thresholds={"normal_cutoff": 0.485, "reject_cutoff": 0.548},
        defect_type="bent_lead",
        confidence=0.96,
        critical_zone_hit=True,
        zone_name="Terminal Leads (Z1)"
    )
    assert decision["result"] == "REJECT"
    assert decision["severity"] == "critical"
    assert "Terminal Leads" in decision["explanation"]
