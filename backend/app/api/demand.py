"""
Demand API Endpoints (SIH_26246)
--------------------------------
REST endpoints for labor demand records and demand index metrics.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.database.schemas import DemandRecord
from backend.app.services.demand_service import get_demand_data

router = APIRouter(prefix="/demand", tags=["Demand"])


@router.get(
    "",
    response_model=List[DemandRecord],
    summary="Get labor demand records",
    description="Retrieve labor demand statistics and demand index metrics with optional state, district, sector, and trade filters."
)
def read_demand(
    state: Optional[str] = Query(None, description="State filter (e.g., Maharashtra)"),
    district: Optional[str] = Query(None, description="District filter (e.g., Pune)"),
    sector: Optional[str] = Query(None, description="Sector filter (e.g., IT-ITeS)"),
    trade: Optional[str] = Query(None, description="Trade name filter (e.g., Junior Software Developer)")
):
    """Retrieve demand records matching query parameters."""
    try:
        records = get_demand_data(
            state=state,
            district=district,
            sector=sector,
            trade=trade
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving demand records: {str(exc)}"
        )
