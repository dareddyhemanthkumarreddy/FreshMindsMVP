"""
QualityLens - Image Quality Gate (Classical algorithms, deterministic evaluation)
Evaluates sharpness (Laplacian variance), illumination, glare/saturation, contrast and framing.
Generates a 0-100 score and explicit failure reasons BEFORE ML inference.
"""

from typing import Dict, Any, List

class ImageQualityGate:
    def __init__(self):
        self.min_score = 70.0
        self.blur_threshold = 140.0
        self.min_brightness = 40.0
        self.max_brightness = 220.0
        self.glare_max_pct = 4.0

    def evaluate(self, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        metrics dict keys:
          blur_laplacian: float
          brightness_mean: float
          glare_saturation_pct: float
          contrast_std: float
          framing_centering: float (0.0 to 1.0)
        """
        reasons: List[str] = []
        
        # 1. Blur evaluation
        blur_val = metrics.get("blur_laplacian", 210.0)
        blur_score = min(100.0, max(0.0, (blur_val / 200.0) * 100.0))
        if blur_val < self.blur_threshold:
            reasons.append(f"Image blur detected (Laplacian variance {blur_val:.1f} < {self.blur_threshold:.1f})")

        # 2. Brightness evaluation
        b_mean = metrics.get("brightness_mean", 128.0)
        if b_mean < self.min_brightness:
            b_score = max(0.0, (b_mean / self.min_brightness) * 80.0)
            reasons.append(f"Severe underexposure (mean luminance {b_mean:.1f} < {self.min_brightness:.1f})")
        elif b_mean > self.max_brightness:
            b_score = max(0.0, 100.0 - (b_mean - self.max_brightness) * 3.0)
            reasons.append(f"Severe overexposure (mean luminance {b_mean:.1f} > {self.max_brightness:.1f})")
        else:
            b_score = 96.0

        # 3. Glare & Saturation
        glare_pct = metrics.get("glare_saturation_pct", 1.2)
        if glare_pct > self.glare_max_pct:
            g_score = max(0.0, 100.0 - (glare_pct - self.glare_max_pct) * 15.0)
            reasons.append(f"Specular reflection / glare exceeds tolerance ({glare_pct:.1f}% > {self.glare_max_pct:.1f}%)")
        else:
            g_score = 95.0

        # 4. Contrast
        contrast = metrics.get("contrast_std", 55.0)
        c_score = min(100.0, max(20.0, contrast * 1.6))
        if contrast < 28.0:
            reasons.append("Insufficient optical contrast across feature boundaries")

        # 5. Framing & centering
        framing = metrics.get("framing_centering", 0.94)
        f_score = framing * 100.0
        if framing < 0.70:
            reasons.append("Incomplete product framing / boundary clipping detected")

        # Composite score
        overall_score = round(
            (blur_score * 0.35) +
            (b_score * 0.25) +
            (g_score * 0.15) +
            (c_score * 0.15) +
            (f_score * 0.10),
            1
        )

        passed = overall_score >= self.min_score and len(reasons) == 0

        return {
            "overall_score": overall_score,
            "passed": passed,
            "blur_score": round(blur_score, 1),
            "brightness_score": round(b_score, 1),
            "glare_score": round(g_score, 1),
            "contrast_score": round(c_score, 1),
            "framing_score": round(f_score, 1),
            "failure_reasons": reasons
        }
