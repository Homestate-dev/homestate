# Script de PowerShell para ejecutar el análisis de agentes inmobiliarios
# Ejecuta: .\scripts\run-show-agents.ps1

Write-Host "🔍 INICIANDO ANÁLISIS DE AGENTES INMOBILIARIOS..." -ForegroundColor Cyan
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
$scriptPath = "scripts\show-all-agents.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ No se encontró el script: $scriptPath" -ForegroundColor Red
    exit 1
}

# Verificar si pg está instalado
try {
    $pgCheck = npm list pg
    if ($pgCheck -match "pg@") {
        Write-Host "✅ Dependencia 'pg' encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Instalando dependencia 'pg'..." -ForegroundColor Yellow
        npm install pg
    }
} catch {
    Write-Host "⚠️  Instalando dependencia 'pg'..." -ForegroundColor Yellow
    npm install pg
}

# Verificar si la dependencia se instaló correctamente
try {
    $pgCheckAfter = npm list pg
    if ($pgCheckAfter -match "pg@") {
        Write-Host "✅ Dependencia 'pg' instalada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error al instalar 'pg'" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al verificar instalación de 'pg'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Ejecutando análisis de agentes..." -ForegroundColor Green
Write-Host ""

# Ejecutar el script
try {
    node $scriptPath
} catch {
    Write-Host "❌ Error al ejecutar el script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que la base de datos esté ejecutándose" -ForegroundColor Yellow
    Write-Host "   2. Configura la variable de entorno DATABASE_URL" -ForegroundColor Yellow
    Write-Host "   3. O edita el script para usar tu configuración local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Análisis completado" -ForegroundColor Cyan
