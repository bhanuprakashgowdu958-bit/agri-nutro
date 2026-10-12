@echo off
title NutriAgro Feeds - Share Links
cd /d "%~dp0"

:: Auto-detect current local Wi-Fi IP
set "LOCAL_IP=192.168.0.104"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "192.168.0."') do (
    set "TMP_IP=%%a"
    set "TMP_IP=!TMP_IP: =!"
    if not "%%a"=="" set "LOCAL_IP=%%a"
)
set "LOCAL_IP=%LOCAL_IP: =%"

set "WIFI_LINK=http://%LOCAL_IP%:8080/"

:: Copy the mobile Wi-Fi link directly into the Windows clipboard
<nul set /p="%WIFI_LINK%" | clip 2>nul

echo.
echo ======================================================================
echo   🌾  NUTRIAGRO FEEDS - READY-TO-SHARE DEVICE LINKS
echo ======================================================================
echo.
echo   [1] SHARE ON MOBILE PHONE / OTHER DEVICES (SAME WI-FI):
echo   ------------------------------------------------------------------
echo       %WIFI_LINK%
echo   ------------------------------------------------------------------
echo       ^>^> COPIED TO CLIPBOARD AUTOMATICALLY! ^<^<
echo       Just press Ctrl + V in WhatsApp, Telegram, or Notes to paste!
echo       (Make sure your phone is connected to the same Wi-Fi network)
echo.
echo   [2] LOCAL LINK (THIS COMPUTER ONLY):
echo   ------------------------------------------------------------------
echo       http://localhost:8080/
echo       http://localhost:8080/admin.html  (Admin Dispatch Hub)
echo.
echo   [3] SHARE WORLDWIDE (ACROSS THE INTERNET):
echo   ------------------------------------------------------------------
echo       Run "share_worldwide.bat" to get an instant public HTTPS tunnel link!
echo.
echo ======================================================================
echo   Ensure the local server is running by keeping start_server.bat open!
echo ======================================================================
echo.
pause
