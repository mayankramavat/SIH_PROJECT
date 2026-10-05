"""
Unit Tests for Data Validation & Preprocessing (SIH_26246)
---------------------------------------------------------
Tests:
- Required raw files exist
- Required columns exist in datasets
- No invalid negative values in demand or supply counts
- Placement rate is valid (0 to 100)
- Certification rate is valid (0 to 100)
- Cleaned datasets are created and populated
"""

from pathlib import Path
import pytest
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
RAW_DIR = PROJECT_ROOT / "data" / "raw"


def test_required_raw_files_exist():
    """Verify that all core raw data files exist in data/raw/."""
    required_files = [
        "job_postings.csv",
        "placements.csv",
        "districts.csv",
        "trades.csv"
    ]
    for filename in required_files:
        path = RAW_DIR / filename
        assert path.exists(), f"Raw file {filename} is missing at {path}"

    # Verify training dataset exists
    train_exists = (RAW_DIR / "training_data.csv").exists() or (RAW_DIR / "training_capacity.csv").exists()
    assert train_exists, "Neither training_data.csv nor training_capacity.csv found in data/raw/"


def test_cleaned_datasets_are_created():
    """Verify that all required cleaned CSV datasets exist in data/processed/."""
    expected_cleaned = [
        "cleaned_job_postings.csv",
        "cleaned_training_data.csv",
        "cleaned_placements.csv",
        "cleaned_districts.csv",
        "cleaned_trades.csv"
    ]
    for filename in expected_cleaned:
        path = PROCESSED_DIR / filename
        assert path.exists(), f"Cleaned file {filename} was not created at {path}"
        df = pd.read_csv(path)
        assert len(df) > 0, f"Cleaned file {filename} is empty"


def test_required_columns_exist():
    """Verify required column schemas exist across all cleaned datasets."""
    # 1. Job Postings
    df_job = pd.read_csv(PROCESSED_DIR / "cleaned_job_postings.csv")
    for col in ["state", "district", "sector", "trade", "nco_code", "month", "job_postings", "hiring_growth"]:
        assert col in df_job.columns, f"Missing '{col}' in cleaned_job_postings.csv"

    # 2. Training Data
    df_train = pd.read_csv(PROCESSED_DIR / "cleaned_training_data.csv")
    for col in ["state", "district", "sector", "trade", "nco_code", "training_seats", "candidates_enrolled", "candidates_certified"]:
        assert col in df_train.columns, f"Missing '{col}' in cleaned_training_data.csv"

    # 3. Placements
    df_place = pd.read_csv(PROCESSED_DIR / "cleaned_placements.csv")
    for col in ["state", "district", "sector", "trade", "nco_code", "candidates_trained", "candidates_placed", "placement_rate"]:
        assert col in df_place.columns, f"Missing '{col}' in cleaned_placements.csv"

    # 4. Districts & Trades
    df_dist = pd.read_csv(PROCESSED_DIR / "cleaned_districts.csv")
    for col in ["state", "district", "state_code", "district_code"]:
        assert col in df_dist.columns, f"Missing '{col}' in cleaned_districts.csv"

    df_trades = pd.read_csv(PROCESSED_DIR / "cleaned_trades.csv")
    for col in ["sector", "trade", "nco_code", "nsqf_level"]:
        assert col in df_trades.columns, f"Missing '{col}' in cleaned_trades.csv"


def test_no_invalid_negative_values():
    """Verify that counts are non-negative across all datasets."""
    df_job = pd.read_csv(PROCESSED_DIR / "cleaned_job_postings.csv")
    assert (df_job["job_postings"] >= 0).all(), "Negative job_postings detected"

    df_train = pd.read_csv(PROCESSED_DIR / "cleaned_training_data.csv")
    assert (df_train["training_seats"] >= 0).all(), "Negative training_seats detected"
    assert (df_train["candidates_enrolled"] >= 0).all(), "Negative candidates_enrolled detected"
    assert (df_train["candidates_certified"] >= 0).all(), "Negative candidates_certified detected"

    df_place = pd.read_csv(PROCESSED_DIR / "cleaned_placements.csv")
    assert (df_place["candidates_trained"] >= 0).all(), "Negative candidates_trained detected"
    assert (df_place["candidates_placed"] >= 0).all(), "Negative candidates_placed detected"


def test_placement_rate_is_valid():
    """Verify placement rate is within the valid [0, 100] range."""
    df_place = pd.read_csv(PROCESSED_DIR / "cleaned_placements.csv")
    assert (df_place["placement_rate"] >= 0.0).all(), "Found placement_rate < 0"
    assert (df_place["placement_rate"] <= 100.0).all(), "Found placement_rate > 100"


def test_certification_rate_is_valid():
    """Verify certification rate in merged/engineered data is valid [0, 100]."""
    merged_path = PROCESSED_DIR / "merged_lmis_data.csv"
    if not merged_path.exists():
        pytest.skip("Run pipeline first to generate merged_lmis_data.csv")
    df_merged = pd.read_csv(merged_path)
    assert "certification_rate" in df_merged.columns
    assert (df_merged["certification_rate"] >= 0.0).all(), "Found certification_rate < 0"
    assert (df_merged["certification_rate"] <= 100.0).all(), "Found certification_rate > 100"
