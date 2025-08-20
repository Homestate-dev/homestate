#!/usr/bin/env node

/**
 * Script SIMPLE para corregir las restricciones de clave foránea
 * que apuntan a la tabla agentes_inmobiliarios (deprecada)
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

async function fixForeignKeysSimple() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 CORRECCIÓN SIMPLE DE RESTRICCIONES DE CLAVE FORÁNEA')
    console.log('========================================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // PASO 1: ELIMINAR RESTRICCIONES INCORRECTAS
    console.log('1. 🗑️  ELIMINANDO RESTRICCIONES INCORRECTAS')
    console.log('--------------------------------------------')
    
    try {
      await client.query(`
        ALTER TABLE transacciones_departamentos 
        DROP CONSTRAINT IF EXISTS transacciones_departamentos_agente_id_fkey
      `)
      console.log('   ✅ Restricción transacciones_departamentos.agente_id eliminada')
    } catch (error) {
      console.log(`   ⚠️  Error al eliminar restricción: ${error.message}`)
    }

    try {
      await client.query(`
        ALTER TABLE departamentos 
        DROP CONSTRAINT IF EXISTS departamentos_agente_venta_id_fkey
      `)
      console.log('   ✅ Restricción departamentos.agente_venta_id eliminada')
    } catch (error) {
      console.log(`   ⚠️  Error al eliminar restricción: ${error.message}`)
    }

    try {
      await client.query(`
        ALTER TABLE departamentos 
        DROP CONSTRAINT IF EXISTS departamentos_agente_arriendo_id_fkey
      `)
      console.log('   ✅ Restricción departamentos.agente_arriendo_id eliminada')
    } catch (error) {
      console.log(`   ⚠️  Error al eliminar restricción: ${error.message}`)
    }

    // PASO 2: CREAR NUEVAS RESTRICCIONES CORRECTAS
    console.log('\n2. 🔧 CREANDO NUEVAS RESTRICCIONES CORRECTAS')
    console.log('----------------------------------------------')
    
    try {
      await client.query(`
        ALTER TABLE transacciones_departamentos 
        ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
        FOREIGN KEY (agente_id) REFERENCES administradores(id)
      `)
      console.log('   ✅ Nueva restricción: agente_id → administradores(id)')
    } catch (error) {
      console.log(`   ❌ Error al crear restricción: ${error.message}`)
    }

    try {
      await client.query(`
        ALTER TABLE departamentos 
        ADD CONSTRAINT departamentos_agente_venta_id_fkey 
        FOREIGN KEY (agente_venta_id) REFERENCES administradores(id)
      `)
      console.log('   ✅ Nueva restricción: agente_venta_id → administradores(id)')
    } catch (error) {
      console.log(`   ❌ Error al crear restricción: ${error.message}`)
    }

    try {
      await client.query(`
        ALTER TABLE departamentos 
        ADD CONSTRAINT departamentos_agente_arriendo_id_fkey 
        FOREIGN KEY (agente_arriendo_id) REFERENCES administradores(id)
      `)
      console.log('   ✅ Nueva restricción: agente_arriendo_id → administradores(id)')
    } catch (error) {
      console.log(`   ❌ Error al crear restricción: ${error.message}`)
    }

    // PASO 3: VERIFICAR CORRECCIONES
    console.log('\n3. ✅ VERIFICANDO CORRECCIONES')
    console.log('--------------------------------')
    
    const finalConstraints = await client.query(`
      SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          tc.constraint_name
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND (tc.table_name = 'transacciones_departamentos' OR tc.table_name = 'departamentos')
          AND (kcu.column_name LIKE '%agente%' OR kcu.column_name = 'departamento_id')
    `)
    
    console.log('   Estado final de las restricciones de agentes:')
    finalConstraints.rows.forEach(constraint => {
      const isCorrect = constraint.foreign_table_name === 'administradores'
      const status = isCorrect ? '✅ Correcta' : '❌ Incorrecta'
      console.log(`   - ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} ${status}`)
    })

    // PASO 4: VERIFICAR ADMINISTRADOR ID 1
    console.log('\n4. 🔍 VERIFICANDO ADMINISTRADOR ID 1')
    console.log('-------------------------------------')
    
    const admin1 = await client.query(`
      SELECT id, nombre, email 
      FROM administradores 
      WHERE id = 1
    `)
    
    if (admin1.rows.length > 0) {
      const admin = admin1.rows[0]
      console.log(`   ✅ Administrador ID 1 encontrado:`)
      console.log(`   - Nombre: ${admin.nombre}`)
      console.log(`   - Email: ${admin.email}`)
    } else {
      console.log('   ❌ Administrador ID 1 NO encontrado')
      console.log('   ⚠️  Esto puede causar problemas con las transacciones existentes')
    }

    // PASO 5: RESUMEN FINAL
    console.log('\n5. 📋 RESUMEN DE LA CORRECCIÓN')
    console.log('--------------------------------')
    
    const correctConstraints = finalConstraints.rows.filter(
      constraint => constraint.foreign_table_name === 'administradores'
    ).length
    
    const totalConstraints = finalConstraints.rows.length
    
    console.log(`   📊 Restricciones de agentes: ${totalConstraints}`)
    console.log(`   ✅ Correctas: ${correctConstraints}`)
    console.log(`   ❌ Incorrectas: ${totalConstraints - correctConstraints}`)
    
    if (correctConstraints === totalConstraints && totalConstraints > 0) {
      console.log('\n   🎉 ¡TODAS LAS RESTRICCIONES HAN SIDO CORREGIDAS!')
      console.log('   ✅ Las transacciones ahora deberían funcionar correctamente')
    } else if (totalConstraints === 0) {
      console.log('\n   ⚠️  No se encontraron restricciones de agentes para verificar')
    } else {
      console.log('\n   ❌ Algunas restricciones siguen siendo incorrectas')
      console.log('   🔧 Revisa los errores anteriores')
    }
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA')
    console.log('========================')
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar corrección
fixForeignKeysSimple().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
