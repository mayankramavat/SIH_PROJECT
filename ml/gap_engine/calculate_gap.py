"""
Skill Gap Engine & Early Warning System (SIH_26246)
--------------------------------------------------
This module computes:
1. Current Operational Skill Gaps (Demand - Supply for the latest reporting month)
2. Multi-Horizon Future Skill Gaps (for horizons 3, 6, and 12 months)
3. Early Warning Flags (HIGH, MEDIUM, LOW priority shortage alerts)
4. Comprehensive Forecast Summary for the dashboard

Operational Definitions:
- Demand: Active Job Postings count representing industry requirement.
- Supply: Candidates Certified (actual certified talent output entering the labor pool).
- Absolute Gap:
    gap = demand - supply
- Percentage Gap:
    gap_percentage = ((demand - supply) / demand) * 100
  (Zero-demand safely handled: demand==0 and supply>0 -> -100.0%, demand==0 and supply==0 -> 0.0%)

Classification Thresholds:
- SHORTAGE   : gap_percentage > +15.0%
- OVERSUPPLY : gap_percentage < -15.0%
- BALANCED   : -15.0% <= gap_percentage <= +15.0%

Early Warning Levels:
- HIGH   : Future shortage with gap_percentage > 35.0%
- MEDIUM : Future shortage with 15.0% < gap_percentage <= 35.0%
- LOW    : Emerging shortage with 0.0% < gap_percentage <= 15.0%
- NONE   : Balanced or Oversupply
"""

from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

# Configurable prototype classification thresholds
SHORTAGE_THRESHOLD_PCT = 15.0
OVERSUPPLY_THRESHOLD_PCT = -15.0

HIGH_WARNING_THRESHOLD_PCT = 35.0
MEDIUM_WARNING_THRESHOLD_PCT = 15.0


def classify_gap_status(gap_pct: float) -> str:
    """Classifies percentage gap into readable labor market status."""
    if pd.isna(gap_pct):
        return "BALANCED"
    if gap_pct > SHORTAGE_THRESHOLD_PCT:
        return "SHORTAGE"
    elif gap_pct < OVERSUPPLY_THRESHOLD_PCT:
        return "OVERSUPPLY"
    else:
        return "BALANCED"


def assign_warning_level(gap_pct: float, gap_val: int) -> str:
    """
    Assigns early-warning severity flags for future potential shortages.
    """
    if pd.isna(gap_pct) or gap_val <= 0:
        return "NONE"
    if gap_pct > HIGH_WARNING_THRESHOLD_PCT or gap_val >= 250:
        return "HIGH"
    elif gap_pct > MEDIUM_WARNING_THRESHOLD_PCT:
        return "MEDIUM"
    elif gap_pct > 0.0:
        return "LOW"
    else:
        return "NONE"


def compute_gap_percentage_safe(demand: float, supply: float) -> float:
    """
    Safely calculates percentage gap with zero-division handling.
    """
    if demand == 0:
        return -100.0 if supply > 0 else 0.0
    return round(((demand - supply) / demand) * 100.0, 2)


def calculate_skill_gap(
    demand_df: pd.DataFrame,
    supply_df: pd.DataFrame,
    demand_index_df: pd.DataFrame = None,
    supply_index_df: pd.DataFrame = None,
    placements_df: pd.DataFrame = None
) -> pd.DataFrame:
    """
    Merges current demand (latest month snapshot) with supply and indices.
    """
    merge_keys = ["state", "district", "sector", "trade", "nco_code"]

    # 1. Prepare Demand Side (Filter to latest available month for current snapshot)
    dem = demand_df.copy()
    if "month" in dem.columns:
        latest_month = dem["month"].max()
        dem = dem[dem["month"] == latest_month].copy()

    if "job_postings" in dem.columns:
        dem["demand"] = dem["job_postings"]
    elif "demand" not in dem.columns:
        raise KeyError("Demand dataset must contain 'job_postings' or 'demand'")

    # 2. Prepare Supply Side (Operational supply = candidates_certified)
    sup = supply_df.copy()
    if "candidates_certified" in sup.columns:
        sup["supply"] = sup["candidates_certified"]
    elif "supply" not in sup.columns:
        sup["supply"] = sup.get("training_seats", 0)

    # Base merge
    dem_clean_subset = dem[merge_keys + ["demand", "hiring_growth"]].drop_duplicates(subset=merge_keys, keep="last")
    sup_clean_subset = sup[merge_keys + ["supply", "training_seats", "candidates_enrolled"]].drop_duplicates(subset=merge_keys, keep="last")

    merged = pd.merge(
        dem_clean_subset,
        sup_clean_subset,
        on=merge_keys,
        how="inner"
    )

    merged["demand"] = pd.to_numeric(merged["demand"], errors="coerce").fillna(0).astype(int)
    merged["supply"] = pd.to_numeric(merged["supply"], errors="coerce").fillna(0).astype(int)
    merged["hiring_growth"] = pd.to_numeric(merged["hiring_growth"], errors="coerce").fillna(0.0).round(4)
    merged["training_seats"] = pd.to_numeric(merged["training_seats"], errors="coerce").fillna(0).astype(int)
    merged["candidates_enrolled"] = pd.to_numeric(merged["candidates_enrolled"], errors="coerce").fillna(0).astype(int)

    # Compute Feature Indicators
    merged["certification_rate"] = np.where(
        merged["candidates_enrolled"] > 0,
        (merged["supply"] / merged["candidates_enrolled"]) * 100.0,
        0.0
    ).round(2).clip(0.0, 100.0)

    merged["training_utilization"] = np.where(
        merged["training_seats"] > 0,
        (merged["candidates_enrolled"] / merged["training_seats"]) * 100.0,
        0.0
    ).round(2)

    # Placement Rate
    if placements_df is not None and not placements_df.empty:
        placement_subset = placements_df[merge_keys + ["placement_rate"]].drop_duplicates(subset=merge_keys, keep="last")
        merged = pd.merge(merged, placement_subset, on=merge_keys, how="left")
        merged["placement_rate"] = merged["placement_rate"].fillna(70.0)
    else:
        merged["placement_rate"] = 70.0
    if (merged["placement_rate"] <= 1.0).all() and (merged["placement_rate"] > 0).any():
        merged["placement_rate"] = (merged["placement_rate"] * 100.0).round(2)
    merged["placement_rate"] = merged["placement_rate"].round(2).clip(0.0, 100.0)

    # Merge Demand Index (ensure latest month or clean subset)
    if demand_index_df is not None and "demand_index" in demand_index_df.columns:
        d_idx_sub = demand_index_df.copy()
        if "month" in d_idx_sub.columns:
            d_idx_sub = d_idx_sub[d_idx_sub["month"] == d_idx_sub["month"].max()]
        d_idx_sub = d_idx_sub.drop_duplicates(subset=merge_keys, keep="last")
        d_idx_sub = d_idx_sub[merge_keys + ["demand_index"]]
        merged = pd.merge(merged, d_idx_sub, on=merge_keys, how="left")
    if "demand_index" not in merged.columns:
        merged["demand_index"] = 50.0
    merged["demand_index"] = merged["demand_index"].fillna(50.0).round(2)

    # Merge Supply Index
    if supply_index_df is not None and "supply_index" in supply_index_df.columns:
        s_idx_sub = supply_index_df.drop_duplicates(subset=merge_keys, keep="last")
        s_idx_sub = s_idx_sub[merge_keys + ["supply_index"]]
        merged = pd.merge(merged, s_idx_sub, on=merge_keys, how="left")
    if "supply_index" not in merged.columns:
        merged["supply_index"] = 50.0
    merged["supply_index"] = merged["supply_index"].fillna(50.0).round(2)

    # 1. Absolute Gap = demand - supply
    merged["gap"] = merged["demand"] - merged["supply"]

    # 2. Percentage Gap
    merged["gap_percentage"] = merged.apply(
        lambda r: compute_gap_percentage_safe(r["demand"], r["supply"]), axis=1
    )

    # 3. Status Classification
    merged["gap_status"] = merged["gap_percentage"].apply(classify_gap_status)
    merged["status"] = merged["gap_status"]

    final_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "demand", "supply", "demand_index", "supply_index",
        "gap", "gap_percentage", "gap_status", "status",
        "hiring_growth", "certification_rate", "placement_rate", "training_utilization"
    ]
    return merged[final_cols]


def calculate_future_skill_gaps(
    demand_forecast_df: pd.DataFrame,
    future_supply_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Merges future demand predictions with estimated future supply across all horizons.
    Computes future gaps and early warning status tags.
    """
    merge_keys = ["state", "district", "sector", "trade", "nco_code", "forecast_month", "forecast_horizon"]

    merged = pd.merge(
        demand_forecast_df[merge_keys + ["predicted_demand"]],
        future_supply_df[merge_keys + ["estimated_supply"]],
        on=merge_keys,
        how="inner"
    )

    merged["future_gap"] = merged["predicted_demand"] - merged["estimated_supply"]
    merged["future_gap_percentage"] = merged.apply(
        lambda r: compute_gap_percentage_safe(r["predicted_demand"], r["estimated_supply"]), axis=1
    )
    merged["gap_status"] = merged["future_gap_percentage"].apply(classify_gap_status)
    merged["warning_level"] = merged.apply(
        lambda r: assign_warning_level(r["future_gap_percentage"], r["future_gap"]), axis=1
    )

    return merged


def generate_early_warning_flags(future_gaps_df: pd.DataFrame, processed_dir: Path) -> pd.DataFrame:
    """
    Filters future gaps to generate targeted early-warning shortage flags.
    Outputs: data/processed/early_warning_flags.csv
    """
    # Identify records where future shortage is detected
    warnings_df = future_gaps_df[future_gaps_df["warning_level"].isin(["HIGH", "MEDIUM", "LOW"])].copy()
    warnings_df = warnings_df.sort_values(
        by=["forecast_horizon", "warning_level", "future_gap"],
        ascending=[True, True, False]
    ).reset_index(drop=True)

    out_path = processed_dir / "early_warning_flags.csv"
    warnings_df.to_csv(out_path, index=False)
    return warnings_df


def generate_forecast_summary(
    current_gap_df: pd.DataFrame,
    future_gaps_df: pd.DataFrame,
    processed_dir: Path
) -> pd.DataFrame:
    """
    Aggregates current demand/supply with 3m, 6m, and 12m forecasts for the dashboard.
    Outputs: data/processed/forecast_summary.csv
    """
    id_keys = ["state", "district", "sector", "trade", "nco_code"]

    base = current_gap_df[id_keys + ["demand", "supply", "gap_status"]].copy()
    base = base.rename(columns={
        "demand": "current_demand",
        "supply": "current_supply",
        "gap_status": "current_status"
    })

    # Pivot future demand and future gaps for horizons 3, 6, 12
    horizons = [3, 6, 12]
    for h in horizons:
        sub = future_gaps_df[future_gaps_df["forecast_horizon"] == h][id_keys + ["predicted_demand", "future_gap", "gap_status", "warning_level"]].drop_duplicates()
        sub = sub.rename(columns={
            "predicted_demand": f"predicted_demand_{h}m",
            "future_gap": f"future_gap_{h}m",
            "gap_status": f"status_{h}m",
            "warning_level": f"warning_{h}m"
        })
        base = pd.merge(base, sub, on=id_keys, how="left")

    base["future_status"] = base["status_12m"].fillna(base["status_6m"]).fillna(base["current_status"])
    # Highest warning across horizons
    def max_warning(row):
        for w in ["HIGH", "MEDIUM", "LOW"]:
            if row.get("warning_12m") == w or row.get("warning_6m") == w or row.get("warning_3m") == w:
                return w
        return "NONE"

    base["warning_level"] = base.apply(max_warning, axis=1)

    # Clean dashboard columns
    summary_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "current_demand", "predicted_demand_3m", "predicted_demand_6m", "predicted_demand_12m",
        "current_supply", "future_gap_3m", "future_gap_6m", "future_gap_12m",
        "current_status", "future_status", "warning_level"
    ]
    summary_df = base[[c for c in summary_cols if c in base.columns]]

    out_path = processed_dir / "forecast_summary.csv"
    summary_df.to_csv(out_path, index=False)
    return summary_df


def run_calculate_gap(processed_dir: Path = PROCESSED_DATA_DIR) -> pd.DataFrame:
    """
    Executes current gap calculation and future forecasting gap integration.
    """
    print("--- Calculating Demand-Supply Gap Engine & Early Warnings ---")
    demand_path = processed_dir / "cleaned_job_postings.csv"
    if not demand_path.exists():
        demand_path = processed_dir / "demand_clean.csv"

    supply_path = processed_dir / "cleaned_training_data.csv"
    if not supply_path.exists():
        supply_path = processed_dir / "supply_clean.csv"

    placements_path = processed_dir / "cleaned_placements.csv"
    if not placements_path.exists():
        placements_path = processed_dir / "placements_clean.csv"

    demand_idx_path = processed_dir / "demand_index.csv"
    supply_idx_path = processed_dir / "supply_index.csv"

    if not demand_path.exists() or not supply_path.exists():
        raise FileNotFoundError(f"Cleaned datasets not found in {processed_dir}")

    demand_df = pd.read_csv(demand_path)
    supply_df = pd.read_csv(supply_path)
    placements_df = pd.read_csv(placements_path) if placements_path.exists() else None
    demand_idx_df = pd.read_csv(demand_idx_path) if demand_idx_path.exists() else None
    supply_idx_df = pd.read_csv(supply_idx_path) if supply_idx_path.exists() else None

    # 1. Current Skill Gap
    gap_df = calculate_skill_gap(demand_df, supply_df, demand_idx_df, supply_idx_df, placements_df)
    current_out = processed_dir / "merged_lmis_data.csv"
    gap_df.to_csv(current_out, index=False)
    print(f"  [Current Gap] Processed {len(gap_df)} current records saved to {current_out.name}")

    # 2. Future Skill Gap & Early Warnings (if forecast files exist)
    forecast_demand_path = processed_dir / "demand_forecast.csv"
    forecast_supply_path = processed_dir / "future_supply.csv"

    if forecast_demand_path.exists() and forecast_supply_path.exists():
        f_demand_df = pd.read_csv(forecast_demand_path)
        f_supply_df = pd.read_csv(forecast_supply_path)

        future_gaps = calculate_future_skill_gaps(f_demand_df, f_supply_df)
        warnings_df = generate_early_warning_flags(future_gaps, processed_dir)
        summary_df = generate_forecast_summary(gap_df, future_gaps, processed_dir)

        w_counts = warnings_df["warning_level"].value_counts().to_dict()
        print(f"  [Future Gap] Evaluated {len(future_gaps)} future points across horizons 1-12.")
        print(f"  [Early Warning Flags] Generated {len(warnings_df)} flags: {w_counts}")
        print(f"  [Forecast Summary] Generated {len(summary_df)} summary records saved to forecast_summary.csv")

    print("--- Demand-Supply Gap Engine Completed Successfully ---\n")
    return gap_df


if __name__ == "__main__":
    run_calculate_gap()
