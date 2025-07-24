# Script de deploy para Heroku
Write-Host "🚀 Iniciando deploy a Heroku..." -ForegroundColor Green

# Verificar estado de git
Write-Host "📋 Verificando estado de git..." -ForegroundColor Yellow
git status

# Agregar todos los cambios
Write-Host "📦 Agregando cambios..." -ForegroundColor Yellow
git add .

# Verificar qué se agregó
Write-Host "📋 Estado después de agregar:" -ForegroundColor Yellow
git status

# Hacer commit
Write-Host "💾 Haciendo commit..." -ForegroundColor Yellow
git commit -m "Fix: Corregir errores 500 en endpoints y agregar endpoints de diagnóstico"

# Hacer push a Heroku
Write-Host "🚀 Haciendo push a Heroku..." -ForegroundColor Yellow
git push heroku main

Write-Host "✅ Deploy completado!" -ForegroundColor Green 