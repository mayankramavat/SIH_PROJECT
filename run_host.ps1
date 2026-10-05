# =========================================================================
# National Labour Market Information System (LMIS) - Unified Host
# Ministry of Skill Development & Entrepreneurship (MSDE) - SIH_26246
# =========================================================================

Set-Location -Path $PSScriptRoot

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  National Labour Market Information System (LMIS) - Unified Host" -ForegroundColor White
Write-Host "  Ministry of Skill Development & Entrepreneurship (MSDE) - SIH_26246" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress

Write-Host "  [OK] Local Machine URL : http://localhost:8000" -ForegroundColor Green
if ($ip) {
    Write-Host "  [OK] Local Network URL : http://$($ip):8000 (Open on any phone/PC on your Wi-Fi)" -ForegroundColor Green
}
Write-Host "  [OK] API Docs URL      : http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

& "$PSScriptRoot\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
