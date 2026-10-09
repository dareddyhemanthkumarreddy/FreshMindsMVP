import pytest
from app.services.quality_gate import ImageQualityGate

def test_quality_gate_passes_nominal_image():
    gate = ImageQualityGate()
    metrics = {
        "blur_laplacian": 240.0,
        "brightness_mean": 135.0,
        "glare_saturation_pct": 0.8,
        "contrast_std": 62.0,
        "framing_centering": 0.95
    }
    result = gate.evaluate(metrics)
    assert result["passed"] is True
    assert result["overall_score"] >= 80.0
    assert len(result["failure_reasons"]) == 0

def test_quality_gate_rejects_severe_blur():
    gate = ImageQualityGate()
    metrics = {
        "blur_laplacian": 45.0,
        "brightness_mean": 130.0,
        "glare_saturation_pct": 0.5,
        "contrast_std": 50.0,
        "framing_centering": 0.92
    }
    result = gate.evaluate(metrics)
    assert result["passed"] is False
    assert any("blur" in r.lower() for r in result["failure_reasons"])

def test_quality_gate_detects_underexposure_and_glare():
    gate = ImageQualityGate()
    metrics = {
        "blur_laplacian": 180.0,
        "brightness_mean": 25.0,
        "glare_saturation_pct": 6.5,
        "contrast_std": 40.0,
        "framing_centering": 0.90
    }
    result = gate.evaluate(metrics)
    assert result["passed"] is False
    assert len(result["failure_reasons"]) >= 1
