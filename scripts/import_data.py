"""
Data Import & Verification Utility (SIH_26246)
----------------------------------------------
Utility script to load, inspect, and verify the integrity of all raw datasets
in `data/raw/`.

Usage:
    python scripts/import_data.py
"""

from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"


def verify_and_import():
    """
    Scans data/raw/ and prints summary stats for each dataset.
    """
    print("=" * 60)
    print("  RAW DATASETS IMPORT & INTEGRITY VERIFICATION")
    print("=" * 60)

    if not RAW_DIR.exists():
        raise FileNotFoundError(f"Raw data directory missing at: {RAW_DIR}")

    files = sorted(list(RAW_DIR.glob("*.csv")))
    if not files:
        print(f"No CSV files found in {RAW_DIR}")
        return

    for f in files:
        df = pd.read_csv(f)
        print(f"\nFile: {f.name}")
        print(f"  Rows: {len(df):>4} | Columns: {len(df.columns):>2}")
        print(f"  Schema: {list(df.columns)}")
        null_counts = df.isnull().sum().to_dict()
        has_nulls = {k: v for k, v in null_counts.items() if v > 0}
        if has_nulls:
            print(f"  Missing values: {has_nulls}")
        else:
            print(f"  Missing values: None (Clean)")

    print("\n" + "=" * 60)
    print(f"Verification completed. Total raw tables: {len(files)}")
    print("=" * 60)


if __name__ == "__main__":
    verify_and_import()
