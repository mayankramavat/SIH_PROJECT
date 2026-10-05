"""
Supply Index Calculation Engine (SIH_26246)
-------------------------------------------
Prototype Methodology Notice:
The weights and formulas implemented herein represent an academic prototype
heuristic designed for demonstration within the SIH LMIS architecture.
They are NOT official Ministry of Skill Development & Entrepreneurship (MSDE) formulas.

Methodology:
1. Normalize Candidates Certified (actual skilled output)            -> Weight: 50% (0.50)
2. Normalize Training Capacity/Utilization (seats / capacity signal)  -> Weight: 20% (0.20)
3. Normalize Placement Performance (placement rate / outcomes)       -> Weight: 30% (0.30)
4. Combine weighted components:
   Raw Score = (0.50 * NormCertified) + (0.20 * NormCapacity) + (0.30 * NormPlacement)
5. Scale to 0-100:
   Supply Index = Raw Score * 100
   (Bounded strictly between 0 and 100)
"""

from pathlib import Path
import pandas as pd
import numpy as np

try:
    from ml.preprocessing.normalize_data import min_max_normalize_series
except ModuleNotFoundError:
    import sys
    sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
    from ml.preprocessing.normalize_data import min_max_normalize_series

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

# Documented Prototype Weights
WEIGHT_CERTIFIED = 0.50
WEIGHT_CAPACITY = 0.20
WEIGHT_PLACEMENT = 0.30


def compute_supply_index(supply_df: pd.DataFrame, placements_df: pd.DataFrame = None) -> pd.DataFrame:
    """
    Computes a standardized Supply Index (0-100) per trade and district.

    Parameters:
    -----------
    supply_df : pd.DataFrame
        Cleaned supply dataset containing training_seats, candidates_enrolled, candidates_certified.
    placements_df : pd.DataFrame, optional
        Cleaned placements dataset containing placement_rate.

    Returns:
    --------
    pd.DataFrame
        Dataset containing:
        state, district, sector, trade, nco_code, training_seats, candidates_certified, supply_index
    """
    df = supply_df.copy()

    # Merge placement rate if placements dataframe provided
    if placements_df is not None and not placements_df.empty:
        merge_keys = ["state", "district", "sector", "trade", "nco_code"]
        placement_subset = placements_df[merge_keys + ["placement_rate"]].drop_duplicates()
        df = pd.merge(df, placement_subset, on=merge_keys, how="left")
        df["placement_rate"] = df["placement_rate"].fillna(70.0)
    elif "placement_rate" not in df.columns:
        df["placement_rate"] = 70.0

    # Step 1: Normalize input features to [0, 1]
    norm_certified = min_max_normalize_series(df["candidates_certified"], 0.0, 1.0)
    norm_capacity = min_max_normalize_series(df["training_seats"], 0.0, 1.0)
    norm_placement = min_max_normalize_series(df["placement_rate"], 0.0, 1.0)

    # Step 2: Calculate composite weighted score
    raw_supply_score = (
        (WEIGHT_CERTIFIED * norm_certified) +
        (WEIGHT_CAPACITY * norm_capacity) +
        (WEIGHT_PLACEMENT * norm_placement)
    )

    # Step 3: Scale to [0, 100] and ensure bounds
    df["supply_index"] = (raw_supply_score * 100.0).clip(0.0, 100.0).round(2)

    required_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "training_seats", "candidates_certified", "supply_index"
    ]
    output_cols = [c for c in required_cols if c in df.columns]
    return df[output_cols]


def run_supply_index(processed_dir: Path = PROCESSED_DATA_DIR) -> pd.DataFrame:
    """
    Executes supply index calculation and saves to processed directory.
    """
    print("--- Calculating Prototype Supply Index ---")
    input_path = processed_dir / "cleaned_training_data.csv"
    if not input_path.exists():
        input_path = processed_dir / "supply_clean.csv"

    placements_path = processed_dir / "cleaned_placements.csv"
    if not placements_path.exists():
        placements_path = processed_dir / "placements_clean.csv"

    if not input_path.exists():
        raise FileNotFoundError(f"Cleaned supply file not found in {processed_dir}")

    supply_df = pd.read_csv(input_path)
    placements_df = pd.read_csv(placements_path) if placements_path.exists() else None

    result_df = compute_supply_index(supply_df, placements_df)

    output_path = processed_dir / "supply_index.csv"
    result_df.to_csv(output_path, index=False)
    print(
        f"  [Supply Index] Calculated for {len(result_df)} records "
        f"(Weights: Certified={WEIGHT_CERTIFIED*100}%, Capacity={WEIGHT_CAPACITY*100}%, Placements={WEIGHT_PLACEMENT*100}%)."
    )
    print(f"  [Supply Index] Saved to {output_path.name}")
    print("--- Supply Index Completed Successfully ---\n")
    return result_df


if __name__ == "__main__":
    run_supply_index()
