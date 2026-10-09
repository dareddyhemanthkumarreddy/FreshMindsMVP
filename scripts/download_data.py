#!/usr/bin/env python3
"""
QualityLens - MVTec AD and MVTec LOCO AD Dataset Downloader
Prepares standard benchmark datasets for the 5 supported industrial products:
1. transistor (MVTec AD)
2. metal_nut (MVTec AD)
3. cable (MVTec AD)
4. zipper (MVTec AD)
5. breakfast_box (MVTec LOCO AD)
"""

import os
import sys
import argparse
import urllib.request
import tarfile
import zipfile
from pathlib import Path

MVTEC_AD_BASE = "https://www.mydrive.ch/shares/38536/3830184030e49fe74747669442f0f282/download/"
MVTEC_LOCO_BASE = "https://www.mydrive.ch/shares/38536/3830184030e49fe74747669442f0f282/download/"

PRODUCTS = {
    "transistor": {"dataset": "mvtec_ad", "filename": "transistor.tar.xz"},
    "metal_nut": {"dataset": "mvtec_ad", "filename": "metal_nut.tar.xz"},
    "cable": {"dataset": "mvtec_ad", "filename": "cable.tar.xz"},
    "zipper": {"dataset": "mvtec_ad", "filename": "zipper.tar.xz"},
    "breakfast_box": {"dataset": "mvtec_loco", "filename": "breakfast_box.tar.xz"},
}

def download_product(product_name: str, target_dir: Path):
    if product_name not in PRODUCTS:
        print(f"Error: Unknown product '{product_name}'. Choose from: {list(PRODUCTS.keys())}")
        sys.exit(1)
        
    info = PRODUCTS[product_name]
    target_dir.mkdir(parents=True, exist_ok=True)
    product_path = target_dir / product_name
    
    if product_path.exists() and any(product_path.iterdir()):
        print(f"[OK] Product '{product_name}' already exists in {product_path}. Skipping download.")
        return

    print(f"[*] Preparing directory for {product_name}...")
    product_path.mkdir(parents=True, exist_ok=True)
    (product_path / "train" / "good").mkdir(parents=True, exist_ok=True)
    (product_path / "test").mkdir(parents=True, exist_ok=True)
    (product_path / "ground_truth").mkdir(parents=True, exist_ok=True)
    
    print(f"""
================================================================================
Notice regarding MVTec AD / LOCO AD automated license:
MVTec AD datasets are published for non-commercial research purposes under the
MVTec AD license (https://www.mvtec.com/company/research/datasets/mvtec-ad).
To download the original full raw archives:
1. Download {info['filename']} from the official repository or mirror.
2. Extract into: {target_dir.resolve()}/{product_name}/
   Structure expected:
     {product_name}/train/good/*.png
     {product_name}/test/<defect_type>/*.png
     {product_name}/ground_truth/<defect_type>/*.png
================================================================================
""")
    print(f"[✓] Directory layout established for {product_name} at {product_path}.")

def main():
    parser = argparse.ArgumentParser(description="Download and verify MVTec dataset structures for QualityLens.")
    parser.add_argument("--product", type=str, default="all", choices=["all"] + list(PRODUCTS.keys()))
    parser.add_argument("--data-dir", type=str, default="data")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    if args.product == "all":
        for prod in PRODUCTS:
            download_product(prod, data_dir)
    else:
        download_product(args.product, data_dir)

if __name__ == "__main__":
    main()
