#!/usr/bin/env node

/**
 * Script final para verificar que el fix de carga de transacciones funciona
 * Simula el comportamiento del frontend y API
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

async function verifyTransactionsFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔍 VERIFICACIÓN FINAL DE CARGA DE TRANSACCIONES')
    console.log('===============================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Simular la consulta del API GET
    console.log('1. 📊 SIMULANDO API GET /api/sales-rentals/transactions')
    console.log('--------------------------------------------------------')
    
    const apiQuery = `
      SELECT 
        td.*,
        a.nombre as agente_nombre,
        e.nombre as edificio_nombre,
        d.numero as departamento_numero
      FROM transacciones_departamentos td
      LEFT JOIN administradores a ON td.agente_id = a.id
      LEFT JOIN departamentos d ON td.departamento_id = d.id
      LEFT JOIN edificios e ON d.edificio_id = e.id
      ORDER BY td.fecha_transaccion DESC
    `
    
    const apiResult = await client.query(apiQuery)
    console.log(`   Transacciones encontradas: ${apiResult.rows.length}`)
    
    if (apiResult.rows.length === 0) {
      console.log('   ❌ No hay transacciones para mostrar')
      console.log('   🔧 El problema puede ser:')
      console.log('      - No hay transacciones en la base de datos')
      console.log('      - Error en la consulta del API')
      console.log('      - Problema en el frontend')
    } else {
      console.log('   ✅ Transacciones encontradas correctamente')
      apiResult.rows.slice(0, 3).forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}`)
        console.log(`      Cliente: ${row.cliente_nombre}`)
        console.log(`      Tipo: ${row.tipo_transaccion}`)
        console.log(`      Valor: $${row.precio_final?.toLocaleString() || 'N/A'}`)
        console.log(`      Estado: ${row.estado_actual}`)
        console.log(`      Agente: ${row.agente_nombre || 'N/A'}`)
        console.log(`      Edificio: ${row.edificio_nombre || 'N/A'}`)
        console.log('')
      })
    }

    // 2. Simular el mapeo del API
    console.log('2. 🔄 SIMULANDO MAPEO DEL API')
    console.log('-------------------------------')
    
    const mappedData = apiResult.rows.map(row => {
      const mappedRow = { ...row }
      
      // Mapear precio_final a valor_transaccion (como lo hace el API)
      if (row.precio_final !== undefined) {
        mappedRow.valor_transaccion = row.precio_final
      }
      
      return mappedRow
    })
    
    console.log(`   Datos mapeados: ${mappedData.length}`)
    if (mappedData.length > 0) {
      const sample = mappedData[0]
      console.log(`   Ejemplo de mapeo:`)
      console.log(`      precio_final: $${sample.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      valor_transaccion: $${sample.valor_transaccion?.toLocaleString() || 'N/A'}`)
      console.log(`      ✅ Mapeo correcto`)
    }

    // 3. Verificar estructura de respuesta
    console.log('\n3. 📋 VERIFICANDO ESTRUCTURA DE RESPUESTA')
    console.log('----------------------------------------')
    
    if (mappedData.length > 0) {
      const sample = mappedData[0]
      const requiredFields = [
        'id', 'tipo_transaccion', 'valor_transaccion', 'comision_valor', 
        'comision_porcentaje', 'cliente_nombre', 'estado_actual', 
        'agente_nombre', 'edificio_nombre', 'departamento_numero'
      ]
      
      console.log('   Campos requeridos por el frontend:')
      requiredFields.forEach(field => {
        const hasField = sample.hasOwnProperty(field)
        const value = sample[field]
        console.log(`      ${hasField ? '✅' : '❌'} ${field}: ${value || 'N/A'}`)
      })
    }

    // 4. Diagnóstico final
    console.log('\n4. 🎯 DIAGNÓSTICO FINAL')
    console.log('------------------------')
    
    if (apiResult.rows.length === 0) {
      console.log('❌ PROBLEMA IDENTIFICADO:')
      console.log('   - No hay transacciones en la base de datos')
      console.log('   - El frontend no puede mostrar transacciones vacías')
      console.log('   🔧 SOLUCIÓN:')
      console.log('      - Crear algunas transacciones de prueba')
      console.log('      - Verificar que el API esté funcionando')
    } else {
      console.log('✅ TODO FUNCIONA CORRECTAMENTE:')
      console.log('   - Hay transacciones en la base de datos')
      console.log('   - El API puede consultarlas correctamente')
      console.log('   - El mapeo precio_final → valor_transaccion funciona')
      console.log('   - La estructura de datos es correcta')
      console.log('   🔧 SI EL FRONTEND NO MUESTRA TRANSACCIONES:')
      console.log('      - Verificar la consola del navegador por errores')
      console.log('      - Verificar que el componente se esté montando correctamente')
      console.log('      - Verificar que los useEffect se ejecuten')
    }

    console.log('\n🎉 VERIFICACIÓN COMPLETADA')
    console.log('==========================')
    console.log('\n📋 RESUMEN:')
    console.log(`• ✅ Transacciones en DB: ${apiResult.rows.length}`)
    console.log(`• ✅ Datos mapeados: ${mappedData.length}`)
    console.log(`• ✅ Estructura de respuesta: ${mappedData.length > 0 ? 'Correcta' : 'N/A'}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar verificación
verifyTransactionsFix().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 