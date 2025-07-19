# Script de PowerShell para limpiar todos los departamentos
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Iniciando script de limpieza de departamentos..." -ForegroundColor Green
Write-Host "=" * 50

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que existe el script
if (-not (Test-Path "scripts/clear-all-departments-heroku.js")) {
    Write-Host "❌ Error: No se encontró el script clear-all-departments-heroku.js" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Ejecutando limpieza de departamentos..." -ForegroundColor Yellow
Write-Host "⚠️  ADVERTENCIA: Esta acción eliminará TODOS los departamentos de la base de datos" -ForegroundColor Red
Write-Host "   Esta acción NO se puede deshacer." -ForegroundColor Red

# Preguntar confirmación
$confirmation = Read-Host "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar)"

if ($confirmation -ne "SI") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host "✅ Confirmación recibida. Ejecutando limpieza..." -ForegroundColor Green

# Ejecutar el script
try {
    node scripts/clear-all-departments-heroku.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 ¡Limpieza completada exitosamente!" -ForegroundColor Green
        Write-Host "   Todos los departamentos han sido eliminados de la base de datos." -ForegroundColor Green
    } else {
        Write-Host "❌ Error durante la ejecución del script" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al ejecutar el script: $_" -ForegroundColor Red
    exit 1
}

Write-Host "=" * 50
Write-Host "✅ Script completado" -ForegroundColor Green 