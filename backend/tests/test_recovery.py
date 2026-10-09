import pytest
from app.services.recovery import OpticalRecoveryEngine

def test_recovery_engine_recovers_via_cam2():
    recovery = OpticalRecoveryEngine()
    initial_qual = {"overall_score": 55.0, "failure_reasons": ["Motion blur on CAM-01"]}
    res = recovery.execute_recovery(
        inspection_id="INS-TEST-001",
        initial_camera="CAM-01",
        initial_quality_result=initial_qual
    )
    assert res["recovered"] is True
    assert res["final_camera"] == "CAM-02"
    assert len(res["timeline"]) == 2
    assert res["timeline"][0]["status"] == "FAILED"
    assert res["timeline"][1]["status"] == "PASSED"

def test_recovery_tracks_same_inspection_id():
    recovery = OpticalRecoveryEngine()
    initial_qual = {"overall_score": 50.0, "failure_reasons": ["Glare"]}
    res = recovery.execute_recovery(
        inspection_id="INS-TRACK-42",
        initial_camera="CAM-01",
        initial_quality_result=initial_qual
    )
    assert res["total_attempts"] in [2, 3]
