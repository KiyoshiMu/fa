# Financial Advisor Dev Environment Startup

Write-Host "Starting Financial Advisor Services..." -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd app/backend; npm run dev" -WindowStyle Normal

# Start Frontend
Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd app/frontend; npm run dev" -WindowStyle Normal

Write-Host "All services are starting in separate windows." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
