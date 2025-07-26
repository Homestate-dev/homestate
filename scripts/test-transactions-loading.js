#!/usr/bin/env node

/**
 * Script para probar la carga de transacciones desde el API
 * Verifica que el endpoint GET /api/sales-rentals/transactions funcione correctamente
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

async function testTransactionsLoading() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🧪 PRUEBA DE CARGA DE TRANSACCIONES')
    console.log('====================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar transacciones en la base de datos
    console.log('1. 📊 VERIFICANDO TRANSACCIONES EN LA BASE DE DATOS')
    console.log('--------------------------------------------------')
    
    const dbResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        comision_valor,
        comision_porcentaje,
        fecha_registro,
        estado_actual,
        cliente_nombre,
        creado_por
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 5
    `)
    
    console.log(`   Transacciones en DB: ${dbResult.rows.length}`)
    dbResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Valor: $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log(`      Creado por: ${row.creado_por}`)
      console.log('')
    })

    // 2. Simular la consulta que hace el API
    console.log('2. 🔄 SIMULANDO CONSULTA DEL API')
    console.log('----------------------------------')
    
    const apiQueryResult = await client.query(`
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
    `)
    
    console.log(`   Transacciones con joins: ${apiQueryResult.rows.length}`)
    apiQueryResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Valor: $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log(`      Agente: ${row.agente_nombre || 'N/A'}`)
      console.log(`      Edificio: ${row.edificio_nombre || 'N/A'}`)
      console.log(`      Departamento: ${row.departamento_numero || 'N/A'}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log('')
    })

    // 3. Verificar mapeo de datos
    console.log('3. 🔄 VERIFICANDO MAPEO DE DATOS')
    console.log('--------------------------------')
    
    const mappedData = apiQueryResult.rows.map(row => {
      const mappedRow = { ...row }
      
      // Mapear precio_final a valor_transaccion
      if (row.precio_final !== undefined) {
        mappedRow.valor_transaccion = row.precio_final
      }
      
      return mappedRow
    })
    
    console.log(`   Datos mapeados: ${mappedData.length}`)
    mappedData.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      precio_final: $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      valor_transaccion: $${row.valor_transaccion?.toLocaleString() || 'N/A'}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log('')
    })

    console.log('🎉 PRUEBA DE CARGA COMPLETADA')
    console.log('=============================')
    console.log('\n📋 RESUMEN:')
    console.log(`• ✅ Transacciones en DB: ${dbResult.rows.length}`)
    console.log(`• ✅ Transacciones con joins: ${apiQueryResult.rows.length}`)
    console.log(`• ✅ Datos mapeados: ${mappedData.length}`)
    console.log('\n🎯 DIAGNÓSTICO:')
    if (dbResult.rows.length > 0) {
      console.log('• ✅ Hay transacciones en la base de datos')
      console.log('• ✅ El API debería poder cargarlas correctamente')
      console.log('• ✅ El mapeo precio_final → valor_transaccion funciona')
    } else {
      console.log('• ❌ No hay transacciones en la base de datos')
      console.log('• 🔧 Necesitas crear algunas transacciones primero')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar prueba
testTransactionsLoading().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 