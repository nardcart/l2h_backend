@echo off
echo ============================================
echo   L2H Blog Backend - Vercel Deployment
echo ============================================
echo.

echo Step 1: Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed! Please fix TypeScript errors first.
    pause
    exit /b 1
)
echo ✅ Build successful!
echo.

echo Step 2: Checking for Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
)
echo ✅ Vercel CLI is ready!
echo.

echo Step 3: Deploying to Vercel...
echo.
echo Choose deployment type:
echo 1. Preview deployment (test)
echo 2. Production deployment
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Deploying to preview...
    call vercel
) else if "%choice%"=="2" (
    echo Deploying to production...
    call vercel --prod
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Deployment Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Go to https://vercel.com/dashboard
echo 2. Configure environment variables (see env.vercel.example)
echo 3. Setup Vercel Blob Storage
echo 4. Update MongoDB Atlas Network Access (allow 0.0.0.0/0)
echo 5. Test your API endpoints
echo.
echo Read VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions.
echo.
pause

