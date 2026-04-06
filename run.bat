@echo off
title Yog-Sothoth's Seminar - Launcher
color 0c

echo ==========================================================
echo        Yog-Sothoth's Seminar (Launcher)
echo ==========================================================
echo.
echo Waking up the Red Dragon Queen...
echo.

echo [1/2] Starting Python Backend Server (Port 8000)...
start "Yog-Sothoth Backend" cmd /k "python main.py"

echo [2/2] Starting React Frontend Server (Port 3000)...
:: If you renamed the frontend directory, change paper2galgame-main below:
start "Yog-Sothoth Frontend" cmd /k "cd paper2galgame-main && npm run dev"

echo.
echo All nodes connected! Please wait a few seconds for local servers to start...
echo.
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo.
echo (This window will close automatically. Do NOT close the two server windows)
timeout /t 5 >nul
