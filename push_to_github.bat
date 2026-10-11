@echo off
title NutriAgro Feeds - Push to GitHub
cd /d "%~dp0"
cls
echo ======================================================================
echo          NUTRIAGRO FEEDS - CONNECTING PROJECT TO GITHUB
echo ======================================================================
echo.
echo Target Repository: https://github.com/bhanuprakashgowdu958-bit/agri-nutro.git
echo Branch: main
echo.
echo Pushing project and dist folder to GitHub...
echo (If Git Credential Manager opens a window, click "Sign in with your browser")
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================================
    echo   SUCCESS! Code and colorful backgrounds pushed to GitHub!
    echo   Repository: https://github.com/bhanuprakashgowdu958-bit/agri-nutro
    echo ======================================================================
) else (
    echo.
    echo If you saw an authentication prompt, please sign in to complete.
)
echo.
pause
