# Script de PowerShell para ejecutar la limpieza de administradores y agentes
# ⚠️ ADVERTENCIA: Este script eliminará TODOS los usuarios excepto homestate.dev@gmail.com

Write-Host "🧹 LIMPIEZA COMPLETA DE ADMINISTRADORES Y AGENTES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  ADVERTENCIA CRÍTICA ⚠️" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host "Este script realizará una limpieza COMPLETA del sistema:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔴 ELIMINARÁ:" -ForegroundColor Red
Write-Host "• Todos los administradores EXCEPTO homestate.dev@gmail.com" -ForegroundColor Red
Write-Host "• TODOS los agentes inmobiliarios" -ForegroundColor Red
Write-Host "• Todas las referencias y secuencias relacionadas" -ForegroundColor Red
Write-Host ""
Write-Host "🟢 MANTENDRÁ:" -ForegroundColor Green
Write-Host "• ÚNICAMENTE el administrador principal (homestate.dev@gmail.com)" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  ESTA ACCIÓN ES IRREVERSIBLE ⚠️" -ForegroundColor Red
Write-Host ""

# Solicitar confirmación
$confirmacion = Read-Host "¿Estás seguro de que quieres realizar esta limpieza COMPLETA? (escribe 'LIMPIAR' para confirmar)"

if ($confirmacion -ne "LIMPIAR") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit
}

# Segunda confirmación
$confirmacion2 = Read-Host "¿Estás 100% seguro? Esta acción no se puede deshacer. (escribe 'SI' para confirmar)"

if ($confirmacion2 -ne "SI") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔄 Ejecutando script de limpieza..." -ForegroundColor Yellow

# Verificar que existe el script
$scriptPath = Join-Path $PSScriptRoot "clean-admins-agents.js"

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Error: No se encontró el script clean-admins-agents.js" -ForegroundColor Red
    Write-Host "   Asegúrate de que esté en la misma carpeta que este script de PowerShell" -ForegroundColor Yellow
    exit 1
}

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar que el paquete pg esté instalado
try {
    $pgCheck = node -e "require('pg')" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Advertencia: El paquete 'pg' no está instalado" -ForegroundColor Yellow
        Write-Host "   Instalando paquete pg..." -ForegroundColor Yellow
        
        npm install pg
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error: No se pudo instalar el paquete 'pg'" -ForegroundColor Red
            Write-Host "   Por favor, ejecuta manualmente: npm install pg" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "✅ Paquete 'pg' instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "✅ Paquete 'pg' ya está instalado" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  No se pudo verificar el paquete 'pg', continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Iniciando limpieza..." -ForegroundColor Green
Write-Host ""

# Ejecutar el script de Node.js
try {
    node $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Script ejecutado exitosamente" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ El script terminó con errores (código: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "   Revisa la salida anterior para más detalles" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al ejecutar el script: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Script de limpieza completado" -ForegroundColor Cyan
Write-Host "Revisa la salida anterior para ver el resultado" -ForegroundColor Yellow
