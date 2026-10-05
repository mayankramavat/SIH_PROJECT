"""
Unit Tests for Machine Learning, Forecasting & Skill Gap Engine (SIH_26246)
---------------------------------------------------------------------------
Tests:
- Demand Index bounded between 0 and 100
- Supply Index bounded between 0 and 100
- Skill Gap calculation (demand - supply)
- Gap percentage calculation & zero division protection
- Shortage, Balanced, and Oversupply status classification
- Min-Max normalization edge cases
- Phase 3: Model training and artifact creation (demand_model.pkl)
- Phase 3: Model predictions are numeric and non-negative
- Phase 3: Forecast contains 3-month, 6-month, and 12-month horizons
- Phase 3: Early warning classification flags (HIGH, MEDIUM, LOW)
- Phase 3: Evaluation metrics generated (MAE, RMSE, R2)
"""

import sys
from pathlib import Path
import pytest
import pandas as pd
import numpy as np
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.preprocessing.normalize_data import min_max_normalize_series
from ml.demand_index.demand_index import compute_demand_index
from ml.supply_index.supply_index import compute_supply_index
from ml.gap_engine.calculate_gap import (
    calculate_skill_gap,
    classify_gap_status,
    assign_warning_level,
    calculate_future_skill_gaps
)
from ml.forecasting.train_model import train_demand_forecaster, prepare_time_series_features
from ml.forecasting.evaluate import evaluate_forecasting_models
from ml.forecasting.predict import predict_demand_horizons, estimate_future_supply

PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
MODELS_DIR = PROJECT_ROOT / "ml" / "models"


# --- Phase 2 Tests ---

def test_demand_index_is_between_0_and_100():
    """Verify Demand Index stays strictly within [0, 100]."""
    test_df = pd.DataFrame({
        "state": ["Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat"],
        "district": ["Pune", "Bengaluru Urban", "Chennai", "Ahmedabad"],
        "sector": ["IT-ITeS", "IT-ITeS", "Automotive", "Automotive"],
        "trade": ["Dev", "Dev", "Technician", "CNC Operator"],
        "nco_code": ["2512.0101", "2512.0101", "7231.0101", "7223.0101"],
        "job_postings": [50, 1500, 400, 0],
        "hiring_growth": [-0.15, 0.35, 0.05, 0.0]
    })
    result = compute_demand_index(test_df)
    assert "demand_index" in result.columns
    assert (result["demand_index"] >= 0.0).all(), "Found demand_index < 0"
    assert (result["demand_index"] <= 100.0).all(), "Found demand_index > 100"


def test_supply_index_is_between_0_and_100():
    """Verify Supply Index stays strictly within [0, 100]."""
    test_df = pd.DataFrame({
        "state": ["Maharashtra", "Karnataka", "Gujarat"],
        "district": ["Pune", "Bengaluru Urban", "Ahmedabad"],
        "sector": ["IT-ITeS", "IT-ITeS", "Automotive"],
        "trade": ["Dev", "Dev", "CNC Operator"],
        "nco_code": ["2512.0101", "2512.0101", "7223.0101"],
        "training_seats": [100, 800, 300],
        "candidates_enrolled": [90, 750, 280],
        "candidates_certified": [80, 650, 250]
    })
    result = compute_supply_index(test_df)
    assert "supply_index" in result.columns
    assert (result["supply_index"] >= 0.0).all(), "Found supply_index < 0"
    assert (result["supply_index"] <= 100.0).all(), "Found supply_index > 100"


def test_gap_calculation_is_correct():
    """Verify absolute skill gap = demand - supply."""
    demand_df = pd.DataFrame({
        "state": ["Maharashtra"],
        "district": ["Pune"],
        "sector": ["IT"],
        "trade": ["Junior Software Developer"],
        "nco_code": ["2512.0101"],
        "job_postings": [850],
        "hiring_growth": [0.18]
    })
    supply_df = pd.DataFrame({
        "state": ["Maharashtra"],
        "district": ["Pune"],
        "sector": ["IT"],
        "trade": ["Junior Software Developer"],
        "nco_code": ["2512.0101"],
        "candidates_certified": [320],
        "training_seats": [400],
        "candidates_enrolled": [380]
    })
    merged = calculate_skill_gap(demand_df, supply_df)
    row = merged.iloc[0]
    assert row["demand"] == 850
    assert row["supply"] == 320
    assert row["gap"] == 530  # 850 - 320 = 530


def test_gap_percentage_is_calculated_correctly():
    """Verify gap_percentage = ((demand - supply) / demand) * 100."""
    demand_df = pd.DataFrame({
        "state": ["Maharashtra"],
        "district": ["Pune"],
        "sector": ["IT"],
        "trade": ["Junior Software Developer"],
        "nco_code": ["2512.0101"],
        "job_postings": [850],
        "hiring_growth": [0.18]
    })
    supply_df = pd.DataFrame({
        "state": ["Maharashtra"],
        "district": ["Pune"],
        "sector": ["IT"],
        "trade": ["Junior Software Developer"],
        "nco_code": ["2512.0101"],
        "candidates_certified": [320],
        "training_seats": [400],
        "candidates_enrolled": [380]
    })
    merged = calculate_skill_gap(demand_df, supply_df)
    expected_pct = round(((850 - 320) / 850) * 100.0, 2)
    assert pytest.approx(merged.iloc[0]["gap_percentage"], 0.01) == expected_pct


def test_zero_demand_does_not_crash():
    """Verify demand = 0 is handled safely without ZeroDivisionError."""
    demand_df = pd.DataFrame({
        "state": ["StateA"],
        "district": ["DistA"],
        "sector": ["SecA"],
        "trade": ["TradeA"],
        "nco_code": ["001"],
        "job_postings": [0],
        "hiring_growth": [0.0]
    })
    supply_df = pd.DataFrame({
        "state": ["StateA"],
        "district": ["DistA"],
        "sector": ["SecA"],
        "trade": ["TradeA"],
        "nco_code": ["001"],
        "candidates_certified": [50],
        "training_seats": [100],
        "candidates_enrolled": [60]
    })
    merged = calculate_skill_gap(demand_df, supply_df)
    row = merged.iloc[0]
    assert row["demand"] == 0
    assert row["supply"] == 50
    assert row["gap"] == -50
    assert row["gap_percentage"] == -100.0
    assert row["gap_status"] == "OVERSUPPLY"


def test_status_classification_works():
    """Verify SHORTAGE, BALANCED, and OVERSUPPLY classifications."""
    assert classify_gap_status(50.0) == "SHORTAGE"
    assert classify_gap_status(15.1) == "SHORTAGE"
    assert classify_gap_status(15.0) == "BALANCED"
    assert classify_gap_status(0.0) == "BALANCED"
    assert classify_gap_status(-15.0) == "BALANCED"
    assert classify_gap_status(-15.1) == "OVERSUPPLY"
    assert classify_gap_status(-75.0) == "OVERSUPPLY"


def test_min_max_normalization_with_equal_min_max():
    """Verify safe division when maximum equals minimum in normalization."""
    flat_series = pd.Series([100, 100, 100])
    res = min_max_normalize_series(flat_series, 0.0, 1.0, default_val=0.0)
    assert (res == 0.0).all()


# --- Phase 3 Machine Learning & Forecasting Tests ---

def test_forecasting_model_can_train_and_save_artifact():
    """Verify model can train and saves ml/models/demand_model.pkl."""
    model, feature_cols, train_data, test_data = train_demand_forecaster(PROCESSED_DIR, MODELS_DIR)
    model_path = MODELS_DIR / "demand_model.pkl"
    assert model_path.exists(), f"Model file not created at {model_path}"
    saved = joblib.load(model_path)
    assert "model" in saved
    assert "feature_cols" in saved
    assert len(saved["feature_cols"]) > 0


def test_model_predictions_are_numeric_and_non_negative():
    """Verify predictions generated by the model are numeric and not negative."""
    f_demand = predict_demand_horizons(PROCESSED_DIR, MODELS_DIR, max_horizon=12)
    assert "predicted_demand" in f_demand.columns
    assert pd.api.types.is_numeric_dtype(f_demand["predicted_demand"])
    assert (f_demand["predicted_demand"] >= 0).all(), "Found negative predicted_demand values"
    assert len(f_demand) > 0


def test_forecast_contains_required_horizons():
    """Verify forecast dataset contains 3-month, 6-month, and 12-month horizons."""
    forecast_path = PROCESSED_DIR / "demand_forecast.csv"
    if not forecast_path.exists():
        predict_demand_horizons(PROCESSED_DIR, MODELS_DIR, max_horizon=12)

    df_forecast = pd.read_csv(forecast_path)
    horizons = set(df_forecast["forecast_horizon"].unique())
    assert 3 in horizons, "Horizon 3 months is missing from demand_forecast.csv"
    assert 6 in horizons, "Horizon 6 months is missing from demand_forecast.csv"
    assert 12 in horizons, "Horizon 12 months is missing from demand_forecast.csv"


def test_evaluation_metrics_are_generated():
    """Verify evaluation outputs valid MAE, RMSE, and R2 numbers."""
    eval_df = evaluate_forecasting_models(PROCESSED_DIR, MODELS_DIR)
    assert (PROCESSED_DIR / "model_evaluation.csv").exists()
    for col in ["model", "MAE", "RMSE", "R2"]:
        assert col in eval_df.columns, f"Missing metric {col} in model_evaluation.csv"
    assert (eval_df["MAE"] >= 0).all(), "MAE must be non-negative"
    assert (eval_df["RMSE"] >= 0).all(), "RMSE must be non-negative"


def test_early_warning_classification_works():
    """Verify early warning levels (HIGH, MEDIUM, LOW, NONE)."""
    assert assign_warning_level(40.0, 300) == "HIGH"
    assert assign_warning_level(25.0, 50) == "MEDIUM"
    assert assign_warning_level(10.0, 20) == "LOW"
    assert assign_warning_level(-20.0, -50) == "NONE"
