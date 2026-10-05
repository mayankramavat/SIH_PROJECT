"""
Supply API Endpoints (SIH_26246)
--------------------------------
REST endpoints for candidate supply, training capacity, and supply index metrics.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.database.schemas import SupplyRecord
from backend.app.services.supply_service import get_supply_data

router = APIRouter(prefix="/supply", tags=["Supply"])


@router.get(
    "",
    response_model=List[SupplyRecord],
    summary="Get skill supply records",
    description="Retrieve skill training supply, supply index, certification, placement, and capacity utilization rates."
)
def read_supply(
    state: Optional[str] = Query(None, description="State filter (e.g., Maharashtra)"),
    district: Optional[str] = Query(None, description="District filter (e.g., Pune)"),
    sector: Optional[str] = Query(None, description="Sector filter (e.g., IT-ITeS)"),
    trade: Optional[str] = Query(None, description="Trade name filter (e.g., Junior Software Developer)")
):
    """Retrieve supply records matching query parameters."""
    try:
        records = get_supply_data(
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
            detail=f"Error retrieving supply records: {str(exc)}"
        )
