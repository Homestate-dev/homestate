# Script para probar APIs de Heroku
# Ejecutar con: .\scripts\test-heroku-api.ps1

Write-Host "🔍 Testing Heroku APIs..." -ForegroundColor Cyan
Write-Host ""

# Test 1: API de departamentos del edificio
Write-Host "📍 Testing edificio-mondrian departments API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://homestate-17ca5a8016cd.herokuapp.com/api/buildings/edificio-mondrian/departments" -Method Get -Headers @{"Accept"="application/json"} -TimeoutSec 30
    
    Write-Host "✅ API Response received" -ForegroundColor Green
    Write-Host "Building Name: $($response.building.nombre)" -ForegroundColor White
    Write-Host "Building Address: $($response.building.direccion)" -ForegroundColor White
    Write-Host "Departments Count: $($response.departments.Count)" -ForegroundColor White
    Write-Host "Main Image: $($response.building.url_imagen_principal.Substring(0, [Math]::Min(50, $response.building.url_imagen_principal.Length)))..." -ForegroundColor White
    Write-Host "Secondary Images Count: $($response.building.imagenes_secundarias.Count)" -ForegroundColor White
    
    # Verificar tipos de datos
    Write-Host ""
    Write-Host "🔍 Data Type Validation:" -ForegroundColor Cyan
    Write-Host "Building is object: $($response.building -is [PSCustomObject])" -ForegroundColor White
    Write-Host "Departments is array: $($response.departments -is [Array])" -ForegroundColor White
    Write-Host "imagenes_secundarias is array: $($response.building.imagenes_secundarias -is [Array])" -ForegroundColor White
    
    # Verificar problemas potenciales
    Write-Host ""
    Write-Host "⚠️ Potential Issues:" -ForegroundColor Yellow
    if (-not $response.building.nombre) {
        Write-Host "- Missing building name" -ForegroundColor Red
    }
    if (-not ($response.building.imagenes_secundarias -is [Array])) {
        Write-Host "- imagenes_secundarias is not an array" -ForegroundColor Red
    }
    if (-not ($response.departments -is [Array])) {
        Write-Host "- departments is not an array" -ForegroundColor Red
    }
    
    if ($response.departments.Count -gt 0) {
        Write-Host ""
        Write-Host "📋 Sample Department:" -ForegroundColor Cyan
        $sampleDept = $response.departments[0]
        Write-Host "ID: $($sampleDept.id)" -ForegroundColor White
        Write-Host "Name: $($sampleDept.nombre)" -ForegroundColor White
        Write-Host "Number: $($sampleDept.numero)" -ForegroundColor White
        Write-Host "Floor: $($sampleDept.piso)" -ForegroundColor White
        Write-Host "Area: $($sampleDept.area)" -ForegroundColor White
        Write-Host "Images Count: $($sampleDept.imagenes.Count)" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error testing departments API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Gray

# Test 2: Página directa del edificio
Write-Host ""
Write-Host "📱 Testing direct building page..." -ForegroundColor Yellow
try {
    $pageResponse = Invoke-WebRequest -Uri "https://homestate-17ca5a8016cd.herokuapp.com/edificio/edificio-mondrian" -Method Get -TimeoutSec 30 -UseBasicParsing
    
    Write-Host "✅ Page response received" -ForegroundColor Green
    Write-Host "Status Code: $($pageResponse.StatusCode)" -ForegroundColor White
    Write-Host "Content Length: $($pageResponse.Content.Length) characters" -ForegroundColor White
    
    # Verificar si hay errores en el HTML
    if ($pageResponse.Content -match "Application error") {
        Write-Host "❌ Application error detected in page content!" -ForegroundColor Red
    } elseif ($pageResponse.Content -match "Minified React error") {
        Write-Host "❌ React error detected in page content!" -ForegroundColor Red
    } else {
        Write-Host "✅ No obvious errors detected in page content" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error testing building page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Gray

# Test 3: Health check
Write-Host ""
Write-Host "💓 Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://homestate-17ca5a8016cd.herokuapp.com/health" -Method Get -TimeoutSec 15
    Write-Host "✅ Health check: $($healthResponse | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Testing completed!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "1. If APIs return data correctly, the issue might be in React rendering" -ForegroundColor White
Write-Host "2. Check browser console for specific React errors" -ForegroundColor White
Write-Host "3. Deploy the latest changes to test the fixes" -ForegroundColor White
Write-Host "4. Monitor server logs after deployment" -ForegroundColor White 