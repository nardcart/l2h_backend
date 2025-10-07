@echo off
echo ========================================
echo L2H Blog Backend - Restart Script
echo ========================================
echo.
echo This script will help you restart your server properly.
echo.
echo Step 1: Stopping any running Node processes...
echo.
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Navigating to backend directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Step 3: Checking .env file...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with BLOB_READ_WRITE_TOKEN
    pause
    exit /b 1
)
echo .env file found: YES
echo.

echo Step 4: Testing Vercel Blob connection...
node test-blob-upload.js
if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: Vercel Blob test failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. BLOB_READ_WRITE_TOKEN in .env file
    echo 2. Token should NOT have quotes
    echo 3. Get token from: https://vercel.com/dashboard/stores
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Test passed! Starting server...
echo ========================================
echo.
echo Watch for this line:
echo    BLOB_READ_WRITE_TOKEN: [checkmark] Set
echo.
echo If you see [X] Not Set, press Ctrl+C and run this script again.
echo.
pause
npm run dev

