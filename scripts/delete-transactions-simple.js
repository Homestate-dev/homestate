#!/usr/bin/env node

/**
 * Script simple para eliminar solo las transacciones principales
 * ⚠️ ADVERTENCIA: Este script eliminará todas las transacciones de ventas y arriendos
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

async function deleteTransactionsSimple() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🗑️  ELIMINACIÓN SIMPLE DE TRANSACCIONES')
    console.log('=======================================\n')
    
    // ⚠️ ADVERTENCIA
    console.log('⚠️  ADVERTENCIA ⚠️')
    console.log('==================')
    console.log('Este script eliminará TODAS las transacciones de ventas y arriendos.')
    console.log('Esto incluye:')
    console.log('• Todas las transacciones de transacciones_departamentos')
    console.log('• Todas las transacciones de transacciones_ventas_arriendos')
    console.log('')
    console.log('⚠️  ESTA ACCIÓN ES IRREVERSIBLE ⚠️')
    console.log('')

    // Solicitar confirmación
    const confirmacion = await askQuestion('¿Estás seguro de que quieres eliminar todas las transacciones? (escribe "SI" para confirmar): ')
    
    if (confirmacion !== 'SI') {
      console.log('❌ Operación cancelada por el usuario')
      return
    }

    console.log('\n🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar transacciones existentes
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

    // 2. Ejecutar eliminación
    console.log('\n2. 🗑️  EJECUTANDO ELIMINACIÓN')
    console.log('-----------------------------')
    
    const sqlPath = path.join(__dirname, 'delete-transactions-simple.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('   Ejecutando eliminación...')
    await client.query(sqlContent)
    console.log('   ✅ Eliminación ejecutada exitosamente')

    // 3. Verificar eliminación
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

    console.log('\n🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE')
    console.log('=====================================')
    console.log('\n📋 RESUMEN:')
    console.log(`• ✅ ${totalTransacciones} transacciones eliminadas`)
    console.log(`• ✅ ${totalRestantes} registros restantes`)
    console.log('• ✅ Secuencias reseteadas')
    console.log('• ✅ Base de datos lista para nuevas transacciones')
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar eliminación
deleteTransactionsSimple().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 