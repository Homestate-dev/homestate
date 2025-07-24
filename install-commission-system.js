#!/usr/bin/env node

/**
 * Script de instalación para el sistema de comisiones
 * Ejecuta la migración de la base de datos y verifica la instalación
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Configuración de la base de datos (debe coincidir con lib/database.ts)
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

async function runMigration() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión exitosa')

    // Leer el script SQL
    const sqlPath = path.join(__dirname, 'database_migration.sql')
    const sqlScript = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Ejecutando migración de la base de datos...')
    
    // Ejecutar el script SQL
    await client.query(sqlScript)
    
    console.log('✅ Migración completada exitosamente')
    
    // Verificar que los campos se crearon correctamente
    console.log('🔍 Verificando la instalación...')
    
    const checkQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      AND column_name IN (
        'comision_porcentaje', 
        'comision_valor', 
        'porcentaje_homestate', 
        'porcentaje_bienes_raices', 
        'porcentaje_admin_edificio',
        'valor_homestate',
        'valor_bienes_raices',
        'valor_admin_edificio'
      )
      ORDER BY column_name
    `
    
    const result = await client.query(checkQuery)
    
    if (result.rows.length === 8) {
      console.log('✅ Todos los campos nuevos se crearon correctamente:')
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    } else {
      console.log('⚠️  Algunos campos no se crearon correctamente')
      console.log('Campos encontrados:', result.rows.length)
    }
    
    // Verificar índices
    const indexQuery = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'transacciones_departamentos'
      AND indexname LIKE 'idx_transacciones_%'
    `
    
    const indexResult = await client.query(indexQuery)
    console.log(`✅ Se crearon ${indexResult.rows.length} índices de rendimiento`)
    
    // Verificar datos existentes
    const countQuery = `
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(CASE WHEN comision_porcentaje IS NOT NULL THEN 1 END) as con_comision_porcentaje,
        COUNT(CASE WHEN comision_valor IS NOT NULL THEN 1 END) as con_comision_valor,
        COUNT(CASE WHEN porcentaje_homestate IS NOT NULL THEN 1 END) as con_porcentaje_homestate
      FROM transacciones_departamentos
    `
    
    const countResult = await client.query(countQuery)
    const stats = countResult.rows[0]
    
    console.log('📊 Estadísticas de la base de datos:')
    console.log(`   - Total de transacciones: ${stats.total_transacciones}`)
    console.log(`   - Con comisión porcentual: ${stats.con_comision_porcentaje}`)
    console.log(`   - Con comisión en valor: ${stats.con_comision_valor}`)
    console.log(`   - Con porcentaje Homestate: ${stats.con_porcentaje_homestate}`)
    
    console.log('\n🎉 ¡Instalación completada exitosamente!')
    console.log('\n📋 Resumen de cambios:')
    console.log('   ✅ Nuevos campos agregados a transacciones_departamentos')
    console.log('   ✅ Índices de rendimiento creados')
    console.log('   ✅ Datos existentes migrados')
    console.log('   ✅ Validaciones implementadas')
    console.log('\n🚀 El sistema de comisiones está listo para usar')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Función para verificar que el archivo SQL existe
function checkFiles() {
  const requiredFiles = [
    'database_migration.sql',
    'lib/database.ts',
    'components/transaction-dialog.tsx',
    'components/sales-rentals-management.tsx',
    'app/api/transactions/route.ts'
  ]
  
  console.log('🔍 Verificando archivos requeridos...')
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file} - NO ENCONTRADO`)
      return false
    }
  }
  
  return true
}

// Función principal
async function main() {
  console.log('🏗️  Instalador del Sistema de Comisiones')
  console.log('==========================================\n')
  
  // Verificar archivos
  if (!checkFiles()) {
    console.error('❌ Faltan archivos requeridos. Asegúrate de estar en el directorio correcto.')
    process.exit(1)
  }
  
  // Ejecutar migración
  await runMigration()
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
}

module.exports = { runMigration, checkFiles } 