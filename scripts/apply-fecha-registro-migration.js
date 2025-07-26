#!/usr/bin/env node

/**
 * Script para aplicar la migración de fecha_registro
 * Agrega la columna fecha_registro a transacciones_departamentos
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

async function applyFechaRegistroMigration() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 APLICANDO MIGRACIÓN DE FECHA_REGISTRO')
    console.log('=========================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar si la columna ya existe
    console.log('1. 🔍 VERIFICANDO SI LA COLUMNA EXISTE')
    console.log('--------------------------------------')
    
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      AND column_name = 'fecha_registro'
    `)
    
    if (checkResult.rows.length > 0) {
      console.log('   ✅ La columna fecha_registro ya existe')
      return
    } else {
      console.log('   ❌ La columna fecha_registro no existe, procediendo a crearla')
    }

    // 2. Leer y ejecutar el script SQL
    console.log('\n2. 📝 EJECUTANDO MIGRACIÓN')
    console.log('---------------------------')
    
    const sqlPath = path.join(__dirname, 'add-fecha-registro-column.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('   Ejecutando script de migración...')
    await client.query(sqlContent)
    console.log('   ✅ Migración ejecutada exitosamente')

    // 3. Verificar que la columna se agregó correctamente
    console.log('\n3. ✅ VERIFICANDO MIGRACIÓN')
    console.log('----------------------------')
    
    const verifyResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      AND column_name = 'fecha_registro'
    `)
    
    if (verifyResult.rows.length > 0) {
      const column = verifyResult.rows[0]
      console.log('   ✅ Columna fecha_registro agregada correctamente:')
      console.log(`      - Nombre: ${column.column_name}`)
      console.log(`      - Tipo: ${column.data_type}`)
      console.log(`      - Nullable: ${column.is_nullable}`)
      console.log(`      - Default: ${column.column_default}`)
    } else {
      console.log('   ❌ Error: La columna no se agregó correctamente')
    }

    // 4. Mostrar algunos registros para verificar
    console.log('\n4. 📊 VERIFICANDO REGISTROS')
    console.log('----------------------------')
    
    const recordsResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        fecha_registro,
        estado_actual,
        cliente_nombre
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 5
    `)
    
    console.log('   Registros recientes:')
    recordsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Precio: $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Fecha Registro: ${row.fecha_registro || 'N/A'}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log('')
    })

    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
    console.log('====================================')
    console.log('\n📋 RESUMEN:')
    console.log('• ✅ Columna fecha_registro agregada')
    console.log('• ✅ Registros existentes actualizados')
    console.log('• ✅ Verificación completada')
    console.log('• ✅ Sistema listo para usar fecha_registro')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar migración
applyFechaRegistroMigration().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 