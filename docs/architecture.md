# System Architecture — SIH 26246 National Labour Market Information System

## Overview

The LMIS is a full-stack AI platform that ingests fragmented labour-market signals, computes standardised demand and supply indices, detects skill gaps, and forecasts 3/6/12-month requirements using supervised machine learning.

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATA INGESTION LAYER                           │
│   NCS Job Portals · State Skill Portals · PMKVY · ITI · NCVT   │
└────────────────────────┬────────────────────────────────────────┘
                         │  (raw CSVs in data/raw/)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ML PROCESSING PIPELINE  (ml/)                  │
│                                                                 │
│  [1] clean_data.py   — dedup, null-fill, schema validation      │
│  [2] normalize_data.py — MinMax scaling per indicator           │
│  [3] feature_engineering.py — lag, rolling stats, growth rates  │
│  [4] demand_index.py — Weighted Index (60% postings / 40% hist) │
│  [5] supply_index.py — Weighted Index (50% enrol / 20% cert /   │
│                                         30% placed)             │
│  [6] calculate_gap.py — Gap = Demand - Supply; status classify  │
│  [7] train_model.py  — RandomForestRegressor (walk-forward CV)  │
│  [8] predict.py      — 3M / 6M / 12M horizon forecasts         │
│  [9] evaluate.py     — MAE, RMSE, R² on held-out test set       │
│  [10] early_warning  — Flag future gap > capacity threshold      │
└────────────────────────┬────────────────────────────────────────┘
                         │  (processed CSVs in data/processed/)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               FASTAPI BACKEND  (backend/)                       │
│                                                                 │
│  GET /health                    System health probe             │
│  GET /api/dashboard/summary     Aggregate KPI metrics           │
│  GET /api/demand                Demand records (filterable)     │
│  GET /api/supply                Supply records (filterable)     │
│  GET /api/forecast              Forecasts by horizon            │
│  GET /api/forecast/summary      Horizon comparison table        │
│  GET /api/forecast/evaluation   Empirical MAE/RMSE/R² metrics   │
│  GET /api/gap                   Skill gap records               │
│  GET /api/gap/shortages         Shortage-only records           │
│  GET /api/gap/oversupply        Oversupply-only records         │
│  GET /api/alerts                Early warning alerts            │
│  GET /api/alerts/high           HIGH-severity alerts only       │
│  GET /api/locations/states      Available states list           │
│  GET /api/locations/districts   Available districts list        │
│  GET /api/locations/trades      Available trades list           │
└────────────────────────┬────────────────────────────────────────┘
                         │  (Vite proxy /api → :8000)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              REACT DASHBOARD  (frontend/)                       │
│                                                                 │
│  /dashboard          National KPIs · Insight Cards · Charts     │
│  /state-analysis     State drill-down · District breakdown      │
│  /district-analysis  District trades · Qualification gaps       │
│  /trade-analysis     Trade profile · Regional comparison        │
│  /forecast           ML forecast charts · Evaluation benchmarks  │
│  /skill-gap          Gap heatmap · Shortage / Oversupply tables  │
│  /alerts             Early warning signals · Tiered severity     │
│  /methodology        Formula disclosures · Prototype disclaimer  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Layout

```
SIH_26246/
├── backend/app/          # FastAPI application
│   ├── api/              # Route handlers (demand, supply, forecast, gap, alerts)
│   ├── services/         # Business logic (reads processed CSVs)
│   └── main.py           # CORS, router registration, startup
├── data/
│   ├── raw/              # Ingested source files (job_postings, training_data…)
│   └── processed/        # Pipeline outputs (indices, forecasts, gaps, alerts)
├── docs/                 # API docs, methodology, data sources, architecture
├── frontend/src/
│   ├── components/       # Shared UI: StatCard, ForecastChart, InsightCards…
│   ├── pages/            # Route pages: Dashboard, Forecast, Alerts…
│   ├── services/api.js   # Axios API client
│   └── utils/exportCsv.js# Client-side CSV download utility
├── ml/                   # Python ML pipeline modules
├── presentation/         # Demo script, architecture diagram, PPTX
├── scripts/              # run_pipeline.py, generate_demo_data.py
└── tests/                # pytest: test_api, test_data, test_ml (38 tests)
```

## Technology Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.14 · FastAPI · Uvicorn · Pandas · Pydantic |
| Machine Learning | scikit-learn RandomForestRegressor · walk-forward CV |
| Frontend | React 18 · Vite 5 · Tailwind CSS · Recharts · Lucide Icons |
| Data Format | CSV (RFC 4180) stored in `data/processed/` |
| Containerisation | Docker + docker-compose |
| Testing | pytest 9 (38 tests — API, data integrity, ML invariants) |
