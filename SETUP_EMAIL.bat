@echo off
echo ========================================
echo    Email Configuration Setup
echo ========================================
echo.
echo This script will help you create a .env file
echo with email configuration for the backend.
echo.

REM Check if .env already exists
if exist .env (
    echo WARNING: .env file already exists!
    echo.
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo.
        echo Setup cancelled. Your existing .env file was not modified.
        pause
        exit /b
    )
)

echo.
echo Let's set up your email configuration...
echo.
echo ========================================
echo    SMTP Configuration
echo ========================================
echo.
echo Common SMTP providers:
echo 1. Gmail (smtp.gmail.com, port 587)
echo 2. Outlook (smtp-mail.outlook.com, port 587)
echo 3. SendGrid (smtp.sendgrid.net, port 587)
echo 4. Other
echo.

set /p smtp_host="Enter SMTP Host (default: smtp.gmail.com): "
if "%smtp_host%"=="" set smtp_host=smtp.gmail.com

set /p smtp_port="Enter SMTP Port (default: 587): "
if "%smtp_port%"=="" set smtp_port=587

set /p smtp_user="Enter SMTP User (your email): "
if "%smtp_user%"=="" (
    echo ERROR: Email address is required!
    pause
    exit /b 1
)

set /p smtp_pass="Enter SMTP Password (App Password for Gmail): "
if "%smtp_pass%"=="" (
    echo ERROR: Password is required!
    pause
    exit /b 1
)

set /p smtp_from="Enter From Name (default: CounselIndia): "
if "%smtp_from%"=="" set smtp_from=CounselIndia

echo.
echo ========================================
echo    Creating .env file...
echo ========================================
echo.

(
echo # Server Configuration
echo NODE_ENV=development
echo PORT=5000
echo FRONTEND_URL=http://localhost:8080
echo.
echo # Database
echo MONGODB_URI=mongodb://localhost:27017/l2h-blog
echo.
echo # JWT
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo.
echo # Email Configuration
echo SMTP_HOST=%smtp_host%
echo SMTP_PORT=%smtp_port%
echo SMTP_USER=%smtp_user%
echo SMTP_PASS=%smtp_pass%
echo SMTP_FROM="%smtp_from%" ^<%smtp_user%^>
echo.
echo # OTP Configuration
echo OTP_EXPIRY_MINUTES=10
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
echo # API URL
echo VITE_API_URL=http://localhost:5000
) > .env

echo ✓ .env file created successfully!
echo.
echo ========================================
echo    Testing Email Configuration...
echo ========================================
echo.

set /p test_email="Enter email address to send test email (or press Enter to skip): "

if not "%test_email%"=="" (
    echo.
    echo Sending test email to %test_email%...
    echo.
    node test-email.js %test_email%
    echo.
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test ebook downloads at http://localhost:8080/ebooks
echo.
echo For Gmail users:
echo - Make sure you're using an App Password
echo - Enable 2-Step Verification first
echo - Generate App Password at: https://myaccount.google.com/apppasswords
echo.
echo Need help? See EMAIL_SETUP_GUIDE.md
echo.
pause

