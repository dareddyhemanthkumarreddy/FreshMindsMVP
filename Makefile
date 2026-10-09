.PHONY: help setup data train eval export seed test up down clean

help:
	@echo "QualityLens Industrial Decision Platform"
	@echo "=========================================="
	@echo "make setup    - Install backend & frontend dependencies"
	@echo "make data     - Download MVTec AD / LOCO benchmark structure"
	@echo "make train    - Train PatchCore memory banks on all products"
	@echo "make eval     - Run evaluation and generate artifacts/metrics/*.json"
	@echo "make export   - Export feature extractors to ONNX"
	@echo "make seed     - Deterministically seed simulated factory history"
	@echo "make test     - Run test suites (Python unit tests + linting)"
	@echo "make up       - Start docker compose stack (DB, Backend, Frontend)"
	@echo "make down     - Stop docker compose stack"

setup:
	npm install
	pip install -r backend/requirements.txt

data:
	python3 scripts/download_data.py --product all

train:
	python3 scripts/train.py --product all

eval:
	python3 scripts/evaluate.py --product all

export:
	python3 scripts/export_onnx.py --product all

seed:
	python3 scripts/seed_demo_data.py

test:
	python3 backend/tests/test_all_unittest.py
	npm run lint

up:
	docker compose up --build -d

down:
	docker compose down -v
