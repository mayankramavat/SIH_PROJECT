"""
Recommendation & Analytics Service (SIH_26246)
-----------------------------------------------
Business logic for dashboard summaries, skill-gap categorization,
early-warning alerts, and location metadata.
"""
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from backend.app.database.connection import (
    get_processed_file_path,
    get_raw_file_path,
    load_csv_safely
)


def get_dashboard_summary() -> Dict[str, Any]:
    """
    Calculate dynamic aggregate statistics across the labor market dataset.
    """
    file_path = get_processed_file_path("merged_lmis_data.csv")
    df = load_csv_safely(file_path)

    total_states = int(df["state"].nunique()) if "state" in df.columns else 0
    total_districts = int(df["district"].nunique()) if "district" in df.columns else 0
    total_sectors = int(df["sector"].nunique()) if "sector" in df.columns else 0
    total_trades = int(df["trade"].nunique()) if "trade" in df.columns else 0

    total_demand = int(df["demand"].sum()) if "demand" in df.columns else 0
    total_supply = int(df["supply"].sum()) if "supply" in df.columns else 0
    total_gap = int(df["gap"].sum()) if "gap" in df.columns else 0

    shortage_count = int((df["gap_status"] == "SHORTAGE").sum()) if "gap_status" in df.columns else 0
    balanced_count = int((df["gap_status"] == "BALANCED").sum()) if "gap_status" in df.columns else 0
    oversupply_count = int((df["gap_status"] == "OVERSUPPLY").sum()) if "gap_status" in df.columns else 0

    return {
        "total_states": total_states,
        "total_districts": total_districts,
        "total_sectors": total_sectors,
        "total_trades": total_trades,
        "total_demand": total_demand,
        "total_supply": total_supply,
        "total_gap": total_gap,
        "shortage_count": shortage_count,
        "balanced_count": balanced_count,
        "oversupply_count": oversupply_count
    }


def get_gap_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None,
    gap_status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve skill gap records from merged LMIS data with optional status filtering.
    """
    file_path = get_processed_file_path("merged_lmis_data.csv")
    df = load_csv_safely(file_path)

    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    if district:
        df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
    if sector:
        df = df[df["sector"].astype(str).str.strip().str.lower() == sector.strip().lower()]
    if trade:
        df = df[df["trade"].astype(str).str.strip().str.lower() == trade.strip().lower()]
    if gap_status:
        df = df[df["gap_status"].astype(str).str.strip().str.upper() == gap_status.strip().upper()]

    columns_needed = [
        "state", "district", "sector", "trade", "nco_code",
        "demand", "supply", "gap", "gap_percentage", "gap_status",
        "demand_index", "supply_index"
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


def get_alerts_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    trade: Optional[str] = None,
    warning_level: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve early warning flags and forecast gap alerts.
    """
    file_path = get_processed_file_path("early_warning_flags.csv")
    df = load_csv_safely(file_path)

    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    if district:
        df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
    if trade:
        df = df[df["trade"].astype(str).str.strip().str.lower() == trade.strip().lower()]
    if warning_level:
        df = df[df["warning_level"].astype(str).str.strip().str.upper() == warning_level.strip().upper()]

    columns_needed = [
        "state", "district", "sector", "trade", "nco_code",
        "forecast_month", "forecast_horizon", "predicted_demand",
        "estimated_supply", "future_gap", "future_gap_percentage",
        "gap_status", "warning_level"
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


def get_states_list() -> List[str]:
    """Retrieve unique states present in the dataset."""
    # Try loading from districts master first, fallback to merged data
    try:
        df = load_csv_safely(get_raw_file_path("districts.csv"))
    except Exception:
        df = load_csv_safely(get_processed_file_path("merged_lmis_data.csv"))
    states = sorted(df["state"].dropna().unique().tolist())
    return states


def get_districts_list(state: Optional[str] = None) -> List[str]:
    """Retrieve unique districts, optionally filtered by state."""
    try:
        df = load_csv_safely(get_raw_file_path("districts.csv"))
    except Exception:
        df = load_csv_safely(get_processed_file_path("merged_lmis_data.csv"))

    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    districts = sorted(df["district"].dropna().unique().tolist())
    return districts


def get_trades_list(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None
) -> List[str]:
    """Retrieve unique trades with optional location/sector filters."""
    # Use merged_lmis_data or trades.csv
    try:
        df = load_csv_safely(get_processed_file_path("merged_lmis_data.csv"))
        if state:
            df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
        if district:
            df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
        if sector:
            df = df[df["sector"].astype(str).str.strip().str.lower() == sector.strip().lower()]
        trades = sorted(df["trade"].dropna().unique().tolist())
        return trades
    except Exception:
        df = load_csv_safely(get_raw_file_path("trades.csv"))
        if sector:
            df = df[df["sector"].astype(str).str.strip().str.lower() == sector.strip().lower()]
        return sorted(df["trade"].dropna().unique().tolist())
