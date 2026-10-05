"""
Alerts & Early Warning API Endpoints (SIH_26246)
-----------------------------------------------
REST endpoints for early warning alerts, high-risk flags, and proactive intervention indicators.
"""
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from backend.app.database.schemas import AlertRecord
from backend.app.services.recommendation_service import get_alerts_data

router = APIRouter(prefix="/alerts", tags=["Alerts"])

VALID_WARNING_LEVELS = {"HIGH", "MEDIUM", "LOW", "NONE"}


@router.get(
    "",
    response_model=List[AlertRecord],
    summary="Get early-warning alerts",
    description="Retrieve proactive early-warning records indicating emerging labor shortages or oversupplies."
)
def read_alerts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    trade: Optional[str] = Query(None, description="Filter by trade name"),
    warning_level: Optional[str] = Query(None, description="Filter by warning level: HIGH, MEDIUM, LOW, or NONE")
):
    """Retrieve early warning alerts with optional severity and location filtering."""
    if warning_level is not None and warning_level.strip().upper() not in VALID_WARNING_LEVELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid warning_level '{warning_level}'. Allowed values: {', '.join(sorted(VALID_WARNING_LEVELS))}."
        )

    try:
        records = get_alerts_data(
            state=state,
            district=district,
            trade=trade,
            warning_level=warning_level
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving alert records: {str(exc)}"
        )


@router.get(
    "/high",
    response_model=List[AlertRecord],
    summary="Get HIGH severity alerts only",
    description="Filtered endpoint returning only critical HIGH warning records requiring priority policy attention."
)
def read_high_alerts(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    trade: Optional[str] = Query(None, description="Filter by trade name")
):
    """Retrieve only HIGH warning level records."""
    try:
        records = get_alerts_data(
            state=state,
            district=district,
            trade=trade,
            warning_level="HIGH"
        )
        return records
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving high alerts: {str(exc)}"
        )
