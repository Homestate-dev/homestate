#!/usr/bin/env node

/**
 * Script de diagnóstico para identificar y resolver errores en la aplicación
 * Ejecuta verificaciones de la base de datos y estructura
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

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

async function diagnoseDatabase() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔌 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión exitosa\n')

    console.log('🔍 DIAGNÓSTICO DE LA BASE DE DATOS')
    console.log('=====================================\n')

    // 1. Verificar tablas existentes
    console.log('1. 📋 VERIFICANDO TABLAS EXISTENTES')
    console.log('-----------------------------------')
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'departamentos', 'edificios', 'administradores', 
        'transacciones_departamentos', 'transacciones_ventas_arriendos'
      )
      ORDER BY table_name
    `)
    
    const existingTables = tablesResult.rows.map(row => row.table_name)
    console.log('Tablas encontradas:', existingTables)
    
    const requiredTables = ['departamentos', 'edificios', 'administradores']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))
    
    if (missingTables.length > 0) {
      console.log('❌ Tablas faltantes:', missingTables)
    } else {
      console.log('✅ Todas las tablas requeridas existen')
    }

    // 2. Verificar estructura de departamentos
    console.log('\n2. 🏢 VERIFICANDO ESTRUCTURA DE DEPARTAMENTOS')
    console.log('---------------------------------------------')
    
    const deptColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'departamentos'
      ORDER BY ordinal_position
    `)
    
    console.log('Columnas de departamentos:')
    deptColumnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })

    // Verificar si existe area_total o area
    const hasAreaTotal = deptColumnsResult.rows.some(col => col.column_name === 'area_total')
    const hasArea = deptColumnsResult.rows.some(col => col.column_name === 'area')
    
    if (!hasAreaTotal && !hasArea) {
      console.log('❌ ERROR: No se encontró columna area_total ni area en departamentos')
    } else {
      console.log(`✅ Columna de área encontrada: ${hasAreaTotal ? 'area_total' : 'area'}`)
    }

    // 3. Verificar tablas de transacciones
    console.log('\n3. 💰 VERIFICANDO TABLAS DE TRANSACCIONES')
    console.log('----------------------------------------')
    
    const hasTransaccionesDepartamentos = existingTables.includes('transacciones_departamentos')
    const hasTransaccionesVentasArriendos = existingTables.includes('transacciones_ventas_arriendos')
    
    console.log(`transacciones_departamentos: ${hasTransaccionesDepartamentos ? '✅ Existe' : '❌ No existe'}`)
    console.log(`transacciones_ventas_arriendos: ${hasTransaccionesVentasArriendos ? '✅ Existe' : '❌ No existe'}`)
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      console.log('❌ ERROR: No se encontró ninguna tabla de transacciones')
    }

    // 4. Verificar datos de ejemplo
    console.log('\n4. 📊 VERIFICANDO DATOS DE EJEMPLO')
    console.log('----------------------------------')
    
    // Contar departamentos
    const deptCountResult = await client.query('SELECT COUNT(*) as count FROM departamentos')
    console.log(`Departamentos: ${deptCountResult.rows[0].count}`)
    
    // Contar edificios
    const buildingCountResult = await client.query('SELECT COUNT(*) as count FROM edificios')
    console.log(`Edificios: ${buildingCountResult.rows[0].count}`)
    
    // Contar administradores
    const adminCountResult = await client.query('SELECT COUNT(*) as count FROM administradores')
    console.log(`Administradores: ${adminCountResult.rows[0].count}`)
    
    // Contar transacciones
    if (hasTransaccionesDepartamentos) {
      const transCountResult = await client.query('SELECT COUNT(*) as count FROM transacciones_departamentos')
      console.log(`Transacciones (departamentos): ${transCountResult.rows[0].count}`)
    }
    
    if (hasTransaccionesVentasArriendos) {
      const transCountResult = await client.query('SELECT COUNT(*) as count FROM transacciones_ventas_arriendos')
      console.log(`Transacciones (ventas/arriendos): ${transCountResult.rows[0].count}`)
    }

    // 5. Probar queries problemáticas
    console.log('\n5. 🧪 PROBANDO QUERIES PROBLEMÁTICAS')
    console.log('-----------------------------------')
    
    // Probar query de departamentos
    try {
      console.log('Probando query de departamentos...')
      const deptTestResult = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          ${hasAreaTotal ? 'd.area_total' : 'd.area'} as area,
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
      console.log(`✅ Query de departamentos exitosa: ${deptTestResult.rows.length} resultados`)
    } catch (error) {
      console.log('❌ Error en query de departamentos:', error.message)
    }
    
    // Probar query con filtro de edificio
    try {
      console.log('Probando query de departamentos con filtro de edificio...')
      const deptFilterResult = await client.query(`
        SELECT 
          d.id,
          d.numero,
          d.nombre,
          d.piso,
          ${hasAreaTotal ? 'd.area_total' : 'd.area'} as area,
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
      console.log(`✅ Query con filtro de edificio exitosa: ${deptFilterResult.rows.length} resultados`)
    } catch (error) {
      console.log('❌ Error en query con filtro de edificio:', error.message)
    }

    // 6. Generar reporte de problemas
    console.log('\n6. 📋 REPORTE DE PROBLEMAS')
    console.log('---------------------------')
    
    const problems = []
    
    if (missingTables.length > 0) {
      problems.push(`Faltan tablas: ${missingTables.join(', ')}`)
    }
    
    if (!hasAreaTotal && !hasArea) {
      problems.push('Columna de área no encontrada en departamentos')
    }
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      problems.push('No se encontró tabla de transacciones')
    }
    
    if (problems.length === 0) {
      console.log('✅ No se encontraron problemas críticos')
    } else {
      console.log('❌ Problemas encontrados:')
      problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem}`)
      })
    }

    // 7. Generar script de corrección
    if (problems.length > 0) {
      console.log('\n7. 🔧 GENERANDO SCRIPT DE CORRECCIÓN')
      console.log('-----------------------------------')
      
      let fixScript = '-- Script de corrección generado automáticamente\n\n'
      
      if (!hasAreaTotal && !hasArea) {
        fixScript += `-- Agregar columna area_total si no existe\n`
        fixScript += `ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS area_total DECIMAL(10,2);\n\n`
      }
      
      if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
        fixScript += `-- Crear tabla de transacciones básica\n`
        fixScript += `CREATE TABLE IF NOT EXISTS transacciones_departamentos (\n`
        fixScript += `  id SERIAL PRIMARY KEY,\n`
        fixScript += `  departamento_id INTEGER REFERENCES departamentos(id),\n`
        fixScript += `  agente_id INTEGER REFERENCES administradores(id),\n`
        fixScript += `  tipo_transaccion VARCHAR(20) NOT NULL,\n`
        fixScript += `  precio_final DECIMAL(15,2) NOT NULL,\n`
        fixScript += `  cliente_nombre VARCHAR(255) NOT NULL,\n`
        fixScript += `  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`
        fixScript += `);\n\n`
      }
      
      const fixScriptPath = path.join(__dirname, 'fix-database-issues.sql')
      fs.writeFileSync(fixScriptPath, fixScript)
      console.log(`✅ Script de corrección guardado en: ${fixScriptPath}`)
    }

    console.log('\n🎉 Diagnóstico completado')
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar diagnóstico
diagnoseDatabase().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 