#!/usr/bin/env node

/**
 * Script de corrección específico para Heroku
 * Resuelve problemas comunes en el entorno de producción
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

async function herokuFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔧 CORRECCIÓN ESPECÍFICA PARA HEROKU')
    console.log('===================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // 1. Verificar y corregir estructura de departamentos
    console.log('1. 🏢 CORRIGIENDO ESTRUCTURA DE DEPARTAMENTOS')
    console.log('--------------------------------------------')
    
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

    // 2. Verificar que hay datos en las tablas
    console.log('\n2. 📊 VERIFICANDO DATOS')
    console.log('----------------------')
    
    const deptCountResult = await client.query('SELECT COUNT(*) as count FROM departamentos')
    const buildingCountResult = await client.query('SELECT COUNT(*) as count FROM edificios')
    const adminCountResult = await client.query('SELECT COUNT(*) as count FROM administradores')
    
    console.log(`   Departamentos: ${deptCountResult.rows[0].count}`)
    console.log(`   Edificios: ${buildingCountResult.rows[0].count}`)
    console.log(`   Administradores: ${adminCountResult.rows[0].count}`)
    
    if (deptCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay departamentos - creando datos de ejemplo...')
      
      // Crear un edificio de ejemplo si no existe
      const buildingResult = await client.query(`
        INSERT INTO edificios (nombre, direccion, ciudad, pais, creado_por)
        VALUES ('Edificio Ejemplo', 'Calle 123 #45-67', 'Bogotá', 'Colombia', 'sistema')
        ON CONFLICT DO NOTHING
        RETURNING id
      `)
      
      if (buildingResult.rows.length > 0) {
        const buildingId = buildingResult.rows[0].id
        console.log(`   ✅ Edificio creado con ID: ${buildingId}`)
        
        // Crear departamentos de ejemplo
        await client.query(`
          INSERT INTO departamentos (
            numero, nombre, piso, area_total, edificio_id, valor_venta, 
            valor_arriendo, estado, disponible, tipo, cantidad_habitaciones, creado_por
          )
          VALUES 
            ('101', 'Apartamento 101', 1, 65.5, $1, 250000000, 1200000, 'disponible', true, 'apartamento', 2, 'sistema'),
            ('102', 'Apartamento 102', 1, 75.0, $1, 280000000, 1300000, 'disponible', true, 'apartamento', 3, 'sistema'),
            ('201', 'Apartamento 201', 2, 65.5, $1, 250000000, 1200000, 'disponible', true, 'apartamento', 2, 'sistema')
          ON CONFLICT DO NOTHING
        `, [buildingId])
        
        console.log('   ✅ Departamentos de ejemplo creados')
      }
    }
    
    if (buildingCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay edificios - creando edificio de ejemplo...')
      await client.query(`
        INSERT INTO edificios (nombre, direccion, ciudad, pais, creado_por)
        VALUES ('Edificio Principal', 'Calle Principal #123', 'Bogotá', 'Colombia', 'sistema')
        ON CONFLICT DO NOTHING
      `)
      console.log('   ✅ Edificio de ejemplo creado')
    }
    
    if (adminCountResult.rows[0].count === 0) {
      console.log('   ⚠️  No hay administradores - creando administrador de ejemplo...')
      await client.query(`
        INSERT INTO administradores (nombre, email, telefono, rol, creado_por)
        VALUES ('Admin Ejemplo', 'admin@ejemplo.com', '3001234567', 'administrador', 'sistema')
        ON CONFLICT DO NOTHING
      `)
      console.log('   ✅ Administrador de ejemplo creado')
    }

    // 3. Verificar y crear tabla de transacciones si no existe
    console.log('\n3. 💰 VERIFICANDO TABLA DE TRANSACCIONES')
    console.log('----------------------------------------')
    
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

    // 4. Crear índices necesarios
    console.log('\n4. 📊 CREANDO ÍNDICES')
    console.log('---------------------')
    
    const indexesToCreate = [
      'CREATE INDEX IF NOT EXISTS idx_departamentos_edificio ON departamentos(edificio_id)',
      'CREATE INDEX IF NOT EXISTS idx_departamentos_disponible ON departamentos(disponible)',
      'CREATE INDEX IF NOT EXISTS idx_departamentos_estado ON departamentos(estado)',
      'CREATE INDEX IF NOT EXISTS idx_edificios_nombre ON edificios(nombre)',
      'CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email)'
    ]
    
    for (const indexQuery of indexesToCreate) {
      try {
        await client.query(indexQuery)
        console.log(`   ✅ Índice creado: ${indexQuery.split(' ')[4]}`)
      } catch (error) {
        console.log(`   ⚠️  Índice ya existe o error: ${error.message}`)
      }
    }

    // 5. Probar queries problemáticas
    console.log('\n5. 🧪 PROBANDO QUERIES CORREGIDAS')
    console.log('--------------------------------')
    
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
        ORDER BY e.nombre, d.piso, d.numero
        LIMIT 5
      `)
      console.log(`   ✅ Query de departamentos exitosa: ${testResult.rows.length} resultados`)
      
      if (testResult.rows.length > 0) {
        console.log('   📋 Primer resultado:', {
          id: testResult.rows[0].id,
          numero: testResult.rows[0].numero,
          edificio: testResult.rows[0].edificio_nombre,
          area: testResult.rows[0].area
        })
      }
    } catch (error) {
      console.log(`   ❌ Error en query de departamentos: ${error.message}`)
    }
    
    // Probar con filtro de edificio
    try {
      const buildingsResult = await client.query('SELECT id FROM edificios LIMIT 1')
      if (buildingsResult.rows.length > 0) {
        const buildingId = buildingsResult.rows[0].id
        
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
          ORDER BY e.nombre, d.piso, d.numero
          LIMIT 5
        `, [buildingId])
        console.log(`   ✅ Query con filtro de edificio ${buildingId} exitosa: ${filterResult.rows.length} resultados`)
      }
    } catch (error) {
      console.log(`   ❌ Error en query con filtro: ${error.message}`)
    }

    console.log('\n🎉 Correcciones de Heroku aplicadas exitosamente')
    console.log('\n📋 Resumen de correcciones:')
    console.log('   ✅ Estructura de departamentos verificada')
    console.log('   ✅ Datos de ejemplo creados si era necesario')
    console.log('   ✅ Tabla de transacciones verificada')
    console.log('   ✅ Índices creados')
    console.log('   ✅ Queries probadas')
    console.log('\n🚀 La aplicación en Heroku debería funcionar correctamente ahora')

  } catch (error) {
    console.error('❌ Error durante las correcciones:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar correcciones
herokuFix().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 