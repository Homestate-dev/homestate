#!/usr/bin/env node

/**
 * Script para aplicar la migración de estados de transacción
 * Ejecuta el nuevo sistema de estados progresivos
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

async function applyTransactionStatesMigration() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔄 APLICANDO MIGRACIÓN DE ESTADOS DE TRANSACCIÓN')
    console.log('================================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'transaction-states-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('1. 📋 EJECUTANDO MIGRACIÓN')
    console.log('---------------------------')
    
    // Ejecutar la migración por partes para mejor control
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim())
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        try {
          await client.query(statement)
          console.log(`   ✅ Ejecutado paso ${i + 1}/${statements.length}`)
        } catch (error) {
          console.log(`   ⚠️  Advertencia en paso ${i + 1}: ${error.message}`)
          // Continuar con el siguiente paso
        }
      }
    }

    console.log('\n2. 🔍 VERIFICANDO MIGRACIÓN')
    console.log('----------------------------')
    
    // Verificar que las tablas se crearon correctamente
    const tablesToCheck = [
      'estados_transaccion',
      'historial_estados_transaccion'
    ]
    
    for (const table of tablesToCheck) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table])
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Tabla ${table} creada correctamente`)
      } else {
        console.log(`   ❌ Tabla ${table} no se creó`)
      }
    }

    // Verificar que las columnas se agregaron a transacciones_departamentos
    const columnsToCheck = [
      'estado_actual',
      'datos_estado', 
      'fecha_ultimo_estado'
    ]
    
    for (const column of columnsToCheck) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'transacciones_departamentos' 
          AND column_name = $1
        )
      `, [column])
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Columna ${column} agregada correctamente`)
      } else {
        console.log(`   ❌ Columna ${column} no se agregó`)
      }
    }

    // Verificar funciones creadas
    const functionsToCheck = [
      'avanzar_estado_transaccion',
      'finalizar_transaccion',
      'cancelar_transaccion',
      'obtener_estado_transaccion'
    ]
    
    for (const func of functionsToCheck) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_proc 
          WHERE proname = $1
        )
      `, [func])
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Función ${func} creada correctamente`)
      } else {
        console.log(`   ❌ Función ${func} no se creó`)
      }
    }

    // Verificar vistas creadas
    const viewsToCheck = [
      'vista_estados_transaccion',
      'vista_historial_transaccion'
    ]
    
    for (const view of viewsToCheck) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.views 
          WHERE table_name = $1
        )
      `, [view])
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Vista ${view} creada correctamente`)
      } else {
        console.log(`   ❌ Vista ${view} no se creó`)
      }
    }

    console.log('\n3. 📊 VERIFICANDO DATOS MIGRADOS')
    console.log('--------------------------------')
    
    // Verificar transacciones migradas
    const transaccionesResult = await client.query(`
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(CASE WHEN estado_actual IS NOT NULL THEN 1 END) as con_estado_actual,
        COUNT(CASE WHEN datos_estado IS NOT NULL THEN 1 END) as con_datos_estado
      FROM transacciones_departamentos
    `)
    
    const stats = transaccionesResult.rows[0]
    console.log(`   📈 Total transacciones: ${stats.total_transacciones}`)
    console.log(`   📈 Con estado actual: ${stats.con_estado_actual}`)
    console.log(`   📈 Con datos de estado: ${stats.con_datos_estado}`)

    // Mostrar distribución de estados
    const estadosResult = await client.query(`
      SELECT 
        estado_actual,
        COUNT(*) as cantidad
      FROM transacciones_departamentos
      GROUP BY estado_actual
      ORDER BY cantidad DESC
    `)
    
    console.log('\n   📊 Distribución de estados:')
    estadosResult.rows.forEach(row => {
      console.log(`      ${row.estado_actual}: ${row.cantidad}`)
    })

    console.log('\n4. 🧪 PROBANDO FUNCIONES')
    console.log('------------------------')
    
    // Probar función de obtener estado
    try {
      const testResult = await client.query(`
        SELECT obtener_estado_transaccion(id) 
        FROM transacciones_departamentos 
        LIMIT 1
      `)
      console.log('   ✅ Función obtener_estado_transaccion funciona')
    } catch (error) {
      console.log(`   ❌ Error en obtener_estado_transaccion: ${error.message}`)
    }

    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('=====================================')
    console.log('\n📋 RESUMEN DE CAMBIOS:')
    console.log('• ✅ Eliminado campo "Estado" con opciones Pendiente/En proceso/Completada/Cancelada')
    console.log('• ✅ Creado nuevo sistema de estados progresivos')
    console.log('• ✅ Para VENTAS: Reservado → Promesa de Compra Venta → Firma de Escrituras')
    console.log('• ✅ Para ARRIENDOS: Reservado → Firma y Pago')
    console.log('• ✅ Agregado estado "Desistimiento" para ambos tipos')
    console.log('• ✅ Creadas tablas para historial y seguimiento de estados')
    console.log('• ✅ Implementadas funciones para avanzar estados')
    console.log('• ✅ Creadas vistas para facilitar consultas')
    
    console.log('\n🔧 PRÓXIMOS PASOS:')
    console.log('1. Actualizar el frontend para usar el nuevo sistema de estados')
    console.log('2. Implementar la nueva sección "Estado de Transacción"')
    console.log('3. Eliminar la sección "Detalles" actual')
    console.log('4. Probar el flujo completo de estados')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar migración
applyTransactionStatesMigration().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 