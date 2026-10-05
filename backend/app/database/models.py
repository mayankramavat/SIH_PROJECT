"""
Database Models (SIH_26246)
---------------------------
Data model definitions for current in-memory structures and future
SQLAlchemy / ORM database tables when moving to PostgreSQL.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class DemandModel:
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str]
    demand: int
    demand_index: Optional[float]
    hiring_growth: Optional[float]


@dataclass
class SupplyModel:
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str]
    supply: int
    supply_index: Optional[float]
    certification_rate: Optional[float]
    placement_rate: Optional[float]
    training_utilization: Optional[float]


@dataclass
class SkillGapModel:
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str]
    demand: int
    supply: int
    gap: int
    gap_percentage: Optional[float]
    gap_status: str
    demand_index: Optional[float]
    supply_index: Optional[float]


@dataclass
class ForecastModel:
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str]
    forecast_month: str
    forecast_horizon: int
    predicted_demand: int


@dataclass
class EarlyWarningModel:
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str]
    forecast_month: str
    forecast_horizon: int
    predicted_demand: int
    estimated_supply: int
    future_gap: int
    future_gap_percentage: float
    gap_status: str
    warning_level: str
