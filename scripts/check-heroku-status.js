#!/usr/bin/env node

/**
 * Script para verificar el estado de la aplicación en Heroku
 * Hace peticiones HTTP a los endpoints para diagnosticar problemas
 */

const https = require('https')

const HEROKU_URL = 'https://homestate-17ca5a8016cd.herokuapp.com'

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: error.message
          })
        }
      })
    }).on('error', (error) => {
      reject(error)
    })
  })
}

async function checkHerokuStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE HEROKU')
  console.log('===============================\n')
  
  const endpoints = [
    { name: 'Health Check', url: `${HEROKU_URL}/api/health` },
    { name: 'Test Departments', url: `${HEROKU_URL}/api/test-departments` },
    { name: 'Departments (sin filtro)', url: `${HEROKU_URL}/api/sales-rentals/departments` },
    { name: 'Departments (con filtro)', url: `${HEROKU_URL}/api/sales-rentals/departments?edificio_id=167` }
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando: ${endpoint.name}`)
      console.log(`   URL: ${endpoint.url}`)
      
      const result = await makeRequest(endpoint.url)
      
      console.log(`   Status: ${result.status}`)
      
      if (result.status === 200) {
        console.log(`   ✅ Éxito`)
        if (result.data && result.data.success !== undefined) {
          console.log(`   Success: ${result.data.success}`)
        }
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          console.log(`   Resultados: ${result.data.data.length}`)
        }
      } else {
        console.log(`   ❌ Error ${result.status}`)
        if (result.data && result.data.error) {
          console.log(`   Error: ${result.data.error}`)
        }
      }
      
      console.log('')
      
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`)
      console.log('')
    }
  }

  console.log('🎉 Verificación completada')
}

// Ejecutar verificación
checkHerokuStatus().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 