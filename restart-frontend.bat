@echo off
echo Restarting DDS Frontend with Updated Environment Variables...
echo.

REM Stop any running Next.js processes
echo Stopping any running Next.js processes...
taskkill /f /im node.exe >nul 2>&1

REM Clear Next.js cache
echo Clearing Next.js cache...
if exist .next rmdir /s /q .next

REM Show current environment variables
echo.
echo Current Environment Variables:
type .env
echo.

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo Starting Next.js development server...
echo Frontend will be available at: http://localhost:3000
echo Backend API configured for: http://localhost:3001
echo WebSocket server configured for: http://localhost:3002
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev 