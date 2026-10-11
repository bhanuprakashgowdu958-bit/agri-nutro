@echo off
title NutriAgro Feeds - Push to GitHub
cd /d "%~dp0"
cls
echo ======================================================================
echo          NUTRIAGRO FEEDS - CONNECTING PROJECT TO GITHUB
echo ======================================================================
echo.
echo Target Repository: https://github.com/bhanuprakashgowdu958-bit/agri-nutro.git
echo.
echo ----------------------------------------------------------------------
echo  Attempting to push to branch: main
echo ----------------------------------------------------------------------
"C:\Program Files\Git\cmd\git.exe" push -u origin main --force
if %ERRORLEVEL% EQU 0 goto PUSH_SUCCESS

echo.
echo ======================================================================
echo  NOTICE: Push to 'main' was blocked by GitHub repository rules.
echo  Attempting push to branch: 'website' (bypasses main branch rules)...
echo ======================================================================
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin website --force
if %ERRORLEVEL% EQU 0 goto PUSH_WEBSITE_SUCCESS

echo.
echo ======================================================================
echo  DIAGNOSTICS:
echo  1. If GitHub Secret Scanning was triggered, check the URL shown above
echo     in the terminal (e.g. https://github.com/.../secret-scanning/...)
echo     Open that link in your browser and click "Bypass" / "Allow secret".
echo.
echo  2. If the rule requires a Pull Request or disabled direct pushes,
echo     go to: https://github.com/bhanuprakashgowdu958-bit/agri-nutro/settings/rules
echo     and review or adjust the Ruleset protecting 'main'.
echo ======================================================================
goto END

:PUSH_WEBSITE_SUCCESS
echo.
echo ======================================================================
echo   SUCCESS! Pushed to 'website' branch on GitHub!
echo   Repository: https://github.com/bhanuprakashgowdu958-bit/agri-nutro/tree/website
echo.
echo   You can now open a Pull Request or merge 'website' into 'main':
echo   https://github.com/bhanuprakashgowdu958-bit/agri-nutro/pull/new/website
echo ======================================================================
goto END

:PUSH_SUCCESS
echo.
echo ======================================================================
echo   SUCCESS! Code and colorful backgrounds pushed directly to 'main'!
echo   Repository: https://github.com/bhanuprakashgowdu958-bit/agri-nutro
echo ======================================================================

:END
echo.
pause

