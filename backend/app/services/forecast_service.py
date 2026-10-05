"""
Forecast Service (SIH_26246)
----------------------------
Business logic for AI/ML demand forecasting and horizon-based future projections.
"""
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from backend.app.database.connection import get_processed_file_path, load_csv_safely


def get_forecast_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    trade: Optional[str] = None,
    horizon: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve demand forecasts from demand_forecast.csv with optional filtering.
    """
    file_path = get_processed_file_path("demand_forecast.csv")
    df = load_csv_safely(file_path)

    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    if district:
        df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
    if trade:
        df = df[df["trade"].astype(str).str.strip().str.lower() == trade.strip().lower()]
    if horizon is not None:
        df = df[df["forecast_horizon"].astype(int) == int(horizon)]

    columns_needed = [
        "state", "district", "sector", "trade", "nco_code",
        "forecast_month", "forecast_horizon", "predicted_demand"
    ]
    available_cols = [c for c in columns_needed if c in df.columns]
    result_df = df[available_cols].copy()

    records = result_df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            if pd.isna(v):
                r[k] = None
            elif isinstance(v, (np.floating, float)):
                r[k] = round(float(v), 2)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)

    return records


def get_forecast_summary_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    trade: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve forecast summary metrics from forecast_summary.csv.
    """
    file_path = get_processed_file_path("forecast_summary.csv")
    df = load_csv_safely(file_path)

    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    if district:
        df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
    if trade:
        df = df[df["trade"].astype(str).str.strip().str.lower() == trade.strip().lower()]

    columns_needed = [
        "state", "district", "sector", "trade", "nco_code",
        "current_demand", "predicted_demand_3m", "predicted_demand_6m", "predicted_demand_12m",
        "current_supply", "future_gap_3m", "future_gap_6m", "future_gap_12m",
        "current_status", "future_status", "warning_level"
    ]
    available_cols = [c for c in columns_needed if c in df.columns]
    result_df = df[available_cols].copy()

    records = result_df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            if pd.isna(v):
                r[k] = None
            elif isinstance(v, (np.floating, float)):
                r[k] = round(float(v), 2)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)

    return records


def get_model_evaluation_data() -> List[Dict[str, Any]]:
    """
    Retrieve model evaluation metrics from model_evaluation.csv.
    """
    file_path = get_processed_file_path("model_evaluation.csv")
    df = load_csv_safely(file_path)
    records = df.to_dict(orient="records")
    for r in records:
        for k, v in r.items():
            if pd.isna(v):
                r[k] = None
            elif isinstance(v, (np.floating, float)):
                r[k] = round(float(v), 4)
            elif isinstance(v, (np.integer, int)):
                r[k] = int(v)
    return records
