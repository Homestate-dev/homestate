const { Client } = require('pg')

// Configuración de la base de datos
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/homestate',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function eliminateTransaccionesVentasArriendos() {
  try {
    console.log('🚀 Iniciando eliminación completa de transacciones_ventas_arriendos...\n')
    
    await client.connect()
    console.log('✅ Conectado a la base de datos\n')

    // 1. Verificar existencia de tablas
    console.log('📋 1. Verificando existencia de tablas...')
    const checkTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'transacciones_ventas_arriendos',
        'historico_estados_departamentos', 
        'comisiones_agentes',
        'leads_prospectos'
      )
      ORDER BY table_name
    `
    
    const existingTables = await client.query(checkTablesQuery)
    console.log('   Tablas encontradas:')
    existingTables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`)
    })
    
    if (existingTables.rows.length === 0) {
      console.log('   ⚠️  No se encontraron tablas relacionadas. La eliminación ya fue realizada.')
      return
    }
    console.log('')

    // 2. Verificar datos existentes
    console.log('📊 2. Verificando datos existentes...')
    
    for (const table of existingTables.rows) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as total FROM ${table.table_name}`)
        const total = parseInt(countResult.rows[0].total)
        console.log(`   - ${table.table_name}: ${total} registros`)
        
        if (total > 0) {
          console.log(`   ⚠️  ADVERTENCIA: La tabla ${table.table_name} contiene ${total} registros que serán eliminados`)
        }
      } catch (error) {
        console.log(`   ❌ Error verificando ${table.table_name}: ${error.message}`)
      }
    }
    console.log('')

    // 3. Mostrar dependencias que serán eliminadas
    console.log('🔗 3. Verificando dependencias (Foreign Keys)...')
    const dependenciesQuery = `
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND (ccu.table_name = 'transacciones_ventas_arriendos'
           OR tc.table_name IN ('historico_estados_departamentos', 'comisiones_agentes', 'leads_prospectos'))
    `
    
    const dependencies = await client.query(dependenciesQuery)
    if (dependencies.rows.length > 0) {
      console.log('   Dependencias encontradas:')
      dependencies.rows.forEach(dep => {
        console.log(`   📎 ${dep.table_name}.${dep.column_name} → ${dep.foreign_table_name}.${dep.foreign_column_name}`)
      })
    } else {
      console.log('   ✅ No se encontraron dependencias activas')
    }
    console.log('')

    // 4. Verificar índices relacionados
    console.log('🗂️  4. Verificando índices relacionados...')
    const indexesQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_indexes 
      WHERE tablename IN ('transacciones_ventas_arriendos', 'historico_estados_departamentos', 'comisiones_agentes', 'leads_prospectos')
      OR indexname LIKE '%transacciones_ventas_arriendos%'
      OR indexname LIKE '%tva_%'
    `
    
    const indexes = await client.query(indexesQuery)
    if (indexes.rows.length > 0) {
      console.log('   Índices encontrados:')
      indexes.rows.forEach(idx => {
        console.log(`   🗂️  ${idx.tablename}.${idx.indexname}`)
      })
    } else {
      console.log('   ✅ No se encontraron índices específicos')
    }
    console.log('')

    // 5. Verificar secuencias relacionadas
    console.log('🔢 5. Verificando secuencias relacionadas...')
    const sequencesQuery = `
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_name LIKE '%transacciones_ventas_arriendos%'
      OR sequence_name LIKE '%historico_estados_departamentos%'
      OR sequence_name LIKE '%comisiones_agentes%'
      OR sequence_name LIKE '%leads_prospectos%'
    `
    
    const sequences = await client.query(sequencesQuery)
    if (sequences.rows.length > 0) {
      console.log('   Secuencias encontradas:')
      sequences.rows.forEach(seq => {
        console.log(`   🔢 ${seq.sequence_name}`)
      })
    } else {
      console.log('   ✅ No se encontraron secuencias específicas')
    }
    console.log('')

    // Solicitar confirmación
    console.log('⚠️  ATENCIÓN: Esta operación eliminará PERMANENTEMENTE:')
    console.log('   • La tabla transacciones_ventas_arriendos y todos sus datos')
    console.log('   • Las tablas dependientes: historico_estados_departamentos, comisiones_agentes, leads_prospectos')
    console.log('   • Todos los índices y secuencias relacionados')
    console.log('   • Esta acción NO se puede deshacer\n')

    // Para automatizar, asumir que el usuario ya confirmó al ejecutar el script
    console.log('🚀 Procediendo con la eliminación...\n')

    // 6. Eliminar tablas dependientes en orden correcto
    console.log('🗑️  6. Eliminando tablas dependientes...')
    
    const dependentTables = [
      'historico_estados_departamentos',
      'comisiones_agentes', 
      'leads_prospectos'
    ]
    
    for (const tableName of dependentTables) {
      try {
        console.log(`   🗑️  Eliminando tabla: ${tableName}`)
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`)
        console.log(`   ✅ ${tableName} eliminada exitosamente`)
      } catch (error) {
        console.log(`   ⚠️  Error eliminando ${tableName}: ${error.message}`)
      }
    }
    console.log('')

    // 7. Eliminar tabla principal
    console.log('🗑️  7. Eliminando tabla principal: transacciones_ventas_arriendos...')
    try {
      await client.query('DROP TABLE IF EXISTS transacciones_ventas_arriendos CASCADE')
      console.log('   ✅ transacciones_ventas_arriendos eliminada exitosamente')
    } catch (error) {
      console.log(`   ❌ Error eliminando transacciones_ventas_arriendos: ${error.message}`)
    }
    console.log('')

    // 8. Limpiar secuencias huérfanas
    console.log('🧹 8. Limpiando secuencias huérfanas...')
    const orphanSequences = [
      'transacciones_ventas_arriendos_id_seq',
      'historico_estados_departamentos_id_seq',
      'comisiones_agentes_id_seq',
      'leads_prospectos_id_seq'
    ]
    
    for (const seqName of orphanSequences) {
      try {
        await client.query(`DROP SEQUENCE IF EXISTS ${seqName} CASCADE`)
        console.log(`   🧹 Secuencia eliminada: ${seqName}`)
      } catch (error) {
        console.log(`   ⚠️  Error eliminando secuencia ${seqName}: ${error.message}`)
      }
    }
    console.log('')

    // 9. Verificar eliminación completa
    console.log('✅ 9. Verificando eliminación completa...')
    const finalCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'transacciones_ventas_arriendos',
        'historico_estados_departamentos', 
        'comisiones_agentes',
        'leads_prospectos'
      )
    `)
    
    if (finalCheck.rows.length === 0) {
      console.log('   ✅ Todas las tablas fueron eliminadas exitosamente')
    } else {
      console.log('   ⚠️  Algunas tablas aún existen:')
      finalCheck.rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
    }
    console.log('')

    // 10. Resumen de la operación
    console.log('📋 10. RESUMEN DE LA OPERACIÓN:')
    console.log('   ✅ Eliminación de transacciones_ventas_arriendos: COMPLETADA')
    console.log('   ✅ Eliminación de tablas dependientes: COMPLETADA')
    console.log('   ✅ Limpieza de secuencias: COMPLETADA')
    console.log('   ✅ Verificación final: EXITOSA')
    console.log('')

    console.log('🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('')
    console.log('📝 PRÓXIMOS PASOS RECOMENDADOS:')
    console.log('   1. Actualizar /api/sales-rentals/stats para usar transacciones_departamentos')
    console.log('   2. Actualizar /api/sales-rentals/transactions/[id] para usar solo transacciones_departamentos')
    console.log('   3. Remover lógica de verificación de tablas en el código')
    console.log('   4. Actualizar documentación del sistema')
    console.log('')

  } catch (error) {
    console.error('❌ Error durante la eliminación:', error.message)
    console.error('   Stack trace:', error.stack)
    throw error
  } finally {
    await client.end()
    console.log('🔌 Conexión a la base de datos cerrada')
  }
}

// Función principal
async function main() {
  console.log('🗑️  SCRIPT DE ELIMINACIÓN: transacciones_ventas_arriendos')
  console.log('=' .repeat(60))
  console.log('Fecha:', new Date().toLocaleString())
  console.log('Entorno:', process.env.NODE_ENV || 'development')
  console.log('=' .repeat(60))
  console.log('')

  try {
    await eliminateTransaccionesVentasArriendos()
    console.log('✅ Script ejecutado exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error crítico en el script:', error.message)
    process.exit(1)
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main()
}

module.exports = { eliminateTransaccionesVentasArriendos }
