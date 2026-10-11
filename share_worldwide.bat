@echo off
title NutriAgro Feeds - Public Internet Tunnel (Worldwide Sharing)
cd /d "%~dp0"

echo ======================================================================
echo   🌾  NUTRIAGRO FEEDS — PUBLIC INTERNET SHARE TUNNEL
echo ======================================================================
echo.
echo   [!] PREREQUISITE:
echo   Make sure your server is running in another window (start_server.bat).
echo.
echo   Starting secure public tunnel via Pinggy...
echo   A live HTTPS link will appear below (e.g. https://xxxxx.a.pinggy.link).
echo   Copy THAT link and send it to anyone in the world!
echo.
echo   NOTE: Keep this window OPEN while people are testing your site.
echo ======================================================================
echo.

ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 a.pinggy.io

pause
