"""
Demand Service (SIH_26246)
--------------------------
Business logic for labor demand retrieval and filtering.
"""
from typing import List, Optional, Dict, Any
import numpy as np
import pandas as pd
from backend.app.database.connection import get_processed_file_path, load_csv_safely


def get_demand_data(
    state: Optional[str] = None,
    district: Optional[str] = None,
    sector: Optional[str] = None,
    trade: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve demand records from merged LMIS data with optional filtering.
    """
    file_path = get_processed_file_path("merged_lmis_data.csv")
    df = load_csv_safely(file_path)

    # Apply filters case-insensitively for user-friendly REST querying
    if state:
        df = df[df["state"].astype(str).str.strip().str.lower() == state.strip().lower()]
    if district:
        df = df[df["district"].astype(str).str.strip().str.lower() == district.strip().lower()]
    if sector:
        df = df[df["sector"].astype(str).str.strip().str.lower() == sector.strip().lower()]
    if trade:
        df = df[df["trade"].astype(str).str.strip().str.lower() == trade.strip().lower()]

    columns_needed = [
        "state", "district", "sector", "trade", "nco_code",
        "demand", "demand_index", "hiring_growth"
    ]
    # Filter only available columns
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
