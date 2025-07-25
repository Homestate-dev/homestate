#!/usr/bin/env node

/**
 * Script rápido para diagnosticar y corregir problemas de transacciones
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

async function quickFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 DIAGNÓSTICO RÁPIDO - PROBLEMA DE TRANSACCIONES')
    console.log('================================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // 1. Verificar estructura de transacciones_departamentos
    console.log('1. 📋 ESTRUCTURA DE transacciones_departamentos')
    console.log('----------------------------------------------')
    
    const transStructureResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `)
    
    console.log('Columnas encontradas:')
    transStructureResult.rows.forEach(col => {
      console.log(`   ${col.ordinal_position}. ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })

    // 2. Verificar si existe fecha_registro o fecha_transaccion
    const hasFechaRegistro = transStructureResult.rows.some(col => col.column_name === 'fecha_registro')
    const hasFechaTransaccion = transStructureResult.rows.some(col => col.column_name === 'fecha_transaccion')
    const hasCreatedAt = transStructureResult.rows.some(col => col.column_name === 'created_at')
    const hasUpdatedAt = transStructureResult.rows.some(col => col.column_name === 'updated_at')

    console.log('\n2. 📅 COLUMNAS DE FECHA')
    console.log('----------------------')
    console.log(`fecha_registro: ${hasFechaRegistro ? '✅ Existe' : '❌ No existe'}`)
    console.log(`fecha_transaccion: ${hasFechaTransaccion ? '✅ Existe' : '❌ No existe'}`)
    console.log(`created_at: ${hasCreatedAt ? '✅ Existe' : '❌ No existe'}`)
    console.log(`updated_at: ${hasUpdatedAt ? '✅ Existe' : '❌ No existe'}`)

    // 3. Probar query con la columna correcta
    console.log('\n3. 🧪 PROBANDO QUERY CORREGIDA')
    console.log('-----------------------------')
    
    let orderByColumn = 'id' // fallback
    if (hasFechaRegistro) {
      orderByColumn = 'fecha_registro'
    } else if (hasFechaTransaccion) {
      orderByColumn = 'fecha_transaccion'
    } else if (hasCreatedAt) {
      orderByColumn = 'created_at'
    } else if (hasUpdatedAt) {
      orderByColumn = 'updated_at'
    }

    console.log(`Usando columna para ORDER BY: ${orderByColumn}`)

    try {
      const testQuery = `
        SELECT 
          td.*,
          a.nombre as agente_nombre,
          e.nombre as edificio_nombre,
          d.numero as departamento_numero
        FROM transacciones_departamentos td
        LEFT JOIN administradores a ON td.agente_id = a.id
        LEFT JOIN departamentos d ON td.departamento_id = d.id
        LEFT JOIN edificios e ON d.edificio_id = e.id
        WHERE 1=1
        ORDER BY td.${orderByColumn} DESC
        LIMIT 5
      `

      const testResult = await client.query(testQuery)
      console.log(`✅ Query exitosa: ${testResult.rows.length} resultados`)
      
      if (testResult.rows.length > 0) {
        console.log('Primer resultado:', testResult.rows[0])
      }
    } catch (error) {
      console.log(`❌ Error en query: ${error.message}`)
    }

    // 4. Mostrar la corrección necesaria
    console.log('\n4. 🔧 CORRECCIÓN NECESARIA')
    console.log('-------------------------')
    console.log('En el archivo app/api/sales-rentals/transactions/route.ts:')
    console.log(`Cambiar: ORDER BY td.fecha_registro DESC`)
    console.log(`Por: ORDER BY td.${orderByColumn} DESC`)

    console.log('\n🎉 Diagnóstico completado')
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar diagnóstico
quickFix().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 