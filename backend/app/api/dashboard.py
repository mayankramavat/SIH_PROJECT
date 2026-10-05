"""
Dashboard & Locations API Endpoints (SIH_26246)
-----------------------------------------------
Provides aggregate labor market statistics and geographic/trade metadata.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.database.schemas import (
    DashboardSummaryResponse,
    StateListResponse,
    DistrictListResponse,
    TradeListResponse
)
from backend.app.services.recommendation_service import (
    get_dashboard_summary,
    get_states_list,
    get_districts_list,
    get_trades_list
)

router = APIRouter(tags=["Dashboard & Locations"])


@router.get(
    "/dashboard/summary",
    response_model=DashboardSummaryResponse,
    summary="Get LMIS high-level overview metrics",
    description="Returns aggregate totals for states, districts, sectors, trades, demand, supply, gap, and gap status counts."
)
def read_dashboard_summary():
    """Retrieve aggregate summary counts and gap distributions."""
    try:
        summary = get_dashboard_summary()
        return summary
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate dashboard summary: {str(exc)}"
        )


@router.get(
    "/locations/states",
    response_model=StateListResponse,
    summary="List all unique states",
    description="Returns a list of all distinct Indian states available in the labor market dataset."
)
def read_states():
    """Retrieve distinct states list."""
    states = get_states_list()
    return {"states": states}


@router.get(
    "/locations/districts",
    response_model=DistrictListResponse,
    summary="List districts for a state",
    description="Returns all districts belonging to the specified state, or all districts if no state is specified."
)
def read_districts(
    state: Optional[str] = Query(None, description="Name of the Indian state, e.g. Maharashtra")
):
    """Retrieve distinct districts, optionally filtered by state."""
    districts = get_districts_list(state=state)
    return {
        "state": state,
        "districts": districts
    }


@router.get(
    "/locations/trades",
    response_model=TradeListResponse,
    summary="List unique vocational trades",
    description="Returns distinct vocational and technical trades with optional state, district, or sector filtering."
)
def read_trades(
    state: Optional[str] = Query(None, description="Optional filter by state"),
    district: Optional[str] = Query(None, description="Optional filter by district"),
    sector: Optional[str] = Query(None, description="Optional filter by sector, e.g. IT-ITeS")
):
    """Retrieve distinct trades with optional location/sector filter."""
    trades = get_trades_list(state=state, district=district, sector=sector)
    return {"trades": trades}
