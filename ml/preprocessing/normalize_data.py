"""
Normalization Module for Skill Intelligence Platform (SIH_26246)
-----------------------------------------------------------------
This module implements safe Min-Max normalization utilities to rescale numerical
indicators to a bounded range (default [0, 1] or [0, 100]).

Min-Max Formula:
    normalized_value = (value - minimum) / (maximum - minimum)

Edge Case Protection:
    When maximum == minimum (such as when all values in a column are identical
    or during single-record processing), division by zero is safely prevented
    by returning a default value (0.0).

Outputs:
    Saves `data/processed/normalized_indicators.csv` containing normalized metrics.
"""

from typing import Union
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"


def min_max_normalize_series(
    series: pd.Series,
    target_min: float = 0.0,
    target_max: float = 1.0,
    default_val: float = 0.0
) -> pd.Series:
    """
    Safely normalizes a Pandas Series to [target_min, target_max].

    Parameters:
    -----------
    series : pd.Series
        Numeric series to normalize.
    target_min : float, optional
        Minimum value of desired range (default 0.0).
    target_max : float, optional
        Maximum value of desired range (default 1.0).
    default_val : float, optional
        Value to use when maximum == minimum (default 0.0).

    Returns:
    --------
    pd.Series
        Rescaled series with float values.
    """
    numeric_series = pd.to_numeric(series, errors="coerce").fillna(0.0)
    val_min = numeric_series.min()
    val_max = numeric_series.max()

    # Division by zero protection when all values are identical
    if val_max == val_min:
        return pd.Series(default_val, index=series.index, dtype=float)

    scaled_0_1 = (numeric_series - val_min) / (val_max - val_min)

    if target_min == 0.0 and target_max == 1.0:
        return scaled_0_1.astype(float)

    scaled_target = target_min + (scaled_0_1 * (target_max - target_min))
    return scaled_target.astype(float)


def min_max_normalize_value(
    value: Union[int, float],
    val_min: Union[int, float],
    val_max: Union[int, float],
    default_val: float = 0.0
) -> float:
    """
    Normalizes a single scalar value given global min and max.
    """
    if val_max == val_min:
        return default_val
    normalized = (value - val_min) / (val_max - val_min)
    return float(np.clip(normalized, 0.0, 1.0))


def run_normalize_data(processed_dir: Path = PROCESSED_DATA_DIR) -> pd.DataFrame:
    """
    Loads cleaned demand and supply datasets, computes normalized columns,
    and saves normalized_indicators.csv into data/processed/.
    """
    print("--- Starting Data Normalization ---")
    demand_path = processed_dir / "cleaned_job_postings.csv"
    supply_path = processed_dir / "cleaned_training_data.csv"

    if not demand_path.exists():
        demand_path = processed_dir / "demand_clean.csv"
    if not supply_path.exists():
        supply_path = processed_dir / "supply_clean.csv"

    if not demand_path.exists() or not supply_path.exists():
        raise FileNotFoundError("Cleaned files not found. Run clean_data.py first.")

    demand_df = pd.read_csv(demand_path)
    supply_df = pd.read_csv(supply_path)

    # Merge on keys to build a unified indicator matrix
    merge_keys = ["state", "district", "sector", "trade", "nco_code"]
    combined = pd.merge(
        demand_df[merge_keys + ["job_postings", "hiring_growth"]],
        supply_df[merge_keys + ["training_seats", "candidates_enrolled", "candidates_certified"]],
        on=merge_keys,
        how="inner"
    )

    # Compute normalized indicators [0, 1]
    combined["norm_job_postings"] = min_max_normalize_series(combined["job_postings"], 0.0, 1.0)
    combined["norm_hiring_growth"] = min_max_normalize_series(combined["hiring_growth"], 0.0, 1.0)
    combined["norm_training_seats"] = min_max_normalize_series(combined["training_seats"], 0.0, 1.0)
    combined["norm_enrolled"] = min_max_normalize_series(combined["candidates_enrolled"], 0.0, 1.0)
    combined["norm_certified"] = min_max_normalize_series(combined["candidates_certified"], 0.0, 1.0)

    out_path = processed_dir / "normalized_indicators.csv"
    combined.to_csv(out_path, index=False)
    print(f"  [Normalization] Normalized {len(combined)} records successfully.")
    print(f"  [Normalization] Saved to {out_path.name}")
    print("--- Data Normalization Completed Successfully ---\n")
    return combined


if __name__ == "__main__":
    run_normalize_data()
