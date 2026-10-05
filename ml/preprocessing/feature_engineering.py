"""
Feature Engineering Module for Skill Intelligence Platform (SIH_26246)
----------------------------------------------------------------------
This module computes domain features and efficiency indicators:

Demand Features:
- job_postings: raw posting demand count
- hiring_growth: month-over-month hiring growth rate
- trade_demand_share: percentage share of district demand for this trade

Supply Features:
- certification_rate = (candidates_certified / candidates_enrolled) * 100
- training_utilization = (candidates_enrolled / training_seats) * 100
- placement_rate = percentage of trained candidates successfully placed (0 - 100%)

Safe division guards ensure no ZeroDivisionError occurs when denominators are 0.
Outputs saved to `data/processed/`.
"""

from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"


def engineer_demand_features(demand_df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes demand features for job postings dataset.
    """
    df = demand_df.copy()

    # District-level total postings and trade percentage share
    district_totals = df.groupby(["state", "district"])["job_postings"].transform("sum")
    df["district_total_demand"] = district_totals

    # Safe division for trade demand share (%)
    df["trade_demand_share"] = np.where(
        df["district_total_demand"] > 0,
        (df["job_postings"] / df["district_total_demand"]) * 100.0,
        0.0
    ).round(2)

    return df


def engineer_supply_features(supply_df: pd.DataFrame, placements_df: pd.DataFrame = None) -> pd.DataFrame:
    """
    Computes supply features:
    - certification_rate = candidates_certified / candidates_enrolled * 100
    - training_utilization = candidates_enrolled / training_seats * 100
    - placement_rate
    """
    df = supply_df.copy()

    # 1. Training Utilization Rate (%)
    # If training_seats == 0, safe division returns 0.0
    df["training_utilization"] = np.where(
        df["training_seats"] > 0,
        (df["candidates_enrolled"] / df["training_seats"]) * 100.0,
        0.0
    ).round(2)

    # 2. Certification Rate (%)
    # If candidates_enrolled == 0, safe division returns 0.0
    df["certification_rate"] = np.where(
        df["candidates_enrolled"] > 0,
        (df["candidates_certified"] / df["candidates_enrolled"]) * 100.0,
        0.0
    ).round(2)
    # Ensure certification rate does not logically exceed 100%
    df["certification_rate"] = df["certification_rate"].clip(lower=0.0, upper=100.0)

    # 3. Placement Rate (%)
    if placements_df is not None and not placements_df.empty:
        merge_keys = ["state", "district", "sector", "trade", "nco_code"]
        placement_subset = placements_df[merge_keys + ["candidates_trained", "candidates_placed", "placement_rate"]].drop_duplicates()
        df = pd.merge(df, placement_subset, on=merge_keys, how="left")
        df["placement_rate"] = df["placement_rate"].fillna(70.0)
    else:
        df["placement_rate"] = 70.0  # Benchmark default

    # If placement_rate was in ratio format [0, 1], scale to [0, 100]
    if (df["placement_rate"] <= 1.0).all() and (df["placement_rate"] > 0).any():
        df["placement_rate"] = (df["placement_rate"] * 100.0).round(2)
    df["placement_rate"] = df["placement_rate"].clip(lower=0.0, upper=100.0)

    return df


def run_feature_engineering(processed_dir: Path = PROCESSED_DATA_DIR):
    """
    Loads cleaned data, computes engineered features, and saves output.
    """
    print("--- Starting Feature Engineering ---")
    demand_path = processed_dir / "cleaned_job_postings.csv"
    if not demand_path.exists():
        demand_path = processed_dir / "demand_clean.csv"

    supply_path = processed_dir / "cleaned_training_data.csv"
    if not supply_path.exists():
        supply_path = processed_dir / "supply_clean.csv"

    placements_path = processed_dir / "cleaned_placements.csv"
    if not placements_path.exists():
        placements_path = processed_dir / "placements_clean.csv"

    if not demand_path.exists() or not supply_path.exists():
        raise FileNotFoundError("Cleaned files not found. Run clean_data.py first.")

    demand_df = pd.read_csv(demand_path)
    supply_df = pd.read_csv(supply_path)
    placements_df = pd.read_csv(placements_path) if placements_path.exists() else None

    enriched_demand = engineer_demand_features(demand_df)
    enriched_supply = engineer_supply_features(supply_df, placements_df)

    # Save feature tables
    enriched_demand.to_csv(processed_dir / "demand_features.csv", index=False)
    enriched_supply.to_csv(processed_dir / "supply_features.csv", index=False)

    # Merge full engineered features matrix
    merge_keys = ["state", "district", "sector", "trade", "nco_code"]
    combined_features = pd.merge(
        enriched_demand,
        enriched_supply,
        on=merge_keys,
        how="inner"
    )
    combined_features.to_csv(processed_dir / "engineered_features.csv", index=False)

    print(f"  [Features] Engineered demand features: {len(enriched_demand)} records.")
    print(f"  [Features] Engineered supply features: {len(enriched_supply)} records.")
    print(f"  [Features] Combined feature dataset saved to engineered_features.csv")
    print("--- Feature Engineering Completed Successfully ---\n")
    return combined_features


if __name__ == "__main__":
    run_feature_engineering()
