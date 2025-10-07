@echo off
cd /d "%~dp0"
echo ========================================
echo L2H Blog Backend - Startup Script
echo ========================================
echo.
echo Step 1: Testing Vercel Blob connection...
echo ----------------------------------------
node test-blob-upload.js
echo.

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Vercel Blob test failed!
    echo ========================================
    echo Please update BLOB_READ_WRITE_TOKEN in .env file
    echo Get your token from: https://vercel.com/dashboard/stores
    pause
    exit /b 1
)

echo.
echo ========================================
echo Test passed! Starting server...
echo ========================================
echo.
npm run dev

