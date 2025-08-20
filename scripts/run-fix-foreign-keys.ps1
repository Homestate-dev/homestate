# Script de PowerShell para ejecutar la corrección de restricciones de clave foránea
# Este script corrige las restricciones que aún apuntan a la tabla agentes_inmobiliarios

Write-Host "🔧 CORRECCIÓN DE RESTRICCIONES DE CLAVE FORÁNEA" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "scripts/fix-foreign-key-constraints.js")) {
    Write-Host "❌ Error: No se encontró el script fix-foreign-key-constraints.js" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar que el paquete pg esté instalado
if (-not (Test-Path "node_modules/pg")) {
    Write-Host "⚠️  Advertencia: El paquete 'pg' no está instalado" -ForegroundColor Yellow
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    
    try {
        npm install
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚨 IMPORTANTE: Este script corregirá las restricciones de clave foránea" -ForegroundColor Red
Write-Host "   que están causando errores en las transacciones." -ForegroundColor Red
Write-Host ""
Write-Host "📋 Lo que hará:" -ForegroundColor Cyan
Write-Host "   1. Verificar restricciones existentes" -ForegroundColor White
Write-Host "   2. Eliminar restricciones que apunten a agentes_inmobiliarios" -ForegroundColor White
Write-Host "   3. Crear nuevas restricciones que apunten a administradores" -ForegroundColor White
Write-Host "   4. Verificar que las correcciones funcionen" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "¿Deseas continuar? (s/N)"
if ($confirmation -ne "s" -and $confirmation -ne "S") {
    Write-Host "❌ Operación cancelada por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Ejecutando corrección..." -ForegroundColor Yellow
Write-Host ""

try {
    # Ejecutar el script de corrección
    Set-Location "scripts"
    node fix-foreign-key-constraints.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ Las restricciones de clave foránea han sido corregidas" -ForegroundColor Green
        Write-Host "✅ Las transacciones ahora deberían funcionar correctamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧪 Prueba crear una transacción para verificar que funciona" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ La corrección falló con código de salida: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "   Revisa los mensajes de error anteriores" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error durante la ejecución: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Stack trace: $($_.Exception.StackTrace)" -ForegroundColor Red
} finally {
    # Volver al directorio raíz
    Set-Location ".."
}

Write-Host ""
Write-Host "📚 Para más información, consulta:" -ForegroundColor Cyan
Write-Host "   - scripts/fix-foreign-key-constraints.sql" -ForegroundColor White
Write-Host "   - scripts/fix-foreign-key-constraints.js" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Si persisten los problemas, ejecuta el script de prueba:" -ForegroundColor Cyan
Write-Host "   node scripts/test-transaction-agent-fix.js" -ForegroundColor White
