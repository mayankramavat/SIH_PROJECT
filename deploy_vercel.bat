@echo off
title Deploy National LMIS to Vercel
echo =========================================================================
echo   Deploy National LMIS to Vercel (SIH_26246)
echo   Ministry of Skill Development & Entrepreneurship (MSDE)
echo =========================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Vercel CLI...
where npx >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npx not found in PATH! Please install Node.js.
    pause
    exit /b 1
)

echo [2/3] Authenticating with Vercel...
echo (If prompted, select your login method in the browser window)
call npx vercel login

echo.
echo [3/3] Deploying project to Vercel Production...
call npx vercel --prod

echo.
echo =========================================================================
echo   Deployment completed! Your live Vercel URL is displayed above.
echo =========================================================================
pause
