@echo off
title NutriAgro Feeds - Share Links
cd /d "%~dp0"

:: Copy the mobile Wi-Fi link directly into the Windows clipboard
<nul set /p="http://192.168.0.122:8080/" | clip 2>nul

echo.
echo ======================================================================
echo   🌾  NUTRIAGRO FEEDS - READY-TO-SHARE DEVICE LINKS
echo ======================================================================
echo.
echo   [1] SHARE ON MOBILE PHONE / OTHER DEVICES (SAME WI-FI):
echo   ------------------------------------------------------------------
echo       http://192.168.0.122:8080/
echo   ------------------------------------------------------------------
echo       ^>^> COPIED TO CLIPBOARD AUTOMATICALLY! ^<^<
echo       Just press Ctrl + V in WhatsApp, Telegram, or Notes to paste!
echo       (Make sure your phone is connected to the same Wi-Fi network)
echo.
echo   [2] LOCAL LINK (THIS COMPUTER ONLY):
echo   ------------------------------------------------------------------
echo       http://localhost:8080/
echo.
echo   [3] SHARE WORLDWIDE (ACROSS THE INTERNET):
echo   ------------------------------------------------------------------
echo       Run this command in any terminal to get an instant public link:
echo       ssh -R 80:localhost:8080 a.pinggy.io
echo.
echo ======================================================================
echo   Ensure the local server is running by keeping start_server.bat open!
echo ======================================================================
echo.
pause
