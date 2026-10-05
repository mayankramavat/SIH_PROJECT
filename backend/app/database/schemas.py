"""
Pydantic Schemas (SIH_26246)
----------------------------
Request and response validation models for the LMIS REST API.
"""
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


# -------------------------------------------------------------------------
# Enums for Parameter Validation
# -------------------------------------------------------------------------
class ForecastHorizonEnum(int, Enum):
    HORIZON_3 = 3
    HORIZON_6 = 6
    HORIZON_12 = 12


class GapStatusEnum(str, Enum):
    SHORTAGE = "SHORTAGE"
    BALANCED = "BALANCED"
    OVERSUPPLY = "OVERSUPPLY"


class WarningLevelEnum(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NONE = "NONE"


# -------------------------------------------------------------------------
# Common & Health Schemas
# -------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "ok"})
    message: str = Field(..., json_schema_extra={"example": "LMIS backend is running"})


class MessageResponse(BaseModel):
    detail: str


# -------------------------------------------------------------------------
# Dashboard Schemas
# -------------------------------------------------------------------------
class DashboardSummaryResponse(BaseModel):
    total_states: int
    total_districts: int
    total_sectors: int
    total_trades: int
    total_demand: int
    total_supply: int
    total_gap: int
    shortage_count: int
    balanced_count: int
    oversupply_count: int


# -------------------------------------------------------------------------
# Demand Schemas
# -------------------------------------------------------------------------
class DemandRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    demand: int
    demand_index: Optional[float] = None
    hiring_growth: Optional[float] = None


# -------------------------------------------------------------------------
# Supply Schemas
# -------------------------------------------------------------------------
class SupplyRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    supply: int
    supply_index: Optional[float] = None
    certification_rate: Optional[float] = None
    placement_rate: Optional[float] = None
    training_utilization: Optional[float] = None


# -------------------------------------------------------------------------
# Forecast Schemas
# -------------------------------------------------------------------------
class ForecastRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    forecast_month: str
    forecast_horizon: int
    predicted_demand: int


class ForecastSummaryRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    current_demand: int
    predicted_demand_3m: int
    predicted_demand_6m: int
    predicted_demand_12m: int
    current_supply: int
    future_gap_3m: int
    future_gap_6m: int
    future_gap_12m: int
    current_status: str
    future_status: str
    warning_level: str


# -------------------------------------------------------------------------
# Skill Gap Schemas
# -------------------------------------------------------------------------
class GapRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    demand: int
    supply: int
    gap: int
    gap_percentage: Optional[float] = None
    gap_status: str
    demand_index: Optional[float] = None
    supply_index: Optional[float] = None


# -------------------------------------------------------------------------
# Alert / Early Warning Schemas
# -------------------------------------------------------------------------
class AlertRecord(BaseModel):
    state: str
    district: str
    sector: str
    trade: str
    nco_code: Optional[str] = None
    forecast_month: Optional[str] = None
    forecast_horizon: Optional[int] = None
    predicted_demand: int
    estimated_supply: int
    future_gap: int
    future_gap_percentage: Optional[float] = None
    gap_status: str
    warning_level: str


# -------------------------------------------------------------------------
# Location Metadata Schemas
# -------------------------------------------------------------------------
class StateListResponse(BaseModel):
    states: List[str]


class DistrictListResponse(BaseModel):
    state: Optional[str] = None
    districts: List[str]


class TradeListResponse(BaseModel):
    trades: List[str]
