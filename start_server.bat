@echo off
title NutriAgro Feeds India - Local Dev Server
cd /d "%~dp0"

echo ==========================================================
echo   🌾  NutriAgro Feeds (India) Local & Network Web Server
echo   ──────────────────────────────────────────────────────────
echo   💻 Local PC:        http://localhost:8080/
echo   📱 Mobile (Wi-Fi):  http://192.168.0.122:8080/
echo   📁 Serving:         %CD%
echo   ──────────────────────────────────────────────────────────
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js detected. Starting server with Gemini AI Proxy...
    echo.
    node dev.js
) else (
    echo [WARNING] Node.js not found in PATH.
    echo Falling back to standalone nutri_server.exe...
    echo.
    if exist nutri_server.exe (
        nutri_server.exe 8080 "%CD%"
    ) else (
        server.exe 8080 "%CD%"
    )
)

pause
