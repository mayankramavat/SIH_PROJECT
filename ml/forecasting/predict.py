"""
Multi-Horizon Recursive Demand Forecasting & Future Supply Estimation (SIH_26246)
---------------------------------------------------------------------------------
Generates multi-step forecasts for:
- 3 Months  (short-term operational planning)
- 6 Months  (medium-term batch allocation)
- 12 Months (long-term curriculum and infrastructure expansion)

Recursive Multi-Step Forecasting:
    Month t+1 is predicted from known history [t, t-1, t-2].
    Month t+2 uses the predicted value of t+1 as its lag_1, t as lag_2, etc.
    This continues recursively up to 12 months into the future.
    Non-negative constraints are strictly enforced (predicted_demand >= 0).

Future Supply Estimation:
    Uses current certified candidates as baseline operational supply,
    projecting modest annual capacity expansion (~2.5% p.a.) across future horizons.

Outputs:
- data/processed/demand_forecast.csv
- data/processed/future_supply.csv
"""

import sys
from pathlib import Path
from datetime import datetime
from dateutil.relativedelta import relativedelta
import pandas as pd
import numpy as np
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"


def generate_future_months(start_month_str: str, num_months: int = 12):
    """
    Returns a list of future YYYY-MM strings starting after start_month_str.
    """
    start_dt = datetime.strptime(start_month_str, "%Y-%m")
    future_months = []
    for step in range(1, num_months + 1):
        next_dt = start_dt + relativedelta(months=step)
        future_months.append((step, next_dt.strftime("%Y-%m"), next_dt.month, (next_dt.month - 1) // 3 + 1, next_dt.year))
    return future_months


def predict_demand_horizons(
    processed_dir: Path = PROCESSED_DATA_DIR,
    models_dir: Path = MODELS_DIR,
    max_horizon: int = 12
) -> pd.DataFrame:
    """
    Performs recursive multi-step forecasting for 3, 6, and 12 month horizons.
    """
    print("--- Generating Multi-Horizon Demand Forecasts (3, 6, 12 Months) ---")
    model_path = models_dir / "demand_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(f"Trained model not found at {model_path}. Run train_model.py first.")

    payload = joblib.load(model_path)
    model = payload["model"]
    feature_cols = payload["feature_cols"]

    # Load cleaned historical demand
    data_path = processed_dir / "cleaned_job_postings.csv"
    if not data_path.exists():
        data_path = processed_dir / "demand_clean.csv"

    history_df = pd.read_csv(data_path)
    history_df["month_dt"] = pd.to_datetime(history_df["month"], format="%Y-%m")
    history_df = history_df.sort_values(by=["state", "district", "trade", "month_dt"]).reset_index(drop=True)

    latest_month = history_df["month"].max()
    print(f"  Latest historical observation month: {latest_month}")

    future_schedule = generate_future_months(latest_month, num_months=max_horizon)

    series_keys = ["state", "district", "sector", "trade", "nco_code"]
    unique_series = history_df[series_keys].drop_duplicates()

    all_forecast_records = []

    for _, s_info in unique_series.iterrows():
        # Filter historical records for this specific series
        mask = (
            (history_df["state"] == s_info["state"]) &
            (history_df["district"] == s_info["district"]) &
            (history_df["sector"] == s_info["sector"]) &
            (history_df["trade"] == s_info["trade"]) &
            (history_df["nco_code"] == s_info["nco_code"])
        )
        series_hist = history_df[mask].sort_values("month_dt")

        # Get latest historical demand sequence
        recent_demands = list(series_hist["job_postings"].values[-3:])
        # If less than 3, pad with the latest available value
        while len(recent_demands) < 3:
            recent_demands.insert(0, recent_demands[0] if recent_demands else 50)

        recent_growth = float(series_hist["hiring_growth"].iloc[-1]) if not series_hist.empty else 0.05

        # Recursive Multi-Step Forecasting
        simulated_history = list(recent_demands)

        for step, f_month, m_num, q_num, y_num in future_schedule:
            lag_1 = simulated_history[-1]
            lag_2 = simulated_history[-2]
            lag_3 = simulated_history[-3]
            roll_3 = np.mean(simulated_history[-3:])

            feature_dict = {
                "demand_lag_1": lag_1,
                "demand_lag_2": lag_2,
                "demand_lag_3": lag_3,
                "rolling_mean_3": roll_3,
                "month_num": m_num,
                "quarter": q_num,
                "year": y_num,
                "hiring_growth": recent_growth
            }

            feat_vector = pd.DataFrame([feature_dict])[feature_cols]

            pred_demand = float(model.predict(feat_vector)[0])
            # Strict non-negative demand constraint
            pred_demand = max(0, int(round(pred_demand)))

            # Append to simulated history for next recursive steps
            simulated_history.append(pred_demand)

            # Record prediction
            all_forecast_records.append({
                "state": s_info["state"],
                "district": s_info["district"],
                "sector": s_info["sector"],
                "trade": s_info["trade"],
                "nco_code": s_info["nco_code"],
                "forecast_month": f_month,
                "forecast_horizon": step,
                "predicted_demand": pred_demand
            })

    forecast_df = pd.DataFrame(all_forecast_records)
    out_path = processed_dir / "demand_forecast.csv"
    forecast_df.to_csv(out_path, index=False)

    print(f"  [Demand Forecast] Generated {len(forecast_df)} forecast points across {len(unique_series)} trades up to horizon={max_horizon} months.")
    print(f"  [Saved] Forecast output saved to: {out_path.name}")
    print("--- Demand Forecast Generation Completed ---\n")

    return forecast_df


def estimate_future_supply(
    processed_dir: Path = PROCESSED_DATA_DIR,
    max_horizon: int = 12
) -> pd.DataFrame:
    """
    Creates prototype future supply estimates across forecast horizons.
    Methodology:
        Takes current certified candidates as baseline supply and projects
        modest annual institutional growth (~2.5% p.a. / 0.2% monthly).
    """
    print("--- Estimating Future Skilled Workforce Supply ---")
    supply_path = processed_dir / "cleaned_training_data.csv"
    if not supply_path.exists():
        supply_path = processed_dir / "supply_clean.csv"

    if not supply_path.exists():
        raise FileNotFoundError(f"Cleaned supply data not found in {processed_dir}")

    supply_df = pd.read_csv(supply_path)

    # Get latest month from demand forecast
    demand_f_path = processed_dir / "demand_forecast.csv"
    if not demand_f_path.exists():
        raise FileNotFoundError("Run predict_demand_horizons before future supply estimation.")

    forecast_df = pd.read_csv(demand_f_path)
    distinct_horizons = forecast_df[["forecast_month", "forecast_horizon"]].drop_duplicates().sort_values("forecast_horizon")

    merge_keys = ["state", "district", "sector", "trade", "nco_code"]
    base_supply = supply_df[merge_keys + ["candidates_certified"]].drop_duplicates()

    supply_records = []

    for _, h_row in distinct_horizons.iterrows():
        f_month = h_row["forecast_month"]
        horizon = int(h_row["forecast_horizon"])

        # Projected growth factor (approx 2.5% annual expansion = 0.208% per month)
        growth_factor = 1.0 + (0.025 * (horizon / 12.0))

        for _, s_row in base_supply.iterrows():
            current_cert = s_row["candidates_certified"]
            est_supply = max(0, int(round(current_cert * growth_factor)))

            supply_records.append({
                "state": s_row["state"],
                "district": s_row["district"],
                "sector": s_row["sector"],
                "trade": s_row["trade"],
                "nco_code": s_row["nco_code"],
                "forecast_month": f_month,
                "forecast_horizon": horizon,
                "estimated_supply": est_supply
            })

    future_supply_df = pd.DataFrame(supply_records)
    out_path = processed_dir / "future_supply.csv"
    future_supply_df.to_csv(out_path, index=False)

    print(f"  [Future Supply] Estimated supply for {len(future_supply_df)} points across {len(base_supply)} trades.")
    print(f"  [Saved] Future supply saved to: {out_path.name}")
    print("--- Future Supply Estimation Completed ---\n")

    return future_supply_df


def run_all_predictions(processed_dir: Path = PROCESSED_DATA_DIR, models_dir: Path = MODELS_DIR):
    """
    Generates both demand forecasts and future supply estimates.
    """
    f_demand = predict_demand_horizons(processed_dir, models_dir, max_horizon=12)
    f_supply = estimate_future_supply(processed_dir, max_horizon=12)
    return f_demand, f_supply


if __name__ == "__main__":
    run_all_predictions()
