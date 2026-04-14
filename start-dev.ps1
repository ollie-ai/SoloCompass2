#!/usr/bin/env pwsh
# ============================================================
# SoloCompass Dev Server Launcher (PowerShell)
# Stops existing processes and starts fresh dev servers
# ============================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SoloCompass Dev Server Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Function to find and kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $pid = $conn.OwningProcess
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  Stopping $($process.ProcessName) (PID: $pid) on port $Port" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
        }
    }
}

Write-Host "[1/4] Stopping existing processes..." -ForegroundColor Green
Write-Host ""

# Stop processes on our ports
Stop-ProcessOnPort -Port 3005
Stop-ProcessOnPort -Port 5176

# Kill any lingering node processes in our directories
$projectPath = Split-Path -Parent $PSScriptRoot
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*SoloCompass*" -or $_.Path -like "*$projectPath*"
} | ForEach-Object {
    Write-Host "  Stopping node process: $($_.Id)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force
}

Write-Host ""
Write-Host "[2/4] Waiting for ports to clear..." -ForegroundColor Green
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[3/4] Starting Backend server..." -ForegroundColor Green
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node src/server.js" -WindowStyle Normal -WorkingDirectory $backendPath

Write-Host ""
Write-Host "[4/4] Starting Frontend server..." -ForegroundColor Green
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal -WorkingDirectory $frontendPath

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Servers starting..." -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost:3005" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:5176" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""