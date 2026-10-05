"""
Demand Index Calculation Engine (SIH_26246)
-------------------------------------------
Prototype Methodology Notice:
The weights and formulas implemented herein represent an academic prototype
heuristic designed for demonstration within the SIH LMIS architecture.
They are NOT official Ministry of Skill Development & Entrepreneurship (MSDE) formulas.

Methodology:
1. Normalize Job Postings volume (0 to 1) -> Weight: 60% (0.60)
2. Normalize Hiring Growth rate (0 to 1)   -> Weight: 40% (0.40)
3. Combine weighted components:
   Raw Score = (0.60 * NormPostings) + (0.40 * NormGrowth)
4. Scale to 0-100:
   Demand Index = Raw Score * 100
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
WEIGHT_JOB_POSTINGS = 0.60
WEIGHT_HIRING_GROWTH = 0.40


def compute_demand_index(demand_df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes a standardized Demand Index (0-100) per trade and district.

    Parameters:
    -----------
    demand_df : pd.DataFrame
        Cleaned or feature-engineered demand dataset.

    Returns:
    --------
    pd.DataFrame
        Dataset containing:
        state, district, sector, trade, nco_code, job_postings, hiring_growth, demand_index
    """
    df = demand_df.copy()

    # Step 1: Normalize inputs to [0, 1]
    norm_postings = min_max_normalize_series(df["job_postings"], 0.0, 1.0)
    norm_growth = min_max_normalize_series(df["hiring_growth"], 0.0, 1.0)

    # Step 2: Calculate composite weighted score
    raw_demand_score = (WEIGHT_JOB_POSTINGS * norm_postings) + (WEIGHT_HIRING_GROWTH * norm_growth)

    # Step 3: Scale to [0, 100] and ensure bounds
    df["demand_index"] = (raw_demand_score * 100.0).clip(0.0, 100.0).round(2)

    required_cols = [
        "state", "district", "sector", "trade", "nco_code", "month",
        "job_postings", "hiring_growth", "demand_index"
    ]
    output_cols = [c for c in required_cols if c in df.columns]
    return df[output_cols]


def run_demand_index(processed_dir: Path = PROCESSED_DATA_DIR) -> pd.DataFrame:
    """
    Executes demand index calculation and saves to processed folder.
    """
    print("--- Calculating Prototype Demand Index ---")
    input_path = processed_dir / "cleaned_job_postings.csv"
    if not input_path.exists():
        input_path = processed_dir / "demand_clean.csv"

    if not input_path.exists():
        raise FileNotFoundError(f"Cleaned demand file not found in {processed_dir}")

    demand_df = pd.read_csv(input_path)
    result_df = compute_demand_index(demand_df)

    output_path = processed_dir / "demand_index.csv"
    result_df.to_csv(output_path, index=False)
    print(f"  [Demand Index] Calculated for {len(result_df)} records (Weights: Postings={WEIGHT_JOB_POSTINGS*100}%, Growth={WEIGHT_HIRING_GROWTH*100}%).")
    print(f"  [Demand Index] Saved to {output_path.name}")
    print("--- Demand Index Completed Successfully ---\n")
    return result_df


if __name__ == "__main__":
    run_demand_index()
