# Script de PowerShell para ejecutar el análisis de agentes inmobiliarios en Heroku
# Ejecuta: .\scripts\run-show-agents-heroku.ps1

Write-Host "🔍 INICIANDO ANÁLISIS DE AGENTES INMOBILIARIOS EN HEROKU..." -ForegroundColor Cyan
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
$scriptPath = "scripts\show-agents-heroku.js"
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
Write-Host "🌐 Conectando a base de datos Heroku..." -ForegroundColor Green
Write-Host "   Host: c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com" -ForegroundColor Gray
Write-Host "   Database: dauaho3sghau5i" -ForegroundColor Gray
Write-Host "   User: ufcmrjr46j97t8" -ForegroundColor Gray
Write-Host ""

# Verificar conectividad a internet
Write-Host "🔍 Verificando conectividad a internet..." -ForegroundColor Yellow
try {
    $pingResult = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet
    if ($pingResult) {
        Write-Host "✅ Conectividad a internet verificada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Posibles problemas de conectividad" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  No se pudo verificar conectividad" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Ejecutando análisis de agentes en Heroku..." -ForegroundColor Green
Write-Host ""

# Ejecutar el script
try {
    node $scriptPath
} catch {
    Write-Host "❌ Error al ejecutar el script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica tu conexión a internet" -ForegroundColor Yellow
    Write-Host "   2. Verifica que las credenciales de Heroku sean correctas" -ForegroundColor Yellow
    Write-Host "   3. Verifica que la base de datos esté activa en Heroku" -ForegroundColor Yellow
    Write-Host "   4. Revisa si hay restricciones de firewall" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Análisis completado" -ForegroundColor Cyan
