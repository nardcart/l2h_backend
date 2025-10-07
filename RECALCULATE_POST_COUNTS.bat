@echo off
echo ======================================
echo   Recalculate Category Post Counts
echo ======================================
echo.
echo This script will update post counts for all categories
echo based on the number of PUBLISHED blog posts.
echo.
pause

cd /d "%~dp0"

echo.
echo Running recalculation script...
npm run recalculate-posts

echo.
echo ======================================
echo   Done!
echo ======================================
pause

