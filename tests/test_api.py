"""
API Integration & Endpoint Verification Tests (SIH_26246)
---------------------------------------------------------
Automated test suite verifying FastAPI REST endpoints, schema responses,
and input parameter validations.
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app

client = TestClient(app)


# -------------------------------------------------------------------------
# System Health & Root Tests
# -------------------------------------------------------------------------
def test_health_endpoint():
    """Verify /health returns HTTP 200 and operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "LMIS backend is running" in data["message"]


def test_docs_and_openapi_availability():
    """Verify OpenAPI specification and Swagger UI are properly mounted."""
    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    openapi_data = openapi_res.json()
    assert "paths" in openapi_data
    assert "/health" in openapi_data["paths"]
    assert "/api/dashboard/summary" in openapi_data["paths"]

    docs_res = client.get("/docs")
    assert docs_res.status_code == 200


# -------------------------------------------------------------------------
# Dashboard Summary Tests
# -------------------------------------------------------------------------
def test_dashboard_summary_endpoint():
    """Verify /api/dashboard/summary returns dynamic calculated metrics."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()

    # Validate essential summary fields
    expected_fields = [
        "total_states", "total_districts", "total_sectors", "total_trades",
        "total_demand", "total_supply", "total_gap",
        "shortage_count", "balanced_count", "oversupply_count"
    ]
    for field in expected_fields:
        assert field in data
        assert isinstance(data[field], int)
        assert data[field] >= 0

    assert data["total_states"] > 0
    assert data["total_districts"] > 0
    assert data["total_demand"] > 0
    assert data["total_supply"] > 0
    assert (data["shortage_count"] + data["balanced_count"] + data["oversupply_count"]) > 0


# -------------------------------------------------------------------------
# Demand API Tests
# -------------------------------------------------------------------------
def test_demand_endpoint_unfiltered():
    """Verify /api/demand returns full list of demand records."""
    response = client.get("/api/demand")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    sample = data[0]
    for field in ["state", "district", "sector", "trade", "demand", "demand_index"]:
        assert field in sample


def test_demand_endpoint_filtered():
    """Verify /api/demand filtering by state and district."""
    response = client.get("/api/demand?state=Maharashtra&district=Pune")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for record in data:
        assert record["state"].lower() == "maharashtra"
        assert record["district"].lower() == "pune"


# -------------------------------------------------------------------------
# Supply API Tests
# -------------------------------------------------------------------------
def test_supply_endpoint_unfiltered():
    """Verify /api/supply returns supply metrics."""
    response = client.get("/api/supply")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    sample = data[0]
    for field in ["state", "district", "sector", "trade", "supply", "supply_index"]:
        assert field in sample


def test_supply_endpoint_filtered():
    """Verify /api/supply filtered by trade."""
    response = client.get("/api/supply?trade=Junior Software Developer")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for record in data:
        assert record["trade"].lower() == "junior software developer"


# -------------------------------------------------------------------------
# Forecast API Tests
# -------------------------------------------------------------------------
def test_forecast_endpoint_valid_horizon():
    """Verify /api/forecast with supported horizons (3, 6, 12)."""
    for horizon in [3, 6, 12]:
        response = client.get(f"/api/forecast?horizon={horizon}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for record in data:
            assert record["forecast_horizon"] == horizon


def test_forecast_endpoint_invalid_horizon():
    """Verify /api/forecast returns HTTP 400 for unsupported horizons."""
    response = client.get("/api/forecast?horizon=5")
    assert response.status_code == 400
    assert "Invalid forecast horizon '5'" in response.json()["detail"]

    response_negative = client.get("/api/forecast?horizon=-1")
    assert response_negative.status_code == 400


def test_forecast_summary_endpoint():
    """Verify /api/forecast/summary returns multi-horizon projection summary."""
    response = client.get("/api/forecast/summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    sample = data[0]
    expected_fields = [
        "current_demand", "predicted_demand_3m", "predicted_demand_6m", "predicted_demand_12m",
        "current_supply", "future_gap_3m", "future_gap_6m", "future_gap_12m",
        "current_status", "future_status", "warning_level"
    ]
    for field in expected_fields:
        assert field in sample


# -------------------------------------------------------------------------
# Skill Gap API Tests
# -------------------------------------------------------------------------
def test_gap_endpoint_unfiltered():
    """Verify /api/gap returns gap records."""
    response = client.get("/api/gap")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    sample = data[0]
    for field in ["demand", "supply", "gap", "gap_percentage", "gap_status"]:
        assert field in sample


def test_gap_shortages_endpoint():
    """Verify /api/gap/shortages returns only SHORTAGE records."""
    response = client.get("/api/gap/shortages")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for record in data:
        assert record["gap_status"] == "SHORTAGE"
        assert record["gap"] > 0


def test_gap_oversupply_endpoint():
    """Verify /api/gap/oversupply returns only OVERSUPPLY records."""
    response = client.get("/api/gap/oversupply")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for record in data:
        assert record["gap_status"] == "OVERSUPPLY"
        assert record["gap"] < 0


def test_gap_invalid_status():
    """Verify /api/gap returns HTTP 400 for invalid gap status."""
    response = client.get("/api/gap?gap_status=UNKNOWN_STATUS")
    assert response.status_code == 400
    assert "Invalid gap_status" in response.json()["detail"]


# -------------------------------------------------------------------------
# Alerts & Early Warning API Tests
# -------------------------------------------------------------------------
def test_alerts_endpoint_unfiltered():
    """Verify /api/alerts returns early-warning records."""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    sample = data[0]
    for field in ["predicted_demand", "estimated_supply", "future_gap", "warning_level"]:
        assert field in sample


def test_alerts_high_endpoint():
    """Verify /api/alerts/high returns only HIGH severity alerts."""
    response = client.get("/api/alerts/high")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for record in data:
        assert record["warning_level"] == "HIGH"


def test_alerts_invalid_warning_level():
    """Verify /api/alerts returns HTTP 400 for invalid warning level."""
    response = client.get("/api/alerts?warning_level=SEVERE")
    assert response.status_code == 400
    assert "Invalid warning_level" in response.json()["detail"]


# -------------------------------------------------------------------------
# Location Metadata Tests
# -------------------------------------------------------------------------
def test_locations_states_endpoint():
    """Verify /api/locations/states returns sorted unique state names."""
    response = client.get("/api/locations/states")
    assert response.status_code == 200
    data = response.json()
    assert "states" in data
    assert isinstance(data["states"], list)
    assert len(data["states"]) > 0
    assert "Maharashtra" in data["states"]


def test_locations_districts_endpoint():
    """Verify /api/locations/districts with state parameter."""
    response = client.get("/api/locations/districts?state=Maharashtra")
    assert response.status_code == 200
    data = response.json()
    assert "districts" in data
    assert len(data["districts"]) > 0
    assert "Pune" in data["districts"]


def test_locations_trades_endpoint():
    """Verify /api/locations/trades returns list of trades."""
    response = client.get("/api/locations/trades")
    assert response.status_code == 200
    data = response.json()
    assert "trades" in data
    assert len(data["trades"]) > 0
