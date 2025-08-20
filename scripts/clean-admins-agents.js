#!/usr/bin/env node

/**
 * Script para limpiar completamente las tablas de administradores y agentes
 * ⚠️ ADVERTENCIA: Este script eliminará TODOS los usuarios excepto homestate.dev@gmail.com
 * 
 * OBJETIVO:
 * 1. Mantener SOLO el administrador principal (homestate.dev@gmail.com)
 * 2. Eliminar TODOS los demás administradores
 * 3. Eliminar TODOS los agentes inmobiliarios
 * 4. Limpiar referencias y secuencias
 */

const { Client } = require('pg')
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

async function cleanAdminsAndAgents() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🧹 LIMPIEZA COMPLETA DE ADMINISTRADORES Y AGENTES')
    console.log('================================================\n')
    
    // ⚠️ ADVERTENCIA IMPORTANTE
    console.log('⚠️  ADVERTENCIA CRÍTICA ⚠️')
    console.log('========================')
    console.log('Este script realizará una limpieza COMPLETA del sistema:')
    console.log('')
    console.log('🔴 ELIMINARÁ:')
    console.log('• Todos los administradores EXCEPTO homestate.dev@gmail.com')
    console.log('• TODOS los agentes inmobiliarios')
    console.log('• Todas las referencias y secuencias relacionadas')
    console.log('')
    console.log('🟢 MANTENDRÁ:')
    console.log('• ÚNICAMENTE el administrador principal (homestate.dev@gmail.com)')
    console.log('')
    console.log('⚠️  ESTA ACCIÓN ES IRREVERSIBLE ⚠️')
    console.log('')

    // Solicitar confirmación
    const confirmacion = await askQuestion('¿Estás seguro de que quieres realizar esta limpieza COMPLETA? (escribe "LIMPIAR" para confirmar): ')
    
    if (confirmacion !== 'LIMPIAR') {
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

    // 1. Verificar estado actual
    console.log('1. 📊 VERIFICANDO ESTADO ACTUAL')
    console.log('--------------------------------')
    
    // Contar administradores
    const adminCountResult = await client.query(`
      SELECT COUNT(*) as total FROM administradores
    `)
    const totalAdmins = parseInt(adminCountResult.rows[0].total)
    
    // Contar agentes
    const agentCountResult = await client.query(`
      SELECT COUNT(*) as total FROM agentes_inmobiliarios
    `)
    const totalAgents = parseInt(agentCountResult.rows[0].total)
    
    // Verificar si existe homestate.dev@gmail.com
    const mainAdminResult = await client.query(`
      SELECT id, nombre, email FROM administradores WHERE email = 'homestate.dev@gmail.com'
    `)
    const mainAdminExists = mainAdminResult.rows.length > 0
    
    console.log(`   Administradores actuales: ${totalAdmins}`)
    console.log(`   Agentes inmobiliarios: ${totalAgents}`)
    console.log(`   Administrador principal existe: ${mainAdminExists ? '✅ SÍ' : '❌ NO'}`)
    
    if (!mainAdminExists) {
      console.log('\n❌ ERROR: No se encontró el administrador principal (homestate.dev@gmail.com)')
      console.log('   No se puede proceder sin el administrador principal')
      return
    }

    // 2. Limpiar tabla de agentes inmobiliarios
    console.log('\n2. 🗑️  LIMPIANDO TABLA DE AGENTES')
    console.log('----------------------------------')
    
    if (totalAgents > 0) {
      console.log(`   Eliminando ${totalAgents} agentes inmobiliarios...`)
      
      // Eliminar todos los agentes
      await client.query('DELETE FROM agentes_inmobiliarios')
      
      // Resetear secuencia
      await client.query(`
        ALTER SEQUENCE IF EXISTS agentes_inmobiliarios_id_seq RESTART WITH 1
      `)
      
      console.log('   ✅ Tabla de agentes limpiada completamente')
    } else {
      console.log('   ✅ No hay agentes para eliminar')
    }

    // 3. Limpiar tabla de administradores
    console.log('\n3. 🗑️  LIMPIANDO TABLA DE ADMINISTRADORES')
    console.log('-------------------------------------------')
    
    if (totalAdmins > 1) {
      const adminsToDelete = totalAdmins - 1
      console.log(`   Eliminando ${adminsToDelete} administradores (manteniendo solo homestate.dev@gmail.com)...`)
      
      // Eliminar todos los administradores excepto el principal
      await client.query(`
        DELETE FROM administradores 
        WHERE email != 'homestate.dev@gmail.com'
      `)
      
      // Resetear secuencia
      await client.query(`
        ALTER SEQUENCE IF EXISTS administradores_id_seq RESTART WITH 1
      `)
      
      console.log('   ✅ Tabla de administradores limpiada (solo queda homestate.dev@gmail.com)')
    } else {
      console.log('   ✅ Solo existe el administrador principal')
    }

    // 4. Verificar estado final
    console.log('\n4. ✅ VERIFICANDO ESTADO FINAL')
    console.log('-------------------------------')
    
    // Contar administradores finales
    const finalAdminCount = await client.query(`
      SELECT COUNT(*) as total FROM administradores
    `)
    
    // Contar agentes finales
    const finalAgentCount = await client.query(`
      SELECT COUNT(*) as total FROM agentes_inmobiliarios
    `)
    
    // Verificar administrador principal
    const finalMainAdmin = await client.query(`
      SELECT id, nombre, email, activo FROM administradores WHERE email = 'homestate.dev@gmail.com'
    `)
    
    console.log('   Estado final:')
    console.log(`   - Administradores restantes: ${finalAdminCount.rows[0].total}`)
    console.log(`   - Agentes restantes: ${finalAgentCount.rows[0].total}`)
    
    if (finalMainAdmin.rows.length > 0) {
      const admin = finalMainAdmin.rows[0]
      console.log(`   - Administrador principal: ${admin.nombre} (${admin.email}) - Activo: ${admin.activo}`)
    }
    
    // 5. Verificar secuencias
    console.log('\n5. 🔄 VERIFICANDO SECUENCIAS')
    console.log('----------------------------')
    
    const sequencesResult = await client.query(`
      SELECT 
        sequence_name,
        last_value
      FROM information_schema.sequences 
      WHERE sequence_name IN (
        'administradores_id_seq',
        'agentes_inmobiliarios_id_seq'
      )
    `)
    
    console.log('   Secuencias reseteadas:')
    sequencesResult.rows.forEach(row => {
      console.log(`   - ${row.sequence_name}: ${row.last_value}`)
    })

    console.log('\n🎉 LIMPIEZA COMPLETADA EXITOSAMENTE')
    console.log('==================================')
    console.log('\n📋 RESUMEN:')
    console.log(`• ✅ Administradores eliminados: ${totalAdmins - 1}`)
    console.log(`• ✅ Agentes eliminados: ${totalAgents}`)
    console.log(`• ✅ Administrador principal mantenido: homestate.dev@gmail.com`)
    console.log(`• ✅ Secuencias reseteadas`)
    console.log(`• ✅ Base de datos limpia y lista para uso`)
    
    console.log('\n🔧 PRÓXIMOS PASOS:')
    console.log('1. Verificar que el sistema funciona correctamente')
    console.log('2. Crear nuevos administradores según sea necesario')
    console.log('3. Configurar nuevos agentes si se requieren')
    console.log('4. Verificar que las funcionalidades básicas operan correctamente')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar limpieza
cleanAdminsAndAgents().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
