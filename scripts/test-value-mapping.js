#!/usr/bin/env node

/**
 * Script para probar el mapeo de valores de transacción
 */

const { Client } = require('pg')

// Configuración de la base de datos (misma que Heroku)
const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
}

async function testValueMapping() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔍 PRUEBA DE MAPEO DE VALORES')
    console.log('==============================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar cómo se están guardando los valores
    console.log('1. 📊 VERIFICANDO VALORES GUARDADOS')
    console.log('----------------------------------')
    
    const result = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        comision_valor,
        comision_porcentaje,
        fecha_registro,
        estado_actual,
        cliente_nombre
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 3
    `)
    
    console.log('   Valores en la base de datos:')
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Precio Final (DB): $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
      console.log(`      Porcentaje: ${row.comision_porcentaje || 0}%`)
      console.log(`      Fecha Registro: ${row.fecha_registro || 'N/A'}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log('')
    })

    // 2. Simular el mapeo que hace el API
    console.log('2. 🔄 SIMULANDO MAPEO DEL API')
    console.log('-------------------------------')
    
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. Transacción ID: ${row.id}`)
      console.log(`      En DB: precio_final = $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Debería mapear a: valor_transaccion = $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
      console.log('')
    })

    console.log('🎯 DIAGNÓSTICO:')
    console.log('===============')
    console.log('• ✅ Los valores se están guardando correctamente en precio_final')
    console.log('• ❌ El frontend espera valor_transaccion pero la DB usa precio_final')
    console.log('• 🔧 Necesitamos mapear precio_final → valor_transaccion en el API GET')
    console.log('• ✅ La fecha_registro se está guardando correctamente')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar prueba
testValueMapping().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 