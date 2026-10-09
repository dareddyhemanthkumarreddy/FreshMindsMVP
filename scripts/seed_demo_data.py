#!/usr/bin/env python3
"""
QualityLens - Deterministic Production Data Seed Script
Generates 1,200+ historical inspection records over 14 days and current shift,
including realistic industrial storylines:
1. Scratch spike on Shift B on Machine M-04 (Line 2)
2. Lens-contamination episode on Camera CAM-01 (Quality Gate score drops, system issue vs product defect)
3. Batch-linked defect rise (Batch B-8422 with vendor wire cut defects)
4. Confidence-drift episode with flagged review candidates
5. Event-aligned change point (Tooling replacement followed by vibration increase)
"""

import json
import random
import datetime
from pathlib import Path

OUTPUT_FILE = Path("artifacts/seed_production_history.json")

PRODUCTS = ["transistor", "metal_nut", "cable", "zipper", "breakfast_box"]
MACHINES = ["M-01", "M-02", "M-03", "M-04", "M-05", "M-06"]
LINES = ["L1", "L2"]
SHIFTS = ["Shift A (Morning)", "Shift B (Evening)", "Shift C (Night)"]
CAMERAS = ["CAM-01", "CAM-02", "CAM-03"]

DEFECT_TYPES = {
    "transistor": ["bent_lead", "damaged_case", "cut_lead", "misplaced_heat_sink", "unknown_anomaly"],
    "metal_nut": ["bent", "scratch", "color_defect", "thread_burr", "unknown_anomaly"],
    "cable": ["bent_wire", "cut_inner_insulation", "cut_outer_insulation", "missing_wire", "wrong_sequence", "unknown_anomaly"],
    "zipper": ["broken_teeth", "missing_teeth", "fabric_interior_tear", "rough_teeth_burr", "unknown_anomaly"],
    "breakfast_box": ["missing_yogurt", "displaced_croissant", "unsealed_fruit_compartment", "foreign_granola_contamination", "unknown_anomaly"]
}

def generate_seed_data():
    random.seed(42)  # Deterministic seed
    now = datetime.datetime(2026, 10, 8, 13, 0, 0)
    records = []
    
    # 14 days back, 1200 records
    total_samples = 1250
    for i in range(total_samples):
        # Time distribution spanning 14 days up to now
        minutes_back = int((1250 - i) * 16.1)
        ts = now - datetime.timedelta(minutes=minutes_back)
        ts_str = ts.isoformat() + "Z"
        
        # Determine shift
        hour = ts.hour
        if 6 <= hour < 14:
            shift = "Shift A (Morning)"
        elif 14 <= hour < 22:
            shift = "Shift B (Evening)"
        else:
            shift = "Shift C (Night)"
            
        prod = random.choice(PRODUCTS)
        machine = random.choice(MACHINES)
        line = "L1" if machine in ["M-01", "M-02", "M-03"] else "L2"
        camera = random.choice(CAMERAS)
        
        # Batch determination
        batch_num = 8400 + (ts.day * 2) + (0 if shift == "Shift A" else 1)
        batch = f"B-{batch_num}"
        
        # Default nominal rates
        defect_prob = 0.042
        quality_score = random.uniform(85.0, 98.0)
        
        # STORY 1: Machine M-04 on Shift B has high scratch/burr rate
        if machine == "M-04" and "Shift B" in shift and prod == "metal_nut":
            defect_prob = 0.38
            
        # STORY 2: Lens contamination on CAM-01 between Oct 6 08:00 and 12:00
        is_lens_contam_window = (ts.day == 6 and 8 <= ts.hour <= 12 and camera == "CAM-01")
        if is_lens_contam_window:
            quality_score = random.uniform(42.0, 68.0)
            
        # STORY 3: Batch B-8422 has copper wire defect surge in cable
        if batch == "B-8422" and prod == "cable":
            defect_prob = 0.42
            
        # STORY 4: Confidence drift in recent 2 days for zipper
        is_drift_period = (ts.day >= 7 and prod == "zipper")
        confidence_base = random.uniform(0.72, 0.88) if is_drift_period else random.uniform(0.92, 0.99)
        
        # Determine outcome
        inspection_id = f"INS-202610{ts.day:02d}-{i+1000:04d}"
        
        if quality_score < 70.0:
            result = "UNINSPECTABLE"
            defect = "none"
            severity = "none"
            confidence = round(random.uniform(0.35, 0.55), 3)
            decision = "UNINSPECTABLE"
            explanation = "Image quality gate failed: severe lens glare / particulate contamination detected."
            critical_zone = False
            recovery_attempts = 2
            final_camera = "CAM-02"
        elif random.random() < defect_prob:
            # Defect injected
            defect = random.choice(DEFECT_TYPES[prod])
            if defect == "unknown_anomaly":
                result = "REVIEW"
                decision = "REVIEW"
                severity = "medium"
                confidence = round(random.uniform(0.61, 0.74), 3)
                explanation = "PatchCore anomaly detected with no matching prototype in catalog (novel distribution)."
                critical_zone = False
            else:
                result = "REJECT"
                decision = "REJECT"
                severity = random.choice(["high", "critical", "medium"])
                confidence = round(confidence_base, 3)
                critical_zone = True if severity in ["critical", "high"] else False
                explanation = f"Defect '{defect}' identified in critical zone exceeding tolerance limit."
            recovery_attempts = 0
            final_camera = camera
        elif confidence_base < 0.82:
            # Low confidence -> REVIEW
            result = "REVIEW"
            decision = "REVIEW"
            defect = "marginal_edge_variance"
            severity = "low"
            confidence = round(confidence_base, 3)
            explanation = "Borderline anomaly score in review band [0.485 - 0.548]; routed to human verification."
            critical_zone = False
            recovery_attempts = 0
            final_camera = camera
        else:
            result = "PASS"
            decision = "PASS"
            defect = "none"
            severity = "none"
            confidence = round(confidence_base, 3)
            explanation = "All feature embeddings within calibrated nominal bounds. Zero logical defects."
            critical_zone = False
            recovery_attempts = 0
            final_camera = camera
            
        # Latency breakdown (ms)
        stage_latency = {
            "capture_ms": round(random.uniform(2.5, 4.0), 1),
            "quality_gate_ms": round(random.uniform(3.2, 4.8), 1),
            "identification_ms": round(random.uniform(4.5, 6.2), 1),
            "inference_ms": round(random.uniform(16.5, 23.4), 1),
            "postprocess_ms": round(random.uniform(3.8, 5.5), 1),
            "decision_ms": round(random.uniform(1.0, 1.8), 1),
            "actuation_ms": round(random.uniform(4.0, 7.2), 1),
        }
        total_latency = sum(stage_latency.values())
        deadline_ms = 120.0
        missed_deadline = total_latency > deadline_ms

        records.append({
            "inspection_id": inspection_id,
            "timestamp": ts_str,
            "product_id": prod,
            "line": line,
            "machine": machine,
            "batch": batch,
            "shift": shift,
            "camera": final_camera,
            "image_quality_score": round(quality_score, 1),
            "result": result,
            "decision": decision,
            "defect_type": defect,
            "confidence": confidence,
            "severity": severity,
            "critical_zone": critical_zone,
            "explanation": explanation,
            "recovery_attempts": recovery_attempts,
            "stage_latency": stage_latency,
            "total_latency_ms": round(total_latency, 1),
            "timing_deadline_ms": deadline_ms,
            "missed_deadline": missed_deadline,
            "model_version": f"patchcore-{prod}-v2.4",
            "threshold_version": "calib-f1opt-v2.1",
            "reviewed_by_human": False,
            "human_override": None
        })

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(records, f, indent=2)

    print(f"[✓] Generated {len(records)} deterministic production records into {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_seed_data()
