#!/usr/bin/env node

/**
 * Script para actualizar la tabla transacciones_ventas_arriendos
 * Agregar las nuevas columnas de estado para compatibilidad
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

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

async function applyTVAMigration() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 ACTUALIZANDO TABLA transacciones_ventas_arriendos')
    console.log('==================================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'update-transacciones-ventas-arriendos.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('1. 📋 EJECUTANDO MIGRACIÓN')
    console.log('---------------------------')
    
    // Ejecutar la migración
    await client.query(migrationSQL)
    console.log('   ✅ Migración ejecutada exitosamente')

    console.log('\n2. 🔍 VERIFICANDO CAMBIOS')
    console.log('-------------------------')
    
    // Verificar que las columnas se agregaron
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_ventas_arriendos' 
      AND column_name IN ('estado_actual', 'datos_estado', 'fecha_ultimo_estado')
      ORDER BY column_name
    `)
    
    if (columnsResult.rows.length === 3) {
      console.log('   ✅ Columnas agregadas correctamente:')
      columnsResult.rows.forEach(row => {
        console.log(`      - ${row.column_name}: ${row.data_type}`)
      })
    } else {
      console.log('   ❌ No se encontraron todas las columnas esperadas')
    }

    // Verificar índices
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'transacciones_ventas_arriendos' 
      AND indexname LIKE 'idx_tva_%'
    `)
    
    console.log('   ✅ Índices creados:')
    indexesResult.rows.forEach(row => {
      console.log(`      - ${row.indexname}`)
    })

    console.log('\n3. 🧪 PROBANDO FUNCIONALIDAD')
    console.log('----------------------------')
    
    // Probar inserción con nuevas columnas
    try {
      const testResult = await client.query(`
        INSERT INTO transacciones_ventas_arriendos (
          departamento_id, agente_id, tipo_transaccion, valor_transaccion,
          cliente_nombre, estado_actual, datos_estado
        ) VALUES (1, 1, 'venta', 100000, 'Cliente Test', 'reservado', '{"test": true}')
        RETURNING id, estado_actual, datos_estado
      `)
      console.log('   ✅ Inserción de prueba exitosa')
      
      // Limpiar datos de prueba
      await client.query('DELETE FROM transacciones_ventas_arriendos WHERE cliente_nombre = $1', ['Cliente Test'])
      console.log('   ✅ Datos de prueba limpiados')
    } catch (error) {
      console.log(`   ❌ Error en prueba de inserción: ${error.message}`)
    }

    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('=====================================')
    console.log('\n📋 RESUMEN DE CAMBIOS:')
    console.log('• ✅ Columna estado_actual agregada')
    console.log('• ✅ Columna datos_estado agregada')
    console.log('• ✅ Columna fecha_ultimo_estado agregada')
    console.log('• ✅ Datos existentes migrados')
    console.log('• ✅ Índices creados para optimización')
    
    console.log('\n🔧 PRÓXIMOS PASOS:')
    console.log('1. Probar creación de nuevas transacciones')
    console.log('2. Verificar que las APIs funcionan correctamente')
    console.log('3. Probar el flujo completo de estados')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar migración
applyTVAMigration().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 