# =========================================================================
# Deploy National LMIS to Vercel (SIH_26246)
# Ministry of Skill Development & Entrepreneurship (MSDE)
# =========================================================================

Set-Location -Path $PSScriptRoot

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  Deploy National LMIS to Vercel (SIH_26246)" -ForegroundColor White
Write-Host "  Ministry of Skill Development & Entrepreneurship (MSDE)" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Checking Node.js & npx..." -ForegroundColor Gray
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js and npx are required but not found in PATH." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[2/3] Authenticating with Vercel..." -ForegroundColor Cyan
Write-Host "  Opening browser for authentication if not already logged in..." -ForegroundColor Gray
npx vercel login

Write-Host ""
Write-Host "[3/3] Deploying project to Vercel Production..." -ForegroundColor Cyan
npx vercel --prod

Write-Host ""
Write-Host "=========================================================================" -ForegroundColor Green
Write-Host "  Deployment completed! Your live Vercel URL is displayed above." -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Green
