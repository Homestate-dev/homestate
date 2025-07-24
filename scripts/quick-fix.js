#!/usr/bin/env node

/**
 * Script de resolución rápida para errores comunes
 * Aplica correcciones automáticas a problemas identificados
 */

const { Client } = require('pg')

// Configuración de la base de datos
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

async function quickFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 APLICANDO CORRECCIONES RÁPIDAS')
    console.log('================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // 1. Verificar y corregir estructura de departamentos
    console.log('1. 🏢 Corrigiendo estructura de departamentos...')
    
    const deptColumnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'departamentos'
      AND column_name IN ('area_total', 'area')
    `)
    
    const hasAreaTotal = deptColumnsResult.rows.some(col => col.column_name === 'area_total')
    const hasArea = deptColumnsResult.rows.some(col => col.column_name === 'area')
    
    if (!hasAreaTotal && !hasArea) {
      console.log('   ❌ No se encontró columna de área, agregando area_total...')
      await client.query('ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS area_total DECIMAL(10,2)')
      console.log('   ✅ Columna area_total agregada')
    } else {
      console.log(`   ✅ Columna de área encontrada: ${hasAreaTotal ? 'area_total' : 'area'}`)
    }

    // 2. Verificar y crear tabla de transacciones si no existe
    console.log('\n2. 💰 Verificando tabla de transacciones...')
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('transacciones_departamentos', 'transacciones_ventas_arriendos')
    `)
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    
    if (existingTables.length === 0) {
      console.log('   ❌ No se encontró tabla de transacciones, creando transacciones_departamentos...')
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS transacciones_departamentos (
          id SERIAL PRIMARY KEY,
          departamento_id INTEGER REFERENCES departamentos(id),
          agente_id INTEGER REFERENCES administradores(id),
          tipo_transaccion VARCHAR(20) NOT NULL,
          precio_final DECIMAL(15,2) NOT NULL,
          precio_original DECIMAL(15,2),
          comision_agente DECIMAL(15,2) DEFAULT 0,
          comision_porcentaje DECIMAL(5,2) DEFAULT 0,
          comision_valor DECIMAL(12,2) DEFAULT 0,
          porcentaje_homestate DECIMAL(5,2) DEFAULT 60,
          porcentaje_bienes_raices DECIMAL(5,2) DEFAULT 30,
          porcentaje_admin_edificio DECIMAL(5,2) DEFAULT 10,
          valor_homestate DECIMAL(12,2) DEFAULT 0,
          valor_bienes_raices DECIMAL(12,2) DEFAULT 0,
          valor_admin_edificio DECIMAL(12,2) DEFAULT 0,
          cliente_nombre VARCHAR(255) NOT NULL,
          cliente_email VARCHAR(255),
          cliente_telefono VARCHAR(50),
          notas TEXT,
          creado_por VARCHAR(255),
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      console.log('   ✅ Tabla transacciones_departamentos creada')
    } else {
      console.log(`   ✅ Tabla de transacciones encontrada: ${existingTables.join(', ')}`)
    }

    // 3. Verificar y agregar índices si faltan
    console.log('\n3. 📊 Verificando índices...')
    
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'departamentos'
      AND indexname LIKE 'idx_departamentos_%'
    `)
    
    const existingIndexes = indexesResult.rows.map(row => row.indexname)
    
    if (!existingIndexes.includes('idx_departamentos_edificio')) {
      console.log('   ❌ Índice de edificio faltante, agregando...')
      await client.query('CREATE INDEX IF NOT EXISTS idx_departamentos_edificio ON departamentos(edificio_id)')
      console.log('   ✅ Índice de edificio agregado')
    } else {
      console.log('   ✅ Índices de departamentos verificados')
    }

    // 4. Verificar datos de ejemplo
    console.log('\n4. 📋 Verificando datos de ejemplo...')
    
    const deptCountResult = await client.query('SELECT COUNT(*) as count FROM departamentos')
    const buildingCountResult = await client.query('SELECT COUNT(*) as count FROM edificios')
    const adminCountResult = await client.query('SELECT COUNT(*) as count FROM administradores')
    
    console.log(`   Departamentos: ${deptCountResult.rows[0].count}`)
    console.log(`   Edificios: ${buildingCountResult.rows[0].count}`)
    console.log(`   Administradores: ${adminCountResult.rows[0].count}`)
    
    if (deptCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay departamentos en la base de datos')
    }
    
    if (buildingCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay edificios en la base de datos')
    }
    
    if (adminCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay administradores en la base de datos')
    }

    // 5. Probar queries problemáticas
    console.log('\n5. 🧪 Probando queries corregidas...')
    
    try {
      const testResult = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          COALESCE(d.area_total, d.area) as area,
          d.edificio_id,
          d.valor_venta,
          d.valor_arriendo,
          d.estado,
          d.disponible,
          d.tipo,
          d.cantidad_habitaciones,
          e.nombre as edificio_nombre,
          e.direccion as edificio_direccion
        FROM departamentos d
        JOIN edificios e ON d.edificio_id = e.id
        WHERE d.disponible = true
        LIMIT 5
      `)
      console.log(`   ✅ Query de departamentos exitosa: ${testResult.rows.length} resultados`)
    } catch (error) {
      console.log(`   ❌ Error en query de departamentos: ${error.message}`)
    }
    
    try {
      const filterResult = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          COALESCE(d.area_total, d.area) as area,
          d.edificio_id,
          d.valor_venta,
          d.valor_arriendo,
          d.estado,
          d.disponible,
          d.tipo,
          d.cantidad_habitaciones,
          e.nombre as edificio_nombre,
          e.direccion as edificio_direccion
        FROM departamentos d
        JOIN edificios e ON d.edificio_id = e.id
        WHERE d.edificio_id = $1
        LIMIT 5
      `, [1])
      console.log(`   ✅ Query con filtro de edificio exitosa: ${filterResult.rows.length} resultados`)
    } catch (error) {
      console.log(`   ❌ Error en query con filtro: ${error.message}`)
    }

    console.log('\n🎉 Correcciones aplicadas exitosamente')
    console.log('\n📋 Resumen de correcciones:')
    console.log('   ✅ Estructura de departamentos verificada')
    console.log('   ✅ Tabla de transacciones verificada')
    console.log('   ✅ Índices verificados')
    console.log('   ✅ Queries probadas')
    console.log('\n🚀 La aplicación debería funcionar correctamente ahora')

  } catch (error) {
    console.error('❌ Error durante las correcciones:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar correcciones
quickFix().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 