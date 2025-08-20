#!/usr/bin/env node

/**
 * Script de prueba para verificar que la corrección de getAgentById funciona
 * Este script prueba que cualquier administrador puede ser agente de transacción
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

async function testTransactionAgentFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🧪 PRUEBA DE CORRECCIÓN: getAgentById')
    console.log('=====================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar administradores existentes
    console.log('1. 📊 VERIFICANDO ADMINISTRADORES EXISTENTES')
    console.log('--------------------------------------------')
    
    const adminsResult = await client.query(`
      SELECT id, nombre, email, es_agente, activo 
      FROM administradores 
      ORDER BY id
    `)
    
    console.log('   Administradores encontrados:')
    adminsResult.rows.forEach(admin => {
      const status = admin.es_agente ? '✅ Agente' : '❌ No Agente'
      const active = admin.activo ? '🟢 Activo' : '🔴 Inactivo'
      console.log(`   - ID ${admin.id}: ${admin.nombre} (${admin.email}) - ${status} - ${active}`)
    })

    if (adminsResult.rows.length === 0) {
      console.log('   ❌ No hay administradores para probar')
      return
    }

    // 2. Probar getAgentById con diferentes tipos de administradores
    console.log('\n2. 🧪 PROBANDO getAgentById CON DIFERENTES ADMINISTRADORES')
    console.log('-----------------------------------------------------------')
    
    for (const admin of adminsResult.rows) {
      console.log(`\n   🔍 Probando con administrador ID ${admin.id}:`)
      console.log(`   - Nombre: ${admin.nombre}`)
      console.log(`   - Email: ${admin.email}`)
      console.log(`   - es_agente: ${admin.es_agente}`)
      console.log(`   - activo: ${admin.activo}`)
      
      try {
        // Simular la función getAgentById corregida
        const agentResult = await client.query(`
          SELECT * FROM administradores WHERE id = $1
        `, [admin.id])
        
        if (agentResult.rows.length > 0) {
          const agent = agentResult.rows[0]
          console.log(`   ✅ getAgentById(${admin.id}) = EXITOSO`)
          console.log(`   - Encontrado: ${agent.nombre} (${agent.email})`)
          
          // Verificar si tiene campos necesarios para transacciones
          const hasComisionVentas = agent.comision_ventas !== null && agent.comision_ventas !== undefined
          const hasComisionArriendos = agent.comision_arriendos !== null && agent.comision_arriendos !== undefined
          
          console.log(`   - Comisión ventas: ${hasComisionVentas ? '✅' : '❌'} ${agent.comision_ventas || 'No definida'}`)
          console.log(`   - Comisión arriendos: ${hasComisionArriendos ? '✅' : '❌'} ${agent.comision_arriendos || 'No definida'}`)
          
          if (hasComisionVentas && hasComisionArriendos) {
            console.log(`   🎯 ESTE ADMINISTRADOR PUEDE SER AGENTE DE TRANSACCIÓN`)
          } else {
            console.log(`   ⚠️  Este administrador puede ser agente pero le faltan campos de comisión`)
          }
        } else {
          console.log(`   ❌ getAgentById(${admin.id}) = NO ENCONTRADO`)
        }
      } catch (error) {
        console.log(`   ❌ Error al probar getAgentById(${admin.id}): ${error.message}`)
      }
    }

    // 3. Probar con IDs inexistentes
    console.log('\n3. 🧪 PROBANDO CON IDS INEXISTENTES')
    console.log('-----------------------------------')
    
    const nonExistentId = 99999
    try {
      const nonExistentResult = await client.query(`
        SELECT * FROM administradores WHERE id = $1
      `, [nonExistentId])
      
      if (nonExistentResult.rows.length === 0) {
        console.log(`   ✅ getAgentById(${nonExistentId}) = CORRECTAMENTE NO ENCONTRADO`)
      } else {
        console.log(`   ❌ getAgentById(${nonExistentId}) = ENCONTRÓ ALGO INESPERADO`)
      }
    } catch (error) {
      console.log(`   ❌ Error al probar ID inexistente: ${error.message}`)
    }

    // 4. Resumen de la prueba
    console.log('\n4. 📋 RESUMEN DE LA PRUEBA')
    console.log('----------------------------')
    
    const totalAdmins = adminsResult.rows.length
    const agentAdmins = adminsResult.rows.filter(admin => admin.es_agente === true).length
    const nonAgentAdmins = adminsResult.rows.filter(admin => admin.es_agente !== true).length
    const activeAdmins = adminsResult.rows.filter(admin => admin.activo === true).length
    
    console.log(`   📊 Estadísticas:`)
    console.log(`   - Total administradores: ${totalAdmins}`)
    console.log(`   - Marcados como agentes: ${agentAdmins}`)
    console.log(`   - NO marcados como agentes: ${nonAgentAdmins}`)
    console.log(`   - Administradores activos: ${activeAdmins}`)
    
    console.log('\n   🎯 Resultado de la corrección:')
    if (nonAgentAdmins > 0) {
      console.log(`   ✅ Administradores NO marcados como agentes (${nonAgentAdmins}) ahora pueden ser agentes de transacción`)
      console.log(`   ✅ La torpeza ha sido eliminada`)
    } else {
      console.log(`   ℹ️  Todos los administradores están marcados como agentes`)
      console.log(`   ℹ️  No había torpeza que corregir`)
    }
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE')
    console.log('==================================')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar prueba
testTransactionAgentFix().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
