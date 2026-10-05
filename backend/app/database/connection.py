"""
Database Connection & Data Source Manager (SIH_26246)
-----------------------------------------------------
Handles CSV data loading for the MVP while maintaining architectural
readiness for future PostgreSQL database integration.
"""
import os
from pathlib import Path
from typing import Optional
import pandas as pd
from fastapi import HTTPException, status

# Dynamically locate project root relative to this file:
# backend/app/database/connection.py -> 3 levels up to SIH_26246
PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = PROJECT_ROOT / "data"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
RAW_DATA_DIR = DATA_DIR / "raw"

# Future PostgreSQL configuration placeholder
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lmis.db")


def get_db():
    """
    Placeholder database dependency generator for future SQLAlchemy / PostgreSQL integration.
    Yields None during MVP CSV-backed mode.
    """
    db = None
    try:
        yield db
    finally:
        pass


def get_processed_file_path(filename: str) -> Path:
    """Returns the absolute Path to a processed CSV file."""
    return PROCESSED_DATA_DIR / filename


def get_raw_file_path(filename: str) -> Path:
    """Returns the absolute Path to a raw CSV file."""
    return RAW_DATA_DIR / filename


def load_csv_safely(file_path: Path) -> pd.DataFrame:
    """
    Safely load a CSV file into a pandas DataFrame.
    Raises HTTPException(500) if the file cannot be found or read.
    """
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Required data file missing: {file_path.name}. Please ensure data processing pipeline has run."
        )
    try:
        # Load CSV, converting 'nco_code' to string to preserve formatting
        df = pd.read_csv(file_path, dtype={"nco_code": str})
        return df
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read data file {file_path.name}: {str(exc)}"
        )
