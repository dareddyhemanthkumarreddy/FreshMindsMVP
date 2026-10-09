import pytest
from app.services.changepoint import QualityIntelligenceService

def test_cusum_detects_defect_surge():
    service = QualityIntelligenceService(baseline_defect_rate=0.04, cusum_threshold_h=3.0)
    # Generate nominal sequence followed by cluster of failures
    stream = [{"timestamp": f"2026-10-08T10:{i:02d}:00Z", "result": "PASS"} for i in range(20)]
    stream.extend([{"timestamp": f"2026-10-08T10:{20+i:02d}:00Z", "result": "REJECT"} for i in range(12)])
    
    cps = service.detect_changepoints(stream)
    assert len(cps) >= 1
    assert cps[0]["severity"] in ["WARNING", "CRITICAL"]

def test_system_vs_product_discrimination():
    service = QualityIntelligenceService()
    
    # Episode A: Low optical score -> SYSTEM issue
    system_stream = [
        {"image_quality_score": 52.0, "result": "UNINSPECTABLE"},
        {"image_quality_score": 58.0, "result": "UNINSPECTABLE"},
        {"image_quality_score": 64.0, "result": "REJECT"}
    ]
    res_sys = service.discriminate_system_vs_product(system_stream)
    assert res_sys["verdict"] == "INSPECTION_SYSTEM_DEGRADATION"

    # Episode B: High optical score + many defects -> PRODUCT issue
    product_stream = [
        {"image_quality_score": 94.0, "result": "REJECT"},
        {"image_quality_score": 96.0, "result": "REJECT"},
        {"image_quality_score": 92.0, "result": "REJECT"},
        {"image_quality_score": 95.0, "result": "PASS"}
    ]
    res_prod = service.discriminate_system_vs_product(product_stream)
    assert res_prod["verdict"] == "GENUINE_PRODUCT_ANOMALY"
