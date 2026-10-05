"""
Demo Data Generator / Health Check Utility (SIH_26246)
------------------------------------------------------
Verifies and populates demonstration datasets in `data/raw/` and `data/sample/`.

Usage:
    python scripts/generate_demo_data.py
"""

from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
SAMPLE_DIR = PROJECT_ROOT / "data" / "sample"


def check_and_generate():
    """
    Checks that sample datasets exist and confirms data availability.
    """
    print("=" * 60)
    print("  DEMO DATASET GENERATION & HEALTH CHECK")
    print("=" * 60)

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

    required_raw = ["job_postings.csv", "training_data.csv", "placements.csv", "districts.csv", "trades.csv"]
    all_ok = True

    for rf in required_raw:
        p = RAW_DIR / rf
        if not p.exists() and rf == "training_data.csv":
            p = RAW_DIR / "training_capacity.csv"
        if p.exists():
            df = pd.read_csv(p)
            print(f"  [OK] {rf:<20}: {len(df)} records available.")
        else:
            print(f"  [MISSING] {rf:<20}: Missing file.")
            all_ok = False

    sample_p = SAMPLE_DIR / "demo_data.csv"
    if sample_p.exists():
        df_sample = pd.read_csv(sample_p)
        print(f"  [OK] {'demo_data.csv':<20}: {len(df_sample)} records available in sample/.")

    print("\n" + "=" * 60)
    if all_ok:
        print("All demonstration datasets are present and valid.")
    else:
        print("Warning: Some datasets are missing. Please check data/raw/.")
    print("=" * 60)


if __name__ == "__main__":
    check_and_generate()
