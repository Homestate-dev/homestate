#!/usr/bin/env node

/**
 * Script para verificar el estado de la aplicación
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

async function checkAppStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE LA APLICACIÓN')
  console.log('=====================================\n')
  
  const endpoints = [
    { name: 'Health Check', url: `${HEROKU_URL}/api/health` },
    { name: 'Test Transactions', url: `${HEROKU_URL}/api/test-transactions` },
    { name: 'Departments', url: `${HEROKU_URL}/api/sales-rentals/departments` },
    { name: 'Transactions', url: `${HEROKU_URL}/api/sales-rentals/transactions` }
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
          if (result.data.data.length > 0) {
            console.log(`   Primer resultado:`, JSON.stringify(result.data.data[0], null, 2))
          }
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
checkAppStatus().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 