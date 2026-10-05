"""
End-to-End Skill Intelligence & Demand Forecasting Pipeline (SIH_26246)
------------------------------------------------------------------------
Orchestrates the complete Phase 2 and Phase 3 processing workflows:
Phase 1: Raw Data Ingestion & Schema Verification
Phase 2: Data Cleaning -> Normalization -> Feature Engineering -> Demand Index -> Supply Index -> Current Skill Gap
Phase 3: Time-Series Features -> Train/Test Split -> Baseline vs ML Training & Evaluation ->
         Multi-Horizon Forecasts (3, 6, 12 Months) -> Future Supply Estimation -> Future Gaps -> Early Warning Alerts

Usage:
    python scripts/run_pipeline.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd

# Phase 2 imports
from ml.preprocessing.clean_data import run_clean_data
from ml.preprocessing.normalize_data import run_normalize_data
from ml.preprocessing.feature_engineering import run_feature_engineering
from ml.demand_index.demand_index import run_demand_index
from ml.supply_index.supply_index import run_supply_index
from ml.gap_engine.calculate_gap import run_calculate_gap

# Phase 3 imports
from ml.forecasting.train_model import train_demand_forecaster
from ml.forecasting.evaluate import evaluate_forecasting_models
from ml.forecasting.predict import run_all_predictions


def run_full_pipeline():
    """
    Executes the complete end-to-end data processing and ML forecasting pipeline.
    """
    print("=" * 75)
    print("  SKILL INTELLIGENCE PLATFORM (SIH_26246) - FULL PIPELINE (PHASES 2 & 3)")
    print("=" * 75)

    raw_dir = PROJECT_ROOT / "data" / "raw"
    processed_dir = PROJECT_ROOT / "data" / "processed"
    models_dir = PROJECT_ROOT / "ml" / "models"

    # [1/10] Loading raw data...
    print("\n[1/10] Loading raw data...")
    raw_files = [
        ("job_postings.csv", "Industry demand postings (time series)"),
        ("training_data.csv", "Training capacity and certified cohorts"),
        ("placements.csv", "Candidate placement outcomes"),
        ("districts.csv", "District master records"),
        ("trades.csv", "Trade qualifications and NCO codes")
    ]
    total_raw_rows = 0
    for rf, desc in raw_files:
        p = raw_dir / rf
        if not p.exists() and rf == "training_data.csv":
            p = raw_dir / "training_capacity.csv"
        if not p.exists():
            raise FileNotFoundError(f"Missing required raw dataset: {p}")
        df_temp = pd.read_csv(p)
        total_raw_rows += len(df_temp)
        print(f"  [OK] Found {rf:<20} ({len(df_temp):>3} rows) - {desc}")

    # [2/10] Cleaning data...
    print("\n[2/10] Cleaning data...")
    run_clean_data(raw_dir=raw_dir, processed_dir=processed_dir)
    print("  [OK] Raw data cleaned, schema verified, logical constraints enforced.")

    # [3/10] Normalizing data...
    print("\n[3/10] Normalizing data...")
    norm_df = run_normalize_data(processed_dir=processed_dir)
    print(f"  [OK] Min-Max normalization computed for {len(norm_df)} indicator records.")

    # [4/10] Creating features...
    print("\n[4/10] Creating features...")
    feat_df = run_feature_engineering(processed_dir=processed_dir)
    print("  [OK] Domain features computed: certification_rate, training_utilization, trade_demand_share.")

    # [5/10] Calculating Demand Index...
    print("\n[5/10] Calculating Demand Index...")
    d_idx_df = run_demand_index(processed_dir=processed_dir)
    print(f"  [OK] Demand Index generated (Mean: {d_idx_df['demand_index'].mean():.2f}).")

    # [6/10] Calculating Supply Index...
    print("\n[6/10] Calculating Supply Index...")
    s_idx_df = run_supply_index(processed_dir=processed_dir)
    print(f"  [OK] Supply Index generated (Mean: {s_idx_df['supply_index'].mean():.2f}).")

    # [7/10] Training AI/ML Demand Forecaster...
    print("\n[7/10] Training AI/ML Demand Forecaster...")
    model, feature_cols, train_data, test_data = train_demand_forecaster(processed_dir, models_dir)
    print(f"  [OK] Trained RandomForestRegressor model on {len(train_data)} observations.")

    # [8/10] Evaluating Model against Baseline...
    print("\n[8/10] Evaluating Model against Baseline...")
    eval_df = evaluate_forecasting_models(processed_dir, models_dir)
    print(f"  [OK] Model evaluation completed. Saved to model_evaluation.csv")

    # [9/10] Generating Multi-Horizon Forecasts (3, 6, 12 Months) & Future Supply...
    print("\n[9/10] Generating Multi-Horizon Forecasts (3, 6, 12 Months) & Future Supply...")
    f_demand, f_supply = run_all_predictions(processed_dir, models_dir)
    print(f"  [OK] Generated {len(f_demand)} demand forecasts and {len(f_supply)} future supply projections.")

    # [10/10] Calculating Current & Future Skill Gaps + Early Warning Flags...
    print("\n[10/10] Calculating Skill Gaps & Early Warning Flags...")
    gap_df = run_calculate_gap(processed_dir=processed_dir)
    print("  [OK] Skill gaps, future gaps, early warning flags, and forecast summaries generated.")

    # Final Summary Reporting
    num_shortage = (gap_df["gap_status"] == "SHORTAGE").sum()
    num_balanced = (gap_df["gap_status"] == "BALANCED").sum()
    num_oversupply = (gap_df["gap_status"] == "OVERSUPPLY").sum()
    num_districts = gap_df["district"].nunique()
    num_trades = gap_df["trade"].nunique()

    warnings_path = processed_dir / "early_warning_flags.csv"
    warnings_df = pd.read_csv(warnings_path) if warnings_path.exists() else pd.DataFrame()
    w_counts = warnings_df["warning_level"].value_counts().to_dict() if not warnings_df.empty else {}

    print("\n" + "=" * 75)
    print("PIPELINE COMPLETED SUCCESSFULLY (PHASES 2 & 3)")
    print("=" * 75)
    print(f"Total raw input records across files : {total_raw_rows}")
    print(f"Current snapshot records processed   : {len(gap_df)}")
    print(f"Number of districts                  : {num_districts}")
    print(f"Number of trades                     : {num_trades}")
    print(f"Current Shortage records             : {num_shortage} ({(num_shortage/len(gap_df))*100:.1f}%)")
    print(f"Current Balanced records             : {num_balanced} ({(num_balanced/len(gap_df))*100:.1f}%)")
    print(f"Current Oversupply records           : {num_oversupply} ({(num_oversupply/len(gap_df))*100:.1f}%)")
    print(f"Future Forecast points (1-12m)       : {len(f_demand)}")
    print(f"Early Warning Alerts generated       : {len(warnings_df)} alerts (High: {w_counts.get('HIGH', 0)}, Medium: {w_counts.get('MEDIUM', 0)}, Low: {w_counts.get('LOW', 0)})")
    print(f"Master Output File Location          : {processed_dir / 'merged_lmis_data.csv'}")
    print(f"Forecast Summary Location            : {processed_dir / 'forecast_summary.csv'}")
    print(f"Early Warning Flags Location         : {warnings_path}")
    print("=" * 75 + "\n")

    return gap_df


if __name__ == "__main__":
    run_full_pipeline()
