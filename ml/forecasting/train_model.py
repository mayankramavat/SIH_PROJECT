"""
AI/ML Demand Forecasting Model Training (SIH_26246)
---------------------------------------------------
This module builds time-series lag and rolling features from historical job postings,
performs a strict chronological time-based train/test split (no future data leakage),
trains a scikit-learn RandomForestRegressor, and saves the serialized model with joblib.

Model Artifact:
- ml/models/demand_model.pkl
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor

# Project path resolution
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"


def prepare_time_series_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs chronological time-series lag and rolling features without look-ahead bias.

    Features created:
    - demand_lag_1: Job postings from previous month (t-1)
    - demand_lag_2: Job postings from 2 months ago (t-2)
    - demand_lag_3: Job postings from 3 months ago (t-3)
    - rolling_mean_3: Moving average demand of last 3 months
    - month_num: Calendar month (1-12)
    - quarter: Calendar quarter (1-4)
    - year: Calendar year
    - hiring_growth: Observed hiring growth rate
    """
    data = df.copy()

    # Ensure chronological order
    data["month_dt"] = pd.to_datetime(data["month"], format="%Y-%m")
    data = data.sort_values(by=["state", "district", "trade", "month_dt"]).reset_index(drop=True)

    group_keys = ["state", "district", "sector", "trade", "nco_code"]

    # 1. Lag Features (strictly historical)
    data["demand_lag_1"] = data.groupby(group_keys)["job_postings"].shift(1)
    data["demand_lag_2"] = data.groupby(group_keys)["job_postings"].shift(2)
    data["demand_lag_3"] = data.groupby(group_keys)["job_postings"].shift(3)

    # 2. Rolling Window Features (closed='left' equivalent: shift(1) then roll to prevent leakage)
    data["rolling_mean_3"] = (
        data.groupby(group_keys)["job_postings"]
        .apply(lambda s: s.shift(1).rolling(window=3, min_periods=1).mean())
        .reset_index(level=list(range(len(group_keys))), drop=True)
    )

    # 3. Calendar & Trend Features
    data["month_num"] = data["month_dt"].dt.month
    data["quarter"] = data["month_dt"].dt.quarter
    data["year"] = data["month_dt"].dt.year
    data["hiring_growth"] = pd.to_numeric(data["hiring_growth"], errors="coerce").fillna(0.0)

    # Drop early records with NaN lags
    featured_df = data.dropna(subset=["demand_lag_1", "demand_lag_2", "demand_lag_3"]).copy()

    return featured_df


def train_demand_forecaster(processed_dir: Path = PROCESSED_DATA_DIR, models_dir: Path = MODELS_DIR):
    """
    Loads historical demand, prepares time-series features, performs chronological
    split, trains RandomForest model, and saves to ml/models/demand_model.pkl.
    """
    print("--- Starting AI/ML Demand Model Training ---")
    data_path = processed_dir / "cleaned_job_postings.csv"
    if not data_path.exists():
        data_path = processed_dir / "demand_clean.csv"

    if not data_path.exists():
        raise FileNotFoundError(f"Cleaned job postings not found at {data_path}. Run Phase 2 first.")

    raw_df = pd.read_csv(data_path)
    total_raw = len(raw_df)
    unique_months = sorted(raw_df["month"].unique())

    print(f"  Historical data: {total_raw} records across {len(unique_months)} months ({unique_months[0]} to {unique_months[-1]}).")

    if len(unique_months) < 4:
        print("  [Warning] Less than 4 historical months available. More observations recommended for production.")

    featured_df = prepare_time_series_features(raw_df)
    print(f"  Constructed lag & rolling features. Usable dataset: {len(featured_df)} observations.")

    # Time-based Train-Test Split (Chronological)
    # Use earlier ~80% months for training, latest ~20% months for testing
    all_months = sorted(featured_df["month"].unique())
    split_idx = max(1, int(len(all_months) * 0.80))
    train_months = all_months[:split_idx]
    test_months = all_months[split_idx:]

    print(f"  Chronological Split: Training on {train_months}, Testing on {test_months}")

    train_data = featured_df[featured_df["month"].isin(train_months)]
    test_data = featured_df[featured_df["month"].isin(test_months)]

    feature_cols = [
        "demand_lag_1", "demand_lag_2", "demand_lag_3",
        "rolling_mean_3", "month_num", "quarter", "year", "hiring_growth"
    ]
    target_col = "job_postings"

    X_train = train_data[feature_cols]
    y_train = train_data[target_col]
    X_test = test_data[feature_cols]
    y_test = test_data[target_col]

    # Train Random Forest Regressor
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        min_samples_split=3,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Save model artifact
    models_dir.mkdir(parents=True, exist_ok=True)
    model_path = models_dir / "demand_model.pkl"
    joblib.dump({
        "model": model,
        "feature_cols": feature_cols,
        "train_months": train_months,
        "test_months": test_months
    }, model_path)

    print(f"  [Model Saved] Trained RandomForest model saved to: {model_path.name}")
    print("--- Model Training Completed Successfully ---\n")

    return model, feature_cols, train_data, test_data


if __name__ == "__main__":
    train_demand_forecaster()
