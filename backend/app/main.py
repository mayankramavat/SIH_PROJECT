"""
FastAPI Main Application (SIH_26246)
------------------------------------
Labor Market Information System (LMIS) Backend API.
Provides REST endpoints for demand, supply, forecasting, skill gaps, and early-warning alerts.
"""
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.schemas import HealthResponse
from backend.app.api import (
    dashboard,
    demand,
    supply,
    forecast,
    gap,
    alerts
)

# -------------------------------------------------------------------------
# FastAPI App Initialization
# -------------------------------------------------------------------------
app = FastAPI(
    title="National Labour Market Information System (LMIS) API",
    description=(
        "REST API serving AI/ML labor demand forecasting, skill supply analysis, "
        "district-trade gap detection, and early-warning alerts for workforce planning."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# -------------------------------------------------------------------------
# CORS Configuration (Vite & Local Development)
# -------------------------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# -------------------------------------------------------------------------
# Health Check Endpoint
# -------------------------------------------------------------------------
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Backend Health Check",
    description="Returns the operational status and heartbeat message of the LMIS API server."
)
def get_health():
    """Service health verification endpoint."""
    return {
        "status": "ok",
        "message": "LMIS backend is running"
    }


# -------------------------------------------------------------------------
# Include API Routers under /api
# -------------------------------------------------------------------------
app.include_router(dashboard.router, prefix="/api")
app.include_router(demand.router, prefix="/api")
app.include_router(supply.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(gap.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

# -------------------------------------------------------------------------
# Static Frontend Files & Single-Page Application (SPA) Serving
# -------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"

if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Do not catch API or documentation routes
        if full_path.startswith("api/") or full_path in {"docs", "redoc", "openapi.json", "health"}:
            raise HTTPException(status_code=404, detail="Resource not found")

        # If a specific static file was requested (e.g. favicon, robots.txt)
        requested_file = FRONTEND_DIST / full_path
        if full_path and requested_file.is_file():
            return FileResponse(str(requested_file))

        # Default fallback: return index.html for client-side routing
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

