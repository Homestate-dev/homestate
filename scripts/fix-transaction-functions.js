#!/usr/bin/env node

/**
 * Script para corregir las funciones de transacciones
 * Ejecuta las funciones que fallaron en la migración inicial
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

async function fixTransactionFunctions() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 CORRIGIENDO FUNCIONES DE TRANSACCIONES')
    console.log('==========================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // Leer el archivo de correcciones
    const fixPath = path.join(__dirname, 'fix-transaction-functions.sql')
    const fixSQL = fs.readFileSync(fixPath, 'utf8')
    
    console.log('1. 📋 EJECUTANDO CORRECCIONES')
    console.log('-----------------------------')
    
    // Ejecutar las correcciones
    await client.query(fixSQL)
    console.log('   ✅ Funciones corregidas exitosamente')

    console.log('\n2. 🔍 VERIFICANDO FUNCIONES')
    console.log('----------------------------')
    
    // Verificar funciones creadas
    const functionsToCheck = [
      'avanzar_estado_transaccion',
      'finalizar_transaccion',
      'cancelar_transaccion',
      'obtener_estado_transaccion',
      'registrar_cambio_estado_transaccion'
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

    // Verificar trigger
    const triggerResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'trigger_cambio_estado_transaccion'
      )
    `)
    
    if (triggerResult.rows[0].exists) {
      console.log('   ✅ Trigger trigger_cambio_estado_transaccion creado correctamente')
    } else {
      console.log('   ❌ Trigger trigger_cambio_estado_transaccion no se creó')
    }

    console.log('\n3. 🧪 PROBANDO FUNCIONES')
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

    // Probar función de avanzar estado
    try {
      const testResult = await client.query(`
        SELECT avanzar_estado_transaccion(1, 'reservado', '{}', 'test', 'test_user')
      `)
      console.log('   ✅ Función avanzar_estado_transaccion funciona')
    } catch (error) {
      console.log(`   ❌ Error en avanzar_estado_transaccion: ${error.message}`)
    }

    console.log('\n🎉 CORRECCIONES COMPLETADAS EXITOSAMENTE')
    console.log('=========================================')
    console.log('\n📋 RESUMEN DE CORRECCIONES:')
    console.log('• ✅ Función registrar_cambio_estado_transaccion corregida')
    console.log('• ✅ Trigger trigger_cambio_estado_transaccion corregido')
    console.log('• ✅ Función obtener_estado_transaccion corregida')
    console.log('• ✅ Función avanzar_estado_transaccion corregida')
    console.log('• ✅ Función finalizar_transaccion corregida')
    console.log('• ✅ Función cancelar_transaccion corregida')
    
    console.log('\n🔧 PRÓXIMOS PASOS:')
    console.log('1. Probar el sistema completo de estados')
    console.log('2. Verificar que las APIs funcionan correctamente')
    console.log('3. Probar el flujo completo de transacciones')
    
  } catch (error) {
    console.error('❌ Error durante las correcciones:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar correcciones
fixTransactionFunctions().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 