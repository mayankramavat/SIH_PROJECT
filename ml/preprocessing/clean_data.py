"""
Data Cleaning Module for Skill Intelligence Platform (SIH_26246)
---------------------------------------------------------------
This module loads raw CSV datasets, validates schemas, removes duplicates,
handles missing values, standardizes text identifiers, and validates logical
data consistency rules (such as non-negative counts, certified <= enrolled,
placed <= trained, and placement_rate in [0, 100]).

Output files saved to `data/processed/`:
- cleaned_job_postings.csv (and alias demand_clean.csv)
- cleaned_training_data.csv (and alias supply_clean.csv)
- cleaned_placements.csv (and alias placements_clean.csv)
- cleaned_districts.csv (and alias districts_clean.csv)
- cleaned_trades.csv (and alias trades_clean.csv)
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Dynamically locate project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

# State alias dictionary for standardizing variations
STATE_MAPPING = {
    "MH": "Maharashtra",
    "MAHARASHTRA": "Maharashtra",
    "KA": "Karnataka",
    "KARNATAKA": "Karnataka",
    "TN": "Tamil Nadu",
    "TAMIL NADU": "Tamil Nadu",
    "GJ": "Gujarat",
    "GUJARAT": "Gujarat",
    "UP": "Uttar Pradesh",
    "UTTAR PRADESH": "Uttar Pradesh",
}


def standardize_text(value: str) -> str:
    """Cleans whitespace and applies Title Case to text strings."""
    if pd.isna(value):
        return ""
    text = str(value).strip()
    return " ".join(text.split()).title()


def standardize_state(value: str) -> str:
    """Standardizes state names using known abbreviations and formatting."""
    if pd.isna(value):
        return ""
    clean_val = str(value).strip().upper()
    return STATE_MAPPING.get(clean_val, str(value).strip().title())


def standardize_nco(value: str) -> str:
    """Standardizes NCO occupation codes to uniform string representation."""
    if pd.isna(value):
        return ""
    return str(value).strip()


def clean_job_postings(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Cleans raw job postings data representing labor/industry demand.
    Output: cleaned_job_postings.csv (and demand_clean.csv)
    """
    file_path = raw_dir / "job_postings.csv"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing required raw file: {file_path}")

    df = pd.read_csv(file_path)
    initial_count = len(df)

    # 1. Check required columns
    required_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "month", "job_postings", "hiring_growth"
    ]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"job_postings.csv missing required columns: {missing_cols}")

    # 2. Remove duplicate records
    df = df.drop_duplicates()
    dupes_removed = initial_count - len(df)

    # 3. Standardize text columns
    df["state"] = df["state"].apply(standardize_state)
    df["district"] = df["district"].apply(standardize_text)
    df["sector"] = df["sector"].apply(str.strip)
    df["trade"] = df["trade"].apply(standardize_text)
    df["nco_code"] = df["nco_code"].apply(standardize_nco)
    df["month"] = df["month"].astype(str).str.strip()

    # 4. Handle missing values
    df = df.dropna(subset=["state", "district", "trade", "nco_code"])
    df["job_postings"] = pd.to_numeric(df["job_postings"], errors="coerce").fillna(0)
    df["hiring_growth"] = pd.to_numeric(df["hiring_growth"], errors="coerce").fillna(0.0)

    # 5. Non-negative validation: job_postings must be >= 0
    df["job_postings"] = df["job_postings"].apply(lambda x: max(0, int(round(x))))

    # Save outputs
    out_primary = processed_dir / "cleaned_job_postings.csv"
    out_alias = processed_dir / "demand_clean.csv"
    df.to_csv(out_primary, index=False)
    df.to_csv(out_alias, index=False)

    print(f"  [Quality Summary - Job Postings] Loaded: {initial_count}, Dupes removed: {dupes_removed}, Final clean rows: {len(df)}")
    return df


def clean_training_data(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Cleans institutional training supply data.
    Output: cleaned_training_data.csv (and supply_clean.csv)
    """
    file_path = raw_dir / "training_data.csv"
    if not file_path.exists():
        file_path = raw_dir / "training_capacity.csv"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing training data in {raw_dir}")

    df = pd.read_csv(file_path)
    initial_count = len(df)

    required_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "training_seats", "candidates_enrolled", "candidates_certified"
    ]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Training dataset missing required columns: {missing_cols}")

    df = df.drop_duplicates()
    dupes_removed = initial_count - len(df)

    df["state"] = df["state"].apply(standardize_state)
    df["district"] = df["district"].apply(standardize_text)
    df["sector"] = df["sector"].apply(str.strip)
    df["trade"] = df["trade"].apply(standardize_text)
    df["nco_code"] = df["nco_code"].apply(standardize_nco)

    df = df.dropna(subset=["state", "district", "trade", "nco_code"])

    # Numeric conversion and non-negative constraints
    for col in ["training_seats", "candidates_enrolled", "candidates_certified"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
        df[col] = df[col].apply(lambda x: max(0, int(round(x))))

    # Logical validation: certified candidates cannot exceed enrolled candidates
    # If any certified count exceeds enrolled, clip it to enrolled count
    exceeded_count = (df["candidates_certified"] > df["candidates_enrolled"]).sum()
    if exceeded_count > 0:
        df["candidates_certified"] = np.minimum(df["candidates_certified"], df["candidates_enrolled"])

    out_primary = processed_dir / "cleaned_training_data.csv"
    out_alias = processed_dir / "supply_clean.csv"
    df.to_csv(out_primary, index=False)
    df.to_csv(out_alias, index=False)

    print(f"  [Quality Summary - Training Data] Loaded: {initial_count}, Dupes removed: {dupes_removed}, Logical corrections (certified <= enrolled): {exceeded_count}, Final clean rows: {len(df)}")
    return df


def clean_placements(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Cleans employment outcome and placement performance data.
    Output: cleaned_placements.csv (and placements_clean.csv)
    """
    file_path = raw_dir / "placements.csv"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing raw file: {file_path}")

    df = pd.read_csv(file_path)
    initial_count = len(df)

    required_cols = [
        "state", "district", "sector", "trade", "nco_code",
        "candidates_trained", "candidates_placed", "placement_rate"
    ]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"placements.csv missing required columns: {missing_cols}")

    df = df.drop_duplicates()
    dupes_removed = initial_count - len(df)

    df["state"] = df["state"].apply(standardize_state)
    df["district"] = df["district"].apply(standardize_text)
    df["sector"] = df["sector"].apply(str.strip)
    df["trade"] = df["trade"].apply(standardize_text)
    df["nco_code"] = df["nco_code"].apply(standardize_nco)

    df = df.dropna(subset=["state", "district", "trade", "nco_code"])

    df["candidates_trained"] = pd.to_numeric(df["candidates_trained"], errors="coerce").fillna(0).apply(lambda x: max(0, int(round(x))))
    df["candidates_placed"] = pd.to_numeric(df["candidates_placed"], errors="coerce").fillna(0).apply(lambda x: max(0, int(round(x))))

    # Logical validation: placed candidates cannot exceed trained candidates
    df["candidates_placed"] = np.minimum(df["candidates_placed"], df["candidates_trained"])

    # Standardize placement_rate: ensure between 0 and 100
    df["placement_rate"] = pd.to_numeric(df["placement_rate"], errors="coerce").fillna(0.0)
    # If values are in ratio format [0.0, 1.0], convert to percentage [0, 100]
    if (df["placement_rate"] <= 1.0).all() and (df["placement_rate"] > 0).any():
        df["placement_rate"] = (df["placement_rate"] * 100.0).round(2)
    df["placement_rate"] = df["placement_rate"].clip(lower=0.0, upper=100.0)

    out_primary = processed_dir / "cleaned_placements.csv"
    out_alias = processed_dir / "placements_clean.csv"
    df.to_csv(out_primary, index=False)
    df.to_csv(out_alias, index=False)

    print(f"  [Quality Summary - Placements] Loaded: {initial_count}, Dupes removed: {dupes_removed}, Final clean rows: {len(df)}")
    return df


def clean_districts(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Cleans master location dataset.
    Output: cleaned_districts.csv (and districts_clean.csv)
    """
    file_path = raw_dir / "districts.csv"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing raw file: {file_path}")

    df = pd.read_csv(file_path)
    initial_count = len(df)

    required_cols = ["state", "district", "state_code", "district_code"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"districts.csv missing required columns: {missing_cols}")

    df = df.drop_duplicates()
    df["state"] = df["state"].apply(standardize_state)
    df["district"] = df["district"].apply(standardize_text)
    df["state_code"] = df["state_code"].astype(str).str.strip().str.upper()
    df["district_code"] = df["district_code"].astype(str).str.strip().str.upper()

    out_primary = processed_dir / "cleaned_districts.csv"
    out_alias = processed_dir / "districts_clean.csv"
    df.to_csv(out_primary, index=False)
    df.to_csv(out_alias, index=False)

    print(f"  [Quality Summary - Districts] Loaded: {initial_count}, Final clean rows: {len(df)}")
    return df


def clean_trades(raw_dir: Path, processed_dir: Path) -> pd.DataFrame:
    """
    Cleans master trade qualifications dataset.
    Output: cleaned_trades.csv (and trades_clean.csv)
    """
    file_path = raw_dir / "trades.csv"
    if not file_path.exists():
        raise FileNotFoundError(f"Missing raw file: {file_path}")

    df = pd.read_csv(file_path)
    initial_count = len(df)

    required_cols = ["sector", "trade", "nco_code", "nsqf_level"]
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        raise ValueError(f"trades.csv missing required columns: {missing_cols}")

    df = df.drop_duplicates()
    df["sector"] = df["sector"].apply(str.strip)
    df["trade"] = df["trade"].apply(standardize_text)
    df["nco_code"] = df["nco_code"].apply(standardize_nco)
    df["nsqf_level"] = pd.to_numeric(df["nsqf_level"], errors="coerce").fillna(3).astype(int)

    out_primary = processed_dir / "cleaned_trades.csv"
    out_alias = processed_dir / "trades_clean.csv"
    df.to_csv(out_primary, index=False)
    df.to_csv(out_alias, index=False)

    print(f"  [Quality Summary - Trades] Loaded: {initial_count}, Final clean rows: {len(df)}")
    return df


def run_clean_data(raw_dir: Path = RAW_DATA_DIR, processed_dir: Path = PROCESSED_DATA_DIR):
    """
    Executes end-to-end data cleaning and validation for all raw tables.
    """
    processed_dir.mkdir(parents=True, exist_ok=True)
    print("--- Starting Data Cleaning & Validation ---")
    clean_job_postings(raw_dir, processed_dir)
    clean_training_data(raw_dir, processed_dir)
    clean_placements(raw_dir, processed_dir)
    clean_districts(raw_dir, processed_dir)
    clean_trades(raw_dir, processed_dir)
    print("--- Data Cleaning & Validation Completed Successfully ---\n")


if __name__ == "__main__":
    run_clean_data()
