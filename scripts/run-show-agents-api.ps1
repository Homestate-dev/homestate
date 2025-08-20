# Script de PowerShell para ejecutar el análisis de agentes inmobiliarios vía API
# Ejecuta: .\scripts\run-show-agents-api.ps1

Write-Host "🔍 INICIANDO ANÁLISIS DE AGENTES INMOBILIARIOS VÍA API..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "💡 Instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si el script existe
$scriptPath = "scripts\show-agents-via-api.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ No se encontró el script: $scriptPath" -ForegroundColor Red
    exit 1
}

# Configurar URL de la API
$apiUrl = Read-Host "🌐 Ingresa la URL de tu aplicación (presiona Enter para usar http://localhost:3000)"
if ([string]::IsNullOrWhiteSpace($apiUrl)) {
    $apiUrl = "http://localhost:3000"
}

Write-Host "✅ Usando API en: $apiUrl" -ForegroundColor Green
Write-Host ""

# Verificar si la aplicación está ejecutándose
Write-Host "🔍 Verificando conexión con la aplicación..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Aplicación está ejecutándose y respondiendo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Aplicación responde pero con estado: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  No se pudo conectar a la aplicación en: $apiUrl" -ForegroundColor Yellow
    Write-Host "💡 Asegúrate de que la aplicación esté ejecutándose" -ForegroundColor Yellow
    Write-Host "   O ajusta la URL si es diferente" -ForegroundColor Yellow
    Write-Host ""
    
    $continue = Read-Host "¿Quieres continuar de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}

Write-Host ""
Write-Host "🚀 Ejecutando análisis de agentes vía API..." -ForegroundColor Green
Write-Host ""

# Ejecutar el script con la URL de la API
try {
    $env:API_BASE_URL = $apiUrl
    node $scriptPath
} catch {
    Write-Host "❌ Error al ejecutar el script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que la aplicación esté ejecutándose en: $apiUrl" -ForegroundColor Yellow
    Write-Host "   2. Verifica que la API /api/agents esté disponible" -ForegroundColor Yellow
    Write-Host "   3. Revisa los logs de la aplicación para errores" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Análisis completado" -ForegroundColor Cyan
