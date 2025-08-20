# Script PowerShell para ejecutar la configuración de page_configuration
# Este script creará la tabla necesaria para almacenar la configuración de la página

Write-Host "🚀 Configurando tabla page_configuration para HomEstate..." -ForegroundColor Green
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si el archivo package.json existe (para obtener dependencias)
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar si pg está instalado
    $pgInstalled = npm list pg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 Instalando dependencia 'pg'..." -ForegroundColor Yellow
        npm install pg
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al instalar la dependencia 'pg'" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Dependencia 'pg' ya está instalada" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  package.json no encontrado, asumiendo que estamos en el directorio scripts" -ForegroundColor Yellow
    
    # Navegar al directorio padre para encontrar package.json
    if (Test-Path "../package.json") {
        Set-Location ".."
        Write-Host "✅ Navegando al directorio padre" -ForegroundColor Green
        
        # Verificar si pg está instalado
        $pgInstalled = npm list pg
        if ($LASTEXITCODE -ne 0) {
            Write-Host "📦 Instalando dependencia 'pg'..." -ForegroundColor Yellow
            npm install pg
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Error al instalar la dependencia 'pg'" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "✅ Dependencia 'pg' ya está instalada" -ForegroundColor Green
        }
        
        # Volver al directorio scripts
        Set-Location "scripts"
    }
}

Write-Host ""
Write-Host "🔧 Configuración de la base de datos:" -ForegroundColor Cyan
Write-Host ""

# Solicitar configuración de la base de datos
$dbHost = Read-Host "Host de la base de datos (Enter para localhost)"
if ([string]::IsNullOrEmpty($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Puerto de la base de datos (Enter para 5432)"
if ([string]::IsNullOrEmpty($dbPort)) { $dbPort = "5432" }

$dbName = Read-Host "Nombre de la base de datos (Enter para homestate)"
if ([string]::IsNullOrEmpty($dbName)) { $dbName = "homestate" }

$dbUser = Read-Host "Usuario de la base de datos (Enter para postgres)"
if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "postgres" }

$dbPassword = Read-Host "Contraseña de la base de datos" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

Write-Host ""
Write-Host "📋 Resumen de configuración:" -ForegroundColor Cyan
Write-Host "Host: $dbHost" -ForegroundColor White
Write-Host "Puerto: $dbPort" -ForegroundColor White
Write-Host "Base de datos: $dbName" -ForegroundColor White
Write-Host "Usuario: $dbUser" -ForegroundColor White
Write-Host "Contraseña: " -NoNewline -ForegroundColor White
Write-Host "***" -ForegroundColor Red

$confirm = Read-Host "¿Continuar con esta configuración? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Ejecutando script de configuración..." -ForegroundColor Green

# Configurar variables de entorno
$env:DB_HOST = $dbHost
$env:DB_PORT = $dbPort
$env:DB_NAME = $dbName
$env:DB_USER = $dbUser
$env:DB_PASSWORD = $dbPasswordPlain

# Ejecutar el script JavaScript
try {
    node "apply-page-configuration-table.js"
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 ¡Configuración completada exitosamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. La tabla page_configuration está lista para usar" -ForegroundColor White
        Write-Host "2. Ahora puedes conectar el componente PageConfiguration a la base de datos" -ForegroundColor White
        Write-Host "3. Los campos whatsapp_number y tally_link están disponibles" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Para probar la conexión, puedes ejecutar:" -ForegroundColor Yellow
        Write-Host "   node scripts/apply-page-configuration-table.js" -ForegroundColor White
    } else {
        Write-Host "❌ Error al ejecutar el script" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Limpiar variables de entorno sensibles
    Remove-Item Env:DB_PASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✨ Proceso finalizado" -ForegroundColor Green
