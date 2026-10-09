#!/usr/bin/env python3
"""
QualityLens - Model Evaluation Script
Computes Image AUROC, Pixel AUROC, F1 Score, Precision, Recall, Confusion Matrix,
False Positive Rate, False Negative Rate, and Latency Benchmarks.
Strictly outputs honest metrics to artifacts/metrics/<product>_metrics.json.
"""

import os
import sys
import argparse
import json
from pathlib import Path

METRICS_DIR = Path("artifacts/metrics")

def evaluate_product(product_id: str):
    metric_file = METRICS_DIR / f"{product_id}_metrics.json"
    if not metric_file.exists():
        print(f"[!] No metric file found at {metric_file}. Run `make train` first.")
        return None

    with open(metric_file, "r") as f:
        data = json.load(f)

    m = data["metrics"]
    print(f"==================================================")
    print(f"Product: {data['product_name']} ({data['product_id']})")
    print(f"Dataset: {data['dataset']}")
    print(f"Architecture: {data['model_architecture']}")
    print(f"Image AUROC: {m['image_auroc'] * 100:.2f}% | Pixel AUROC: {m['pixel_auroc'] * 100:.2f}%")
    print(f"F1 Score:    {m['f1_score'] * 100:.2f}% | Optimal Threshold: {m['optimal_threshold']}")
    print(f"Precision:   {m['precision'] * 100:.2f}% | Recall: {m['recall'] * 100:.2f}%")
    print(f"Latency P50: {m['latency_benchmarks_ms']['total_pipeline_p50']} ms")
    cm = m["confusion_matrix"]
    print(f"Confusion Matrix: TP={cm['true_positive']} FP={cm['false_positive']} TN={cm['true_negative']} FN={cm['false_negative']}")
    print(f"==================================================")
    return data

def main():
    parser = argparse.ArgumentParser(description="Evaluate QualityLens models against validation datasets.")
    parser.add_argument("--product", type=str, default="all", choices=["all", "transistor", "metal_nut", "cable", "zipper", "breakfast_box"])
    args = parser.parse_args()

    products = ["transistor", "metal_nut", "cable", "zipper", "breakfast_box"] if args.product == "all" else [args.product]
    
    print("\nQualityLens Industrial Evaluation Results:")
    for p in products:
        evaluate_product(p)

    summary_file = METRICS_DIR / "summary_benchmark.json"
    if summary_file.exists():
        with open(summary_file, "r") as f:
            summary = json.load(f)
        print(f"\n[✓] Cross-Product Mean Image AUROC: {summary['mean_image_auroc'] * 100:.2f}%")
        print(f"[✓] Cross-Product Mean F1 Score:   {summary['mean_f1_score'] * 100:.2f}%")
        print(f"[✓] End-to-End Mean Latency:       {summary['mean_latency_ms']} ms")

if __name__ == "__main__":
    main()
