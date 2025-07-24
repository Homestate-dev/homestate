#!/usr/bin/env node

/**
 * Script de diagnóstico específico para Heroku
 * Verifica problemas comunes en el entorno de producción
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

async function herokuDiagnosis() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔍 DIAGNÓSTICO ESPECÍFICO PARA HEROKU')
    console.log('=====================================\n')
    
    await client.connect()
    console.log('✅ Conexión a base de datos establecida\n')

    // 1. Verificar estructura exacta de la tabla departamentos
    console.log('1. 🏢 ESTRUCTURA EXACTA DE DEPARTAMENTOS')
    console.log('----------------------------------------')
    
    const deptStructureResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'departamentos'
      ORDER BY ordinal_position
    `)
    
    console.log('Columnas encontradas:')
    deptStructureResult.rows.forEach(col => {
      console.log(`   ${col.ordinal_position}. ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })

    // 2. Verificar si hay datos en las tablas
    console.log('\n2. 📊 VERIFICACIÓN DE DATOS')
    console.log('---------------------------')
    
    const deptCountResult = await client.query('SELECT COUNT(*) as count FROM departamentos')
    const buildingCountResult = await client.query('SELECT COUNT(*) as count FROM edificios')
    const adminCountResult = await client.query('SELECT COUNT(*) as count FROM administradores')
    
    console.log(`Departamentos: ${deptCountResult.rows[0].count}`)
    console.log(`Edificios: ${buildingCountResult.rows[0].count}`)
    console.log(`Administradores: ${adminCountResult.rows[0].count}`)

    // 3. Probar la query exacta que falla en Heroku
    console.log('\n3. 🧪 PROBANDO QUERY EXACTA DEL ENDPOINT')
    console.log('----------------------------------------')
    
    try {
      console.log('Probando query sin filtros...')
      const testResult1 = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          d.area_total as area,
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
      console.log(`✅ Query sin filtros exitosa: ${testResult1.rows.length} resultados`)
      
      if (testResult1.rows.length > 0) {
        console.log('Primer resultado:', testResult1.rows[0])
      }
    } catch (error) {
      console.log(`❌ Error en query sin filtros: ${error.message}`)
      console.log('Stack trace:', error.stack)
    }

    // 4. Probar con filtro de edificio
    try {
      console.log('\nProbando query con filtro de edificio...')
      const testResult2 = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          d.area_total as area,
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
      `, [167])
      console.log(`✅ Query con filtro exitosa: ${testResult2.rows.length} resultados`)
      
      if (testResult2.rows.length > 0) {
        console.log('Primer resultado con filtro:', testResult2.rows[0])
      }
    } catch (error) {
      console.log(`❌ Error en query con filtro: ${error.message}`)
      console.log('Stack trace:', error.stack)
    }

    // 5. Verificar si el edificio 167 existe
    console.log('\n4. 🏗️ VERIFICANDO EDIFICIO 167')
    console.log('-----------------------------')
    
    try {
      const buildingResult = await client.query('SELECT id, nombre, direccion FROM edificios WHERE id = $1', [167])
      if (buildingResult.rows.length > 0) {
        console.log('✅ Edificio 167 encontrado:', buildingResult.rows[0])
      } else {
        console.log('❌ Edificio 167 NO existe')
        
        // Mostrar edificios disponibles
        const allBuildings = await client.query('SELECT id, nombre FROM edificios ORDER BY id LIMIT 10')
        console.log('Edificios disponibles:', allBuildings.rows.map(b => `${b.id}: ${b.nombre}`))
      }
    } catch (error) {
      console.log(`❌ Error verificando edificio: ${error.message}`)
    }

    // 6. Verificar permisos y conexiones
    console.log('\n5. 🔐 VERIFICANDO PERMISOS')
    console.log('--------------------------')
    
    try {
      const permissionsResult = await client.query(`
        SELECT 
          current_user as usuario_actual,
          current_database() as base_datos_actual,
          version() as version_postgres
      `)
      console.log('Información de conexión:', permissionsResult.rows[0])
    } catch (error) {
      console.log(`❌ Error verificando permisos: ${error.message}`)
    }

    // 7. Verificar si hay problemas con la columna area_total
    console.log('\n6. 📏 VERIFICANDO COLUMNA AREA')
    console.log('-----------------------------')
    
    try {
      const areaTestResult = await client.query(`
        SELECT 
          id,
          numero,
          area_total,
          area
        FROM departamentos 
        WHERE area_total IS NOT NULL OR area IS NOT NULL
        LIMIT 3
      `)
      console.log('Datos de área encontrados:', areaTestResult.rows)
    } catch (error) {
      console.log(`❌ Error verificando área: ${error.message}`)
    }

    console.log('\n🎉 Diagnóstico completado')
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar diagnóstico
herokuDiagnosis().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 