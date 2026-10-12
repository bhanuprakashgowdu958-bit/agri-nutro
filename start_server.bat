@echo off
title NutriAgro Feeds India - Local Dev Server
cd /d "%~dp0"

:: Auto-detect current local Wi-Fi IP
set "LOCAL_IP=192.168.0.104"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "192.168.0."') do (
    set "LOCAL_IP=%%a"
)
set "LOCAL_IP=%LOCAL_IP: =%"

echo ==========================================================
echo   🌾  NutriAgro Feeds (India) Local & Network Web Server
echo   ──────────────────────────────────────────────────────────
echo   💻 Local PC:        http://localhost:8080/
echo   🔒 Admin Hub:       http://localhost:8080/admin.html
echo   📱 Mobile (Wi-Fi):  http://%LOCAL_IP%:8080/
echo   📁 Serving:         %CD%
echo   ──────────────────────────────────────────────────────────
echo.

:: Launch nutri_server.exe
if exist nutri_server.exe (
    nutri_server.exe 8080 "%CD%"
) else (
    server.exe 8080 "%CD%"
)

pause
