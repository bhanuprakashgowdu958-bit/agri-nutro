@echo off
title NutriAgro Feeds - Vercel Deployment & Sync
color 0A
cls
echo ======================================================================
echo    🌾 NUTRIAGRO FEEDS - VERCEL CLOUD DEPLOYMENT & SYNC
echo ======================================================================
echo.
echo  Your project is configured for Vercel with:
echo    - /api/orders Serverless Endpoint
echo    - /api/gemini AI Agronomist Proxy
echo    - Full vercel.json API & CORS routing
echo.
echo  ----------------------------------------------------------------------
echo  ACTION:
echo  1. Running git push to trigger instant Vercel cloud deployment...
echo  ----------------------------------------------------------------------
echo.

git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo  ======================================================================
    echo   [SUCCESS] Code pushed directly to GitHub 'main' branch!
    echo   Vercel will now automatically build and publish your latest website.
    echo  ======================================================================
) else (
    echo.
    echo  [NOTICE] To push manually, run: push_to_github.bat
)

echo.
echo  Opening Vercel Dashboard in your default browser...
start https://vercel.com/dashboard

echo.
echo  [DONE] Your live Vercel website will be updated automatically!
pause
