# National Labour Market Information System (LMIS) API Documentation

This document describes all REST API endpoints provided by the LMIS backend. The API is built using **FastAPI** and serves labor market demand, skill supply, AI forecasting (3/6/12-month projections), skill-gap analysis, and early-warning alerts for workforce planning.

---

## Base URLs and Interactive Documentation

- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Alternative ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 1. System Health

### `GET /health`

- **Purpose**: Verify that the backend service is running and operational.
- **Parameters**: None
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/health"
  ```
- **Example Response** (HTTP 200):
  ```json
  {
    "status": "ok",
    "message": "LMIS backend is running"
  }
  ```

---

## 2. Dashboard Overview

### `GET /api/dashboard/summary`

- **Purpose**: Returns aggregate statistics across the entire labor market dataset, including total states, districts, sectors, trades, total demand, total supply, net skill gap, and count breakdown by status (`SHORTAGE`, `BALANCED`, `OVERSUPPLY`).
- **Parameters**: None
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/dashboard/summary"
  ```
- **Example Response** (HTTP 200):
  ```json
  {
    "total_states": 5,
    "total_districts": 17,
    "total_sectors": 5,
    "total_trades": 12,
    "total_demand": 18375,
    "total_supply": 11850,
    "total_gap": 6525,
    "shortage_count": 27,
    "balanced_count": 9,
    "oversupply_count": 4
  }
  ```

---

## 3. Location & Trade Metadata

### `GET /api/locations/states`

- **Purpose**: Returns a sorted list of all unique Indian states present in the dataset. Useful for populating frontend dropdown menus.
- **Parameters**: None
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/locations/states"
  ```
- **Example Response** (HTTP 200):
  ```json
  {
    "states": [
      "Gujarat",
      "Karnataka",
      "Maharashtra",
      "Tamil Nadu",
      "Uttar Pradesh"
    ]
  }
  ```

---

### `GET /api/locations/districts`

- **Purpose**: Returns districts belonging to a specific state or all districts if no state is specified.
- **Parameters**:
  - `state` *(optional, string)*: State name to filter districts (e.g., `Maharashtra`).
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/locations/districts?state=Maharashtra"
  ```
- **Example Response** (HTTP 200):
  ```json
  {
    "state": "Maharashtra",
    "districts": [
      "Aurangabad",
      "Mumbai Suburban",
      "Nagpur",
      "Nashik",
      "Pune"
    ]
  }
  ```

---

### `GET /api/locations/trades`

- **Purpose**: Returns unique vocational and technical trades available in the dataset with optional location and sector filters.
- **Parameters**:
  - `state` *(optional, string)*: Filter trades by state name.
  - `district` *(optional, string)*: Filter trades by district name.
  - `sector` *(optional, string)*: Filter trades by industry sector (e.g., `IT-ITeS`).
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/locations/trades?sector=IT-ITeS"
  ```
- **Example Response** (HTTP 200):
  ```json
  {
    "trades": [
      "Data Entry Operator",
      "Junior Software Developer",
      "Web Developer"
    ]
  }
  ```

---

## 4. Labor Demand

### `GET /api/demand`

- **Purpose**: Returns industry labor demand records, including total job postings, normalized demand index (0–100), and hiring growth.
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `sector` *(optional, string)*: Filter by sector.
  - `trade` *(optional, string)*: Filter by trade name.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/demand?state=Maharashtra&district=Pune"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "demand": 850,
      "demand_index": 47.91,
      "hiring_growth": 0.01
    },
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "Automotive",
      "trade": "Automotive Service Technician",
      "nco_code": "7231.0101",
      "demand": 420,
      "demand_index": 44.89,
      "hiring_growth": 0.03
    }
  ]
  ```

---

## 5. Skill Supply & Training Capacity

### `GET /api/supply`

- **Purpose**: Returns skilled workforce supply metrics, including candidates certified, placement rate, certification rate, training capacity utilization, and normalized supply index (0–100).
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `sector` *(optional, string)*: Filter by sector name.
  - `trade` *(optional, string)*: Filter by trade name.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/supply?trade=Junior%20Software%20Developer"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "supply": 320,
      "supply_index": 47.7,
      "certification_rate": 84.21,
      "placement_rate": 84.0,
      "training_utilization": 95.0
    }
  ]
  ```

---

## 6. AI/ML Forecasting

### `GET /api/forecast`

- **Purpose**: Returns month-by-month AI-predicted future demand generated by Random Forest regression models.
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `trade` *(optional, string)*: Filter by trade name.
  - `horizon` *(optional, integer)*: Forecast horizon in months. **Must be 3, 6, or 12**. Any other value returns HTTP 400 Bad Request.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/forecast?state=Maharashtra&district=Pune&horizon=3"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "forecast_month": "2024-06",
      "forecast_horizon": 3,
      "predicted_demand": 899
    }
  ]
  ```
- **Error Example (Invalid Horizon)**:
  ```bash
  curl -X GET "http://localhost:8000/api/forecast?horizon=5"
  ```
  Response (HTTP 400):
  ```json
  {
    "detail": "Invalid forecast horizon '5'. Supported horizons are 3, 6, and 12."
  }
  ```

---

### `GET /api/forecast/summary`

- **Purpose**: Returns a multi-horizon summary for each district-trade pair, comparing current baseline demand and supply against 3-month, 6-month, and 12-month future demand projections and future gap values.
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `trade` *(optional, string)*: Filter by trade name.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/forecast/summary?state=Maharashtra&trade=Junior%20Software%20Developer"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "current_demand": 850,
      "predicted_demand_3m": 899,
      "predicted_demand_6m": 934,
      "predicted_demand_12m": 1054,
      "current_supply": 320,
      "future_gap_3m": 577,
      "future_gap_6m": 610,
      "future_gap_12m": 726,
      "current_status": "SHORTAGE",
      "future_status": "SHORTAGE",
      "warning_level": "HIGH"
    }
  ]
  ```

---

### `GET /api/forecast/evaluation`

- **Purpose**: Returns empirical validation benchmarks comparing baseline models against the machine learning Random Forest regressor, including MAE, RMSE, and $R^2$ scores evaluated over out-of-sample test samples.
- **Parameters**: None
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/forecast/evaluation"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "model": "Baseline (Previous Month)",
      "MAE": 8.16,
      "RMSE": 13.1,
      "R2": 0.9986,
      "test_samples": 80,
      "test_period": "2024-02 to 2024-03"
    },
    {
      "model": "Random Forest Regressor (ML)",
      "MAE": 9.77,
      "RMSE": 18.82,
      "R2": 0.9971,
      "test_samples": 80,
      "test_period": "2024-02 to 2024-03"
    }
  ]
  ```

---

## 7. Skill Gap Analysis

### `GET /api/gap`

- **Purpose**: Returns supply-demand gap records calculated as `gap = demand - supply`. Classifies occupations as `SHORTAGE` (demand > supply), `BALANCED` (demand ≈ supply), or `OVERSUPPLY` (supply > demand).
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `sector` *(optional, string)*: Filter by sector name.
  - `trade` *(optional, string)*: Filter by trade name.
  - `gap_status` *(optional, string)*: Filter by status: `SHORTAGE`, `BALANCED`, or `OVERSUPPLY`. Invalid values return HTTP 400.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/gap?state=Maharashtra"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Pune",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "demand": 850,
      "supply": 320,
      "gap": 530,
      "gap_percentage": 62.35,
      "gap_status": "SHORTAGE",
      "demand_index": 47.91,
      "supply_index": 47.7
    }
  ]
  ```

---

### `GET /api/gap/shortages`

- **Purpose**: Convenience endpoint returning only records where demand exceeds supply (`gap_status == "SHORTAGE"`).
- **Parameters**: `state`, `district`, `sector`, `trade` *(all optional)*.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/gap/shortages"
  ```

---

### `GET /api/gap/oversupply`

- **Purpose**: Convenience endpoint returning only records where available supply exceeds demand (`gap_status == "OVERSUPPLY"`).
- **Parameters**: `state`, `district`, `sector`, `trade` *(all optional)*.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/gap/oversupply"
  ```

---

## 8. Early-Warning Alerts

### `GET /api/alerts`

- **Purpose**: Returns proactive early-warning flags for policymakers, indicating future skill deficit or surplus risks before they become critical.
- **Parameters**:
  - `state` *(optional, string)*: Filter by state name.
  - `district` *(optional, string)*: Filter by district name.
  - `trade` *(optional, string)*: Filter by trade name.
  - `warning_level` *(optional, string)*: Filter by severity: `HIGH`, `MEDIUM`, `LOW`, or `NONE`. Invalid values return HTTP 400.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/alerts?state=Maharashtra"
  ```
- **Example Response** (HTTP 200):
  ```json
  [
    {
      "state": "Maharashtra",
      "district": "Mumbai Suburban",
      "sector": "IT-ITeS",
      "trade": "Junior Software Developer",
      "nco_code": "2512.0101",
      "forecast_month": "2024-04",
      "forecast_horizon": 1,
      "predicted_demand": 1171,
      "estimated_supply": 491,
      "future_gap": 680,
      "future_gap_percentage": 58.07,
      "gap_status": "SHORTAGE",
      "warning_level": "HIGH"
    }
  ]
  ```

---

### `GET /api/alerts/high`

- **Purpose**: Returns only `HIGH` severity alerts requiring immediate intervention or training capacity reallocation.
- **Parameters**: `state`, `district`, `trade` *(all optional)*.
- **Example Request**:
  ```bash
  curl -X GET "http://localhost:8000/api/alerts/high"
  ```

---

## 9. Error Handling Standards

All endpoints adhere to clean HTTP status codes:
- **HTTP 200 OK**: Request succeeded. Empty lists `[]` are returned if filters match 0 rows.
- **HTTP 400 Bad Request**: Invalid query parameter value (e.g. invalid `horizon`, `gap_status`, or `warning_level`).
- **HTTP 500 Internal Server Error**: Missing data file or unexpected processing error, returned with a descriptive message rather than a raw Python traceback.

---

## 10. How to Run the Complete Project

### Terminal 1 — Backend (FastAPI + Uvicorn)
```bash
uvicorn backend.app.main:app --reload
```
- **Backend API & Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

### Terminal 2 — Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
- **Frontend URL shown by Vite**: `http://localhost:5173` (or `http://127.0.0.1:5173`)
- Proxies `/api` and `/health` requests directly to `http://127.0.0.1:8000`.
