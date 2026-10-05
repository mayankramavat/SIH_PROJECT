"""
Skill Gap API Endpoints (SIH_26246)
-----------------------------------
REST endpoints for labor supply-demand mismatch, shortages, and oversupply analysis.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.database.schemas import GapRecord
from backend.app.services.recommendation_service import get_gap_data

router = APIRouter(prefix="/gap", tags=["Skill Gap"])

VALID_GAP_STATUSES = {"SHORTAGE", "BALANCED", "OVERSUPPLY"}


@router.get(
    "",
    response_model=List[GapRecord],
    summary="Get skill gap analysis records",
    description="Retrieve skill gap information including demand, supply, net gap, gap percentage, and gap status."
)
def read_gap(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    sector: Optional[str] = Query(None, description="Filter by sector name"),
    trade: Optional[str] = Query(None, description="Filter by trade name"),
    gap_status: Optional[str] = Query(None, description="Filter by status: SHORTAGE, BALANCED, or OVERSUPPLY")
):
    """Retrieve skill-gap data with optional multi-attribute filters."""
    if gap_status is not None and gap_status.strip().upper() not in VALID_GAP_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid gap_status '{gap_status}'. Allowed values: {', '.join(sorted(VALID_GAP_STATUSES))}."
        )

    try:
        records = get_gap_data(
            state=state,
            district=district,
            sector=sector,
            trade=trade,
            gap_status=gap_status
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving skill gap records: {str(exc)}"
        )


@router.get(
    "/shortages",
    response_model=List[GapRecord],
    summary="Get labor shortage records only",
    description="Filtered endpoint returning occupations where demand exceeds supply (SHORTAGE)."
)
def read_shortages(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    sector: Optional[str] = Query(None, description="Filter by sector name"),
    trade: Optional[str] = Query(None, description="Filter by trade name")
):
    """Retrieve only SHORTAGE skill-gap records."""
    try:
        records = get_gap_data(
            state=state,
            district=district,
            sector=sector,
            trade=trade,
            gap_status="SHORTAGE"
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving shortage records: {str(exc)}"
        )


@router.get(
    "/oversupply",
    response_model=List[GapRecord],
    summary="Get candidate oversupply records only",
    description="Filtered endpoint returning occupations where supply exceeds demand (OVERSUPPLY)."
)
def read_oversupply(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    sector: Optional[str] = Query(None, description="Filter by sector name"),
    trade: Optional[str] = Query(None, description="Filter by trade name")
):
    """Retrieve only OVERSUPPLY skill-gap records."""
    try:
        records = get_gap_data(
            state=state,
            district=district,
            sector=sector,
            trade=trade,
            gap_status="OVERSUPPLY"
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving oversupply records: {str(exc)}"
        )
