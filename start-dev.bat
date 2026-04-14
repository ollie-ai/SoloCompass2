@echo off
REM ============================================================
REM SoloCompass Dev Server Launcher
REM ============================================================

echo.
echo ============================================================
echo   SoloCompass Dev Server Launcher
echo ============================================================
echo.

REM Kill processes on ports
echo Stopping processes on port 3005...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3005" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping processes on port 5176...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5176" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a 2>nul
)

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && node src/index.js"

timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================================
echo   Done! Check the terminal windows for any errors.
echo   Backend: http://localhost:3005
echo   Frontend: http://localhost:5176
echo ============================================================
pause