"""
Model Evaluation Engine (SIH_26246)
-----------------------------------
This module evaluates the trained forecasting model against a naive Baseline
model (previous month's demand) on a holdout chronological test dataset.

Metrics Evaluated:
- MAE  (Mean Absolute Error): Average magnitude of forecast error (easiest to explain to stakeholders).
- RMSE (Root Mean Squared Error): Penalizes larger prediction deviations.
- R²   (Coefficient of Determination): Proportion of variance explained by the model.

Output:
- data/processed/model_evaluation.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"

try:
    from ml.forecasting.train_model import prepare_time_series_features, train_demand_forecaster
except ModuleNotFoundError:
    sys.path.append(str(PROJECT_ROOT))
    from ml.forecasting.train_model import prepare_time_series_features, train_demand_forecaster


def evaluate_forecasting_models(processed_dir: Path = PROCESSED_DATA_DIR, models_dir: Path = MODELS_DIR):
    """
    Evaluates both Baseline and ML models on the chronological holdout test set.
    """
    print("--- Evaluating Forecasting Models (Baseline vs ML) ---")
    model_path = models_dir / "demand_model.pkl"

    if not model_path.exists():
        print("  Model artifact not found. Triggering training first...")
        train_demand_forecaster(processed_dir, models_dir)

    saved_payload = joblib.load(model_path)
    model = saved_payload["model"]
    feature_cols = saved_payload["feature_cols"]
    test_months = saved_payload["test_months"]

    # Load cleaned data
    data_path = processed_dir / "cleaned_job_postings.csv"
    if not data_path.exists():
        data_path = processed_dir / "demand_clean.csv"

    raw_df = pd.read_csv(data_path)
    featured_df = prepare_time_series_features(raw_df)

    test_data = featured_df[featured_df["month"].isin(test_months)].copy()

    if len(test_data) == 0:
        raise ValueError("Holdout test set is empty. Check time-based splitting logic.")

    y_true = test_data["job_postings"].values
    X_test = test_data[feature_cols]

    # 1. Baseline Model Forecast: Previous month's demand (demand_lag_1)
    y_pred_baseline = test_data["demand_lag_1"].values

    # 2. Machine Learning Model Forecast: Random Forest
    y_pred_ml = model.predict(X_test)
    # Non-negative constraint
    y_pred_ml = np.clip(y_pred_ml, 0, None)

    # Compute Metrics - Baseline
    mae_base = mean_absolute_error(y_true, y_pred_baseline)
    rmse_base = np.sqrt(mean_squared_error(y_true, y_pred_baseline))
    r2_base = r2_score(y_true, y_pred_baseline)

    # Compute Metrics - ML Model
    mae_ml = mean_absolute_error(y_true, y_pred_ml)
    rmse_ml = np.sqrt(mean_squared_error(y_true, y_pred_ml))
    r2_ml = r2_score(y_true, y_pred_ml)

    period_str = f"{test_months[0]} to {test_months[-1]}"

    results = [
        {
            "model": "Baseline (Previous Month)",
            "MAE": round(mae_base, 2),
            "RMSE": round(rmse_base, 2),
            "R2": round(r2_base, 4),
            "test_samples": len(y_true),
            "test_period": period_str
        },
        {
            "model": "Random Forest Regressor (ML)",
            "MAE": round(mae_ml, 2),
            "RMSE": round(rmse_ml, 2),
            "R2": round(r2_ml, 4),
            "test_samples": len(y_true),
            "test_period": period_str
        }
    ]

    eval_df = pd.DataFrame(results)
    out_path = processed_dir / "model_evaluation.csv"
    eval_df.to_csv(out_path, index=False)

    print(f"  [Evaluation Results on Test Period: {period_str} ({len(y_true)} samples)]")
    print(f"    - Baseline Model : MAE = {mae_base:.2f}, RMSE = {rmse_base:.2f}, R2 = {r2_base:.4f}")
    print(f"    - ML Model (RF)  : MAE = {mae_ml:.2f}, RMSE = {rmse_ml:.2f}, R2 = {r2_ml:.4f}")

    improvement = ((mae_base - mae_ml) / mae_base) * 100.0 if mae_base > 0 else 0.0
    print(f"    - MAE Accuracy Improvement: {improvement:+.1f}% over simple baseline.")
    print(f"  [Saved] Evaluation metrics saved to: {out_path.name}")
    print("--- Model Evaluation Completed Successfully ---\n")

    return eval_df


if __name__ == "__main__":
    evaluate_forecasting_models()
