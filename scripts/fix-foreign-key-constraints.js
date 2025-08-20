#!/usr/bin/env node

/**
 * Script para corregir las restricciones de clave foránea
 * que aún apuntan a la tabla agentes_inmobiliarios (deprecada)
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

async function fixForeignKeyConstraints() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 CORRECCIÓN DE RESTRICCIONES DE CLAVE FORÁNEA')
    console.log('================================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. VERIFICAR RESTRICCIONES EXISTENTES
    console.log('1. 🔍 VERIFICANDO RESTRICCIONES EXISTENTES')
    console.log('-------------------------------------------')
    
    const existingConstraints = await client.query(`
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
          AND tc.table_name = 'transacciones_departamentos'
    `)
    
    console.log('   Restricciones encontradas en transacciones_departamentos:')
    existingConstraints.rows.forEach(constraint => {
      const isCorrect = constraint.foreign_table_name === 'administradores'
      const status = isCorrect ? '✅ Correcta' : '❌ Incorrecta'
      console.log(`   - ${constraint.constraint_name}: ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} ${status}`)
    })

    // 2. VERIFICAR RESTRICCIONES EN DEPARTAMENTOS
    console.log('\n2. 🔍 VERIFICANDO RESTRICCIONES EN DEPARTAMENTOS')
    console.log('------------------------------------------------')
    
    const deptConstraints = await client.query(`
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
          AND tc.table_name = 'departamentos'
    `)
    
    console.log('   Restricciones encontradas en departamentos:')
    deptConstraints.rows.forEach(constraint => {
      const isCorrect = constraint.foreign_table_name === 'administradores'
      const status = isCorrect ? '✅ Correcta' : '❌ Incorrecta'
      console.log(`   - ${constraint.constraint_name}: ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} ${status}`)
    })

    // 3. VERIFICAR QUE EXISTE EL ADMINISTRADOR ID 1
    console.log('\n3. 🔍 VERIFICANDO ADMINISTRADOR ID 1')
    console.log('-------------------------------------')
    
    // Primero verificar qué columnas existen en la tabla administradores
    const adminColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'administradores' 
      ORDER BY column_name
    `)
    
    console.log('   Columnas disponibles en administradores:')
    adminColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}`)
    })
    
    // Construir query dinámicamente basado en las columnas disponibles
    const hasEsAgente = adminColumns.rows.some(col => col.column_name === 'es_agente')
    const hasActivo = adminColumns.rows.some(col => col.column_name === 'activo')
    
    let adminQuery = 'SELECT id, nombre, email'
    if (hasEsAgente) adminQuery += ', es_agente'
    if (hasActivo) adminQuery += ', activo'
    adminQuery += ' FROM administradores WHERE id = 1'
    
    const admin1 = await client.query(adminQuery)
    
    if (admin1.rows.length > 0) {
      const admin = admin1.rows[0]
      console.log(`   ✅ Administrador ID 1 encontrado:`)
      console.log(`   - Nombre: ${admin.nombre}`)
      console.log(`   - Email: ${admin.email}`)
      if (hasEsAgente) console.log(`   - Es agente: ${admin.es_agente}`)
      if (hasActivo) console.log(`   - Activo: ${admin.activo}`)
    } else {
      console.log('   ❌ Administrador ID 1 NO encontrado')
      console.log('   ⚠️  Esto puede causar problemas con las transacciones existentes')
    }

    // 4. CORREGIR RESTRICCIONES EN TRANSACCIONES_DEPARTAMENTOS
    console.log('\n4. 🔧 CORRIGIENDO RESTRICCIONES EN TRANSACCIONES_DEPARTAMENTOS')
    console.log('----------------------------------------------------------------')
    
    // Buscar restricciones que apunten a agentes_inmobiliarios
    const wrongConstraints = existingConstraints.rows.filter(
      constraint => constraint.foreign_table_name === 'agentes_inmobiliarios'
    )
    
    if (wrongConstraints.length > 0) {
      console.log(`   🚨 Encontradas ${wrongConstraints.length} restricciones incorrectas`)
      
      for (const constraint of wrongConstraints) {
        console.log(`   🔧 Eliminando restricción: ${constraint.constraint_name}`)
        await client.query(`
          ALTER TABLE transacciones_departamentos 
          DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}
        `)
        console.log(`   ✅ Restricción ${constraint.constraint_name} eliminada`)
      }
      
      // Crear nueva restricción correcta
      console.log('   🔧 Creando nueva restricción correcta...')
      await client.query(`
        ALTER TABLE transacciones_departamentos 
        ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
        FOREIGN KEY (agente_id) REFERENCES administradores(id)
      `)
      console.log('   ✅ Nueva restricción creada: agente_id → administradores(id)')
    } else {
      console.log('   ✅ No hay restricciones incorrectas que corregir')
    }

    // 5. CORREGIR RESTRICCIONES EN DEPARTAMENTOS (si es necesario)
    console.log('\n5. 🔧 CORRIGIENDO RESTRICCIONES EN DEPARTAMENTOS')
    console.log('--------------------------------------------------')
    
    const wrongDeptConstraints = deptConstraints.rows.filter(
      constraint => constraint.foreign_table_name === 'agentes_inmobiliarios'
    )
    
    if (wrongDeptConstraints.length > 0) {
      console.log(`   🚨 Encontradas ${wrongDeptConstraints.length} restricciones incorrectas`)
      
      for (const constraint of wrongDeptConstraints) {
        console.log(`   🔧 Eliminando restricción: ${constraint.constraint_name}`)
        await client.query(`
          ALTER TABLE departamentos 
          DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}
        `)
        console.log(`   ✅ Restricción ${constraint.constraint_name} eliminada`)
        
        // Crear nueva restricción correcta
        const newConstraintName = constraint.constraint_name.replace('agentes_inmobiliarios', 'administradores')
        console.log(`   🔧 Creando nueva restricción: ${newConstraintName}`)
        
        await client.query(`
          ALTER TABLE departamentos 
          ADD CONSTRAINT ${newConstraintName}
          FOREIGN KEY (${constraint.column_name}) REFERENCES administradores(id)
        `)
        console.log(`   ✅ Nueva restricción creada: ${constraint.column_name} → administradores(id)`)
      }
    } else {
      console.log('   ✅ No hay restricciones incorrectas que corregir')
    }

    // 6. VERIFICAR CORRECCIONES
    console.log('\n6. ✅ VERIFICANDO CORRECCIONES')
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
    `)
    
    console.log('   Estado final de las restricciones:')
    finalConstraints.rows.forEach(constraint => {
      const isCorrect = constraint.foreign_table_name === 'administradores'
      const status = isCorrect ? '✅ Correcta' : '❌ Incorrecta'
      console.log(`   - ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name} ${status}`)
    })

    // 7. VERIFICAR QUE NO HAY REFERENCIAS ROTAS
    console.log('\n7. 🔍 VERIFICANDO REFERENCIAS ROTAS')
    console.log('-------------------------------------')
    
    const brokenRefs = await client.query(`
      SELECT 
          t.id,
          t.agente_id,
          'transacciones_departamentos' as tabla
      FROM transacciones_departamentos t
      LEFT JOIN administradores a ON t.agente_id = a.id
      WHERE a.id IS NULL
      UNION ALL
      SELECT 
          d.id,
          d.agente_venta_id as agente_id,
          'departamentos (venta)' as tabla
      FROM departamentos d
      LEFT JOIN administradores a ON d.agente_venta_id = a.id
      WHERE d.agente_venta_id IS NOT NULL AND a.id IS NULL
      UNION ALL
      SELECT 
          d.id,
          d.agente_arriendo_id as agente_id,
          'departamentos (arriendo)' as tabla
      FROM departamentos d
      LEFT JOIN administradores a ON d.agente_arriendo_id = a.id
      WHERE d.agente_arriendo_id IS NOT NULL AND a.id IS NULL
    `)
    
    if (brokenRefs.rows.length > 0) {
      console.log(`   ⚠️  Encontradas ${brokenRefs.rows.length} referencias rotas:`)
      brokenRefs.rows.forEach(ref => {
        console.log(`   - ${ref.tabla} ID ${ref.id}: agente_id ${ref.agente_id} no existe en administradores`)
      })
      console.log('   🔧 Se recomienda limpiar estas referencias antes de continuar')
    } else {
      console.log('   ✅ No hay referencias rotas')
    }

    // 8. RESUMEN FINAL
    console.log('\n8. 📋 RESUMEN DE LA CORRECCIÓN')
    console.log('--------------------------------')
    
    const totalFixed = wrongConstraints.length + wrongDeptConstraints.length
    
    if (totalFixed > 0) {
      console.log(`   🎯 Restricciones corregidas: ${totalFixed}`)
      console.log(`   - transacciones_departamentos: ${wrongConstraints.length}`)
      console.log(`   - departamentos: ${wrongDeptConstraints.length}`)
      console.log('   ✅ Las transacciones ahora deberían funcionar correctamente')
    } else {
      console.log('   ℹ️  No se encontraron restricciones que corregir')
      console.log('   ✅ El sistema ya estaba configurado correctamente')
    }
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE')
    console.log('=====================================')
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar corrección
fixForeignKeyConstraints().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
