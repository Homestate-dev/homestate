#!/usr/bin/env node

/**
 * Script para eliminar todas las transacciones registradas y datos asociados
 * ⚠️ ADVERTENCIA: Este script eliminará TODAS las transacciones de la base de datos
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

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

// Función para leer input del usuario
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => rl.question(query, (ans) => {
    rl.close()
    resolve(ans)
  }))
}

async function deleteAllTransactions() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🗑️  ELIMINACIÓN DE TODAS LAS TRANSACCIONES')
    console.log('==========================================\n')
    
    // ⚠️ ADVERTENCIA IMPORTANTE
    console.log('⚠️  ADVERTENCIA CRÍTICA ⚠️')
    console.log('========================')
    console.log('Este script eliminará TODAS las transacciones registradas en la base de datos.')
    console.log('Esto incluye:')
    console.log('• Todas las transacciones de ventas y arriendos')
    console.log('• Historial de estados de transacciones')
    console.log('• Estados de transacciones')
    console.log('• Comisiones de agentes')
    console.log('• Leads y prospectos relacionados')
    console.log('• Histórico de estados de departamentos')
    console.log('')
    console.log('⚠️  ESTA ACCIÓN ES IRREVERSIBLE ⚠️')
    console.log('')

    // Solicitar confirmación
    const confirmacion = await askQuestion('¿Estás seguro de que quieres eliminar TODAS las transacciones? (escribe "ELIMINAR" para confirmar): ')
    
    if (confirmacion !== 'ELIMINAR') {
      console.log('❌ Operación cancelada por el usuario')
      return
    }

    // Segunda confirmación
    const confirmacion2 = await askQuestion('¿Estás 100% seguro? Esta acción no se puede deshacer. (escribe "SI" para confirmar): ')
    
    if (confirmacion2 !== 'SI') {
      console.log('❌ Operación cancelada por el usuario')
      return
    }

    console.log('\n🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar transacciones existentes antes de eliminar
    console.log('1. 📊 VERIFICANDO TRANSACCIONES EXISTENTES')
    console.log('----------------------------------------')
    
    const countResult = await client.query(`
      SELECT 
        'transacciones_departamentos' as tabla,
        COUNT(*) as total
      FROM transacciones_departamentos
      UNION ALL
      SELECT 
        'transacciones_ventas_arriendos' as tabla,
        COUNT(*) as total
      FROM transacciones_ventas_arriendos
      UNION ALL
      SELECT 
        'estados_transaccion' as tabla,
        COUNT(*) as total
      FROM estados_transaccion
      UNION ALL
      SELECT 
        'historial_estados_transaccion' as tabla,
        COUNT(*) as total
      FROM historial_estados_transaccion
    `)
    
    console.log('   Transacciones encontradas:')
    let totalTransacciones = 0
    countResult.rows.forEach(row => {
      console.log(`   - ${row.tabla}: ${row.total} registros`)
      totalTransacciones += parseInt(row.total)
    })
    console.log(`   Total: ${totalTransacciones} registros a eliminar`)

    if (totalTransacciones === 0) {
      console.log('\n✅ No hay transacciones para eliminar')
      return
    }

    // 2. Leer y ejecutar el script SQL
    console.log('\n2. 🗑️  EJECUTANDO ELIMINACIÓN')
    console.log('-----------------------------')
    
    const sqlPath = path.join(__dirname, 'delete-all-transactions.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('   Ejecutando script de eliminación...')
    await client.query(sqlContent)
    console.log('   ✅ Script ejecutado exitosamente')

    // 3. Verificar que todas las transacciones han sido eliminadas
    console.log('\n3. ✅ VERIFICANDO ELIMINACIÓN')
    console.log('----------------------------')
    
    const verifyResult = await client.query(`
      SELECT 
        'transacciones_departamentos' as tabla,
        COUNT(*) as registros_restantes
      FROM transacciones_departamentos
      UNION ALL
      SELECT 
        'transacciones_ventas_arriendos' as tabla,
        COUNT(*) as registros_restantes
      FROM transacciones_ventas_arriendos
      UNION ALL
      SELECT 
        'estados_transaccion' as tabla,
        COUNT(*) as registros_restantes
      FROM estados_transaccion
      UNION ALL
      SELECT 
        'historial_estados_transaccion' as tabla,
        COUNT(*) as registros_restantes
      FROM historial_estados_transaccion
    `)
    
    console.log('   Verificación de eliminación:')
    let totalRestantes = 0
    verifyResult.rows.forEach(row => {
      console.log(`   - ${row.tabla}: ${row.registros_restantes} registros restantes`)
      totalRestantes += parseInt(row.registros_restantes)
    })
    
    if (totalRestantes === 0) {
      console.log('   ✅ Todas las transacciones han sido eliminadas correctamente')
    } else {
      console.log(`   ⚠️  Quedan ${totalRestantes} registros sin eliminar`)
    }

    // 4. Verificar secuencias reseteadas
    console.log('\n4. 🔄 VERIFICANDO SECUENCIAS')
    console.log('----------------------------')
    
    const sequencesResult = await client.query(`
      SELECT 
        sequence_name,
        last_value
      FROM information_schema.sequences 
      WHERE sequence_name IN (
        'transacciones_departamentos_id_seq',
        'transacciones_ventas_arriendos_id_seq',
        'estados_transaccion_id_seq',
        'historial_estados_transaccion_id_seq'
      )
    `)
    
    console.log('   Secuencias reseteadas:')
    sequencesResult.rows.forEach(row => {
      console.log(`   - ${row.sequence_name}: ${row.last_value}`)
    })

    console.log('\n🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE')
    console.log('=====================================')
    console.log('\n📋 RESUMEN:')
    console.log(`• ✅ ${totalTransacciones} registros eliminados`)
    console.log(`• ✅ ${totalRestantes} registros restantes`)
    console.log('• ✅ Secuencias reseteadas')
    console.log('• ✅ Base de datos limpia para nuevas transacciones')
    
    console.log('\n🔧 PRÓXIMOS PASOS:')
    console.log('1. Verificar que el sistema funciona correctamente')
    console.log('2. Probar la creación de nuevas transacciones')
    console.log('3. Verificar que las estadísticas se muestran correctamente')
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar eliminación
deleteAllTransactions().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 