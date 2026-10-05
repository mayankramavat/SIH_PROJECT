# National Labour Market Information System (LMIS)
## AI-Enabled Skill Demand-Supply Forecasting & Early Warning Platform (SIH_26246)

> **Ministry of Skill Development & Entrepreneurship (MSDE)**  
> **Smart India Hackathon (SIH) Solution**

The **National Labour Market Information System (LMIS)** is an end-to-end decision-support and workforce planning platform. It synthesizes industry hiring signals, institutional training outputs, and placement outcomes to identify current skill gaps, forecast future labor demand across 3, 6, and 12-month forward horizons using machine learning, and dispatch proactive early-warning alerts for emerging shortages.

---

## Key Features

1. **Executive Overview Dashboard**: High-level KPI indicators for national demand, supply, net candidate deficit, shortage occupations, 12M forecast curves, and active early-warning signals.
2. **State & District Analytics**: Granular workforce profiles across states and districts, including cascading geographic drilldowns, local qualification throughput, and multi-quarter forecast curves.
3. **Occupational & Trade Intelligence**: Profiles mapped to **NCO-2015** 8-digit codes and **NSQF levels**, detailing hiring intensity, training utilization, placement absorption rates, and cross-district geographic comparisons.
4. **AI Multi-Horizon Forecasting**: Time-series demand forecasting at **3, 6, and 12-month** horizons powered by a `RandomForestRegressor` model with walk-forward validation and feature importance metrics.
5. **Empirical Model Benchmarking**: Transparent validation benchmarks comparing ML models against baseline moving averages (MAE, RMSE, $R^2$) fetched directly from backend validation data.
6. **National Skill Gap Registry**: Sortable and filterable table categorizing occupations into `SHORTAGE` ($>+10\%$), `BALANCED` ($\pm 10\%$), and `OVERSUPPLY` ($<-10\%$).
7. **Proactive Early-Warning System**: 3-tier severity signals (`HIGH`, `MEDIUM`, `LOW`) with tailored policy action recommendations (e.g. ITI seat expansion, apprenticeship intake).
8. **Data Governance & Methodology**: Transparent mathematical documentation for the prototype Demand Index, Supply Index, and Gap formulations.

---

## Architecture & Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons, React Router v6.
- **Backend**: FastAPI, Uvicorn, Pydantic, Python 3.
- **Data & ML**: Scikit-Learn (Random Forest Regressor, Gradient Boosting), Pandas, NumPy.
- **Design System**: Sovereign Intelligence GovTech design system (Deep Navy `#0B192C`, Slate `#1E3E62`, Cyan `#0EA5E9`, Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`).

---

## How to Run the Complete Project

### Prerequisites
- Python 3.10+ with virtual environment configured
- Node.js v18+ and npm

### Terminal 1 — Start the FastAPI Backend

```bash
# Activate your Python virtual environment
.venv\Scripts\activate       # On Windows
# source .venv/bin/activate  # On Linux/macOS

# Start Uvicorn development server
uvicorn backend.app.main:app --reload
```

- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Endpoint**: `http://127.0.0.1:8000/health`

---

### Terminal 2 — Start the React + Vite Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite development server
npm run dev
```

- **Frontend URL**: `http://localhost:5173` (or `http://127.0.0.1:5173`)
- Vite automatically proxies API requests (`/api` and `/health`) to `http://127.0.0.1:8000`.

---

## Running Automated Tests & ML Pipeline

### Run Full ML Pipeline
```bash
python scripts/run_pipeline.py
```

### Run Test Suite (38 Tests)
```bash
pytest -v
```

---

## Project Structure

```text
SIH_26246/
├── backend/
│   └── app/
│       ├── main.py                     # FastAPI entry point & CORS
│       ├── api/                        # API route controllers
│       │   ├── dashboard.py            # Summary & location metadata
│       │   ├── demand.py               # Demand records
│       │   ├── supply.py               # Supply records
│       │   ├── forecast.py             # Forecast & evaluation endpoints
│       │   ├── gap.py                  # Gap, shortages, oversupply
│       │   └── alerts.py               # Early-warning alert queries
│       ├── database/                   # Connection & Pydantic schemas
│       └── services/                   # Business logic & data queries
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                    # Root React entry with Router
│       ├── App.jsx                     # Layout, routing & global state
│       ├── components/                 # Reusable GovTech UI widgets
│       │   ├── Navbar.jsx              # Header with refresh & search
│       │   ├── Sidebar.jsx             # Collapsible deep-navy sidebar
│       │   ├── StatCard.jsx            # KPI metric cards
│       │   ├── DemandChart.jsx         # Demand vs supply area chart
│       │   ├── SupplyChart.jsx         # Enrolled vs certified bar chart
│       │   ├── ForecastChart.jsx       # Multi-horizon trajectory cone
│       │   ├── GapChart.jsx            # Horizontal deficit comparison
│       │   ├── IndiaMap.jsx            # Thematic state distribution map
│       │   ├── AlertCard.jsx           # Early warning alert widgets
│       │   ├── FilterBar.jsx           # Cascading geographic filters
│       │   ├── DataTable.jsx           # Sortable, paginated tables
│       │   ├── LoadingState.jsx        # Skeleton loader
│       │   └── ErrorState.jsx          # Offline / error banner
│       ├── pages/                      # 8 core application pages
│       │   ├── Dashboard.jsx
│       │   ├── StateAnalysis.jsx
│       │   ├── DistrictAnalysis.jsx
│       │   ├── TradeAnalysis.jsx
│       │   ├── Forecast.jsx
│       │   ├── SkillGap.jsx
│       │   ├── Alerts.jsx
│       │   └── Methodology.jsx
│       ├── services/
│       │   └── api.js                  # Centralized REST client
│       └── styles/
│           └── index.css               # Tailwind & GovTech styling
├── ml/
│   ├── preprocessing/                  # Cleaning, normalization, features
│   ├── demand_index/                   # Demand Index computation
│   ├── supply_index/                   # Supply Index computation
│   ├── forecasting/                    # Training, evaluation & inference
│   └── gap_engine/                     # Equilibrium & early warnings
├── data/
│   ├── raw/                            # Ingested administrative datasets
│   └── processed/                      # Cleaned CSVs & model artifacts
├── docs/                               # Architecture, API & methodology docs
└── tests/                              # Unit & integration test suite
```

---

## Disclaimer

*This system represents a prototype methodology developed for the Smart India Hackathon (SIH) demonstration. Formulations, indices, and predictions are decision-support prototypes and do not constitute official statistics of the Ministry of Skill Development and Entrepreneurship (MSDE).*
