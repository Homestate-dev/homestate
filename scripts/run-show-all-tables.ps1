# Script de PowerShell para ejecutar show-all-tables-and-columns.js
Write-Host "🚀 Ejecutando script para mostrar todas las tablas y columnas..." -ForegroundColor Green
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si el paquete pg está instalado
try {
    $pgInstalled = npm list pg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Instalando paquete pg..." -ForegroundColor Yellow
        npm install pg
    } else {
        Write-Host "✅ Paquete pg ya está instalado" -ForegroundColor Green
    }
} catch {
    Write-Host "📦 Instalando paquete pg..." -ForegroundColor Yellow
    npm install pg
}

Write-Host ""
Write-Host "🔍 Ejecutando script de análisis de base de datos..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script
node show-all-tables-and-columns.js

Write-Host ""
Write-Host "✅ Script completado" -ForegroundColor Green
