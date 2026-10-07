@echo off
echo ==========================================================
echo   Starting PhishGuard Detection Platform...
echo ==========================================================

if exist frontend (
  cd frontend
)

call npm install
call npm run build
call npm run start
pause
