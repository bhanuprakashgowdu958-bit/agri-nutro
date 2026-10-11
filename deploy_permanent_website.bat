@echo off
title NutriAgro Feeds - Update Permanent Website
color 0A
cls
echo ======================================================================
echo    NUTRIAGRO FEEDS - INSTANT PERMANENT WEBSITE UPDATE
echo ======================================================================
echo.
echo  The build with 100% inlined CSS and clean web paths is ready!
echo.
echo  Opening:
echo    1. Your Netlify Deploys page: 
echo       https://app.netlify.com/projects/astonishing-donut-8422b5/deploys
echo    2. File Explorer showing the "dist" folder and "NutriAgro-Feeds-Website.zip"
echo.
echo  ----------------------------------------------------------------------
echo  ACTION:
echo  Drag the "dist" folder OR "NutriAgro-Feeds-Website.zip" into the box:
echo  "Need to update your site? Drag and drop your site folder here"
echo  ----------------------------------------------------------------------
echo.
timeout /t 2 >nul

start https://app.netlify.com/projects/astonishing-donut-8422b5/deploys
explorer.exe /select,"%~dp0dist"

echo [DONE] Drag the highlighted dist folder to update your site!
pause
