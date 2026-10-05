@echo off
title National Labour Market Information System (LMIS)
echo =========================================================================
echo   National Labour Market Information System (LMIS) - Unified Host
echo   Ministry of Skill Development & Entrepreneurship (MSDE) - SIH_26246
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Python virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in .venv!
    pause
    exit /b 1
)

echo [2/3] Verifying production frontend build...
if not exist "frontend\dist\index.html" (
    echo [INFO] Building React frontend bundle...
    cd frontend
    call npm run build
    cd ..
)

echo [3/3] Starting Unified Production Server on 0.0.0.0:8000...
echo.
echo =========================================================================
echo   LOCAL ACCESS:   http://localhost:8000
echo   NETWORK (LAN):  Check your IPv4 address below (e.g. http://10.90.138.102:8000)
echo   SWAGGER DOCS:   http://localhost:8000/docs
echo =========================================================================
echo.

call .venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
pause
