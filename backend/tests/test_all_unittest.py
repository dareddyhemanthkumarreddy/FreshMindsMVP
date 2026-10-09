import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.quality_gate import ImageQualityGate
from app.services.decision import QualityDecisionEngine
from app.services.recovery import OpticalRecoveryEngine
from app.services.changepoint import QualityIntelligenceService

class TestQualityLensCore(unittest.TestCase):
    def test_quality_gate(self):
        gate = ImageQualityGate()
        nominal = {
            "blur_laplacian": 240.0,
            "brightness_mean": 135.0,
            "glare_saturation_pct": 0.8,
            "contrast_std": 62.0,
            "framing_centering": 0.95
        }
        res = gate.evaluate(nominal)
        self.assertTrue(res["passed"])
        self.assertGreaterEqual(res["overall_score"], 80.0)

    def test_decision_engine_rules(self):
        engine = QualityDecisionEngine()
        qual = {"passed": True, "failure_reasons": []}
        res_pass = engine.evaluate_decision("transistor", qual, 0.32, {"normal_cutoff": 0.485, "reject_cutoff": 0.548}, "none", 0.98, False)
        self.assertEqual(res_pass["result"], "PASS")

        res_review = engine.evaluate_decision("transistor", qual, 0.72, {"normal_cutoff": 0.485, "reject_cutoff": 0.548}, "unknown_anomaly", 0.71, False)
        self.assertEqual(res_review["result"], "REVIEW")
        self.assertEqual(res_review["reason_code"], "ANOMALY_NOVEL_UNKNOWN")

    def test_optical_recovery(self):
        recovery = OpticalRecoveryEngine()
        res = recovery.execute_recovery("INS-100", "CAM-01", {"overall_score": 52.0, "failure_reasons": ["Blur"]})
        self.assertTrue(res["recovered"])
        self.assertEqual(res["final_camera"], "CAM-02")

    def test_change_point_and_discrimination(self):
        service = QualityIntelligenceService()
        sys_stream = [{"image_quality_score": 50.0, "result": "UNINSPECTABLE"}]
        verdict = service.discriminate_system_vs_product(sys_stream)
        self.assertEqual(verdict["verdict"], "INSPECTION_SYSTEM_DEGRADATION")

if __name__ == "__main__":
    unittest.main()
