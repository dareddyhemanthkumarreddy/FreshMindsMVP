#!/usr/bin/env bash
set -e

echo "=== QualityLens Smoke Test Suite ==="

# 1. Verify metric files exist
echo "[*] Checking metric artifacts..."
for p in transistor metal_nut cable zipper breakfast_box summary_benchmark; do
  if [ ! -f "artifacts/metrics/${p}.json" ] && [ ! -f "artifacts/metrics/${p}_metrics.json" ]; then
    echo "[-] Missing metric file for $p"
    exit 1
  fi
done
echo "[✓] All metric files verified."

# 2. Verify inspection profiles exist
echo "[*] Checking YAML inspection profiles..."
for p in transistor metal_nut cable zipper breakfast_box; do
  if [ ! -f "ml/profiles/${p}.yaml" ]; then
    echo "[-] Missing YAML profile for $p"
    exit 1
  fi
done
echo "[✓] All 5 product YAML profiles verified."

# 3. Verify deterministic seed data exists
echo "[*] Checking seed production history..."
if [ ! -f "artifacts/seed_production_history.json" ]; then
  echo "[-] Missing seed production history. Running seed script..."
  python3 scripts/seed_demo_data.py
fi
echo "[✓] Seed history verified."

# 4. Run Python unit tests
echo "[*] Executing unit tests..."
python3 backend/tests/test_all_unittest.py

echo "[✓] Smoke tests passed cleanly!"
