# Data Sources — SIH 26246 National Labour Market Information System

## Overview

The LMIS pipeline ingests data from five primary source categories. In this **prototype implementation for SIH**, the raw data files are synthetic but structurally mirror real government data schemas to demonstrate the end-to-end analytics pipeline.

---

## Source Files (`data/raw/`)

| File | Rows | Description | Real-World Source |
|---|---|---|---|
| `job_postings.csv` | ~550 | Monthly job vacancy postings per trade, sector, district, and state with time series data. | National Career Service (NCS) Portal, State Employment Exchanges |
| `training_data.csv` | ~120 | Training institute capacity: enrolled, certified, and placed candidates by trade and district. | PMKVY MIS, NCVT MIS, State Skill Development Missions (SSDMs) |
| `placements.csv` | ~120 | Placement outcomes: number placed and placement rate by trade and district. | Skill India Digital Hub (SIDH), Sector Skill Council placement reports |
| `districts.csv` | ~30 | District master reference: district name, state, region, and tier classification. | Census of India 2011 / Delimitation Commission |
| `trades.csv` | ~30 | Trade/occupation master: trade name, NCO code, sector, and qualification level. | National Occupational Standards (NOS), National Classification of Occupations (NCO) |

---

## Processed Outputs (`data/processed/`)

| File | Description |
|---|---|
| `demand_index.csv` | Normalised demand index (0–100) per trade per district per month |
| `supply_index.csv` | Normalised supply index (0–100) per trade per district |
| `merged_lmis_data.csv` | Joined demand + supply for current gap computation |
| `demand_features.csv` | Engineered features: lag-1, lag-2, rolling mean-3, rolling std-3, hiring growth |
| `demand_forecast.csv` | ML-generated forecasts for 3M, 6M, 12M horizons |
| `future_supply.csv` | Projected supply estimates for each forecast horizon |
| `early_warning_flags.csv` | Early warning alerts: HIGH, MEDIUM, LOW with future gap and planning context |
| `model_evaluation.csv` | Empirical test metrics: MAE, RMSE, R² per model |
| `forecast_summary.csv` | Horizon comparison table for dashboard summary cards |

---

## Real-World Integration Roadmap

When deployed with live government data feeds, the pipeline connects to:

1. **National Career Service (NCS) Portal** — `https://www.ncs.gov.in/` — live vacancy API for real-time job postings by district and occupation.
2. **Skill India Digital Hub (SIDH)** — `https://www.skillindia.gov.in/` — PMKVY enrollment and placement MIS feeds.
3. **NCVT MIS** — `https://ncvtmis.gov.in/` — ITI and Apprenticeship certification records.
4. **eSkillindia** — NOS-aligned course completion and assessment outcomes.
5. **State Employment Exchanges** — State-specific active job seeker registrations.

### Data Update Frequency (Production)
- **Demand data**: Monthly refresh from NCS portal API
- **Supply data**: Quarterly refresh from PMKVY and NCVT MIS
- **Placement outcomes**: Semi-annual reconciliation

---

> **Prototype Disclaimer**: Raw data in `data/raw/` is generated programmatically (`scripts/generate_demo_data.py`) for demonstration purposes only. It follows the schema and statistical characteristics of real MSDE datasets. No actual personal or institutional data is included.
