#!/usr/bin/env node

const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkReportDataTypes() {
  try {
    await client.connect()
    console.log('🔍 VERIFICANDO TIPOS DE DATOS EN REPORTES')
    console.log('==========================================\n')
    
    // 1. Verificar datos de ingresos por edificio
    console.log('1. 📊 VERIFICANDO DATOS DE INGRESOS POR EDIFICIO')
    console.log('------------------------------------------------')
    
    const buildingIncomeResult = await client.query(`
      SELECT 
        e.nombre as edificio_nombre,
        COALESCE(AVG(t.porcentaje_homestate), 0) as promedio_porcentaje_homestate,
        COALESCE(AVG(t.porcentaje_bienes_raices), 0) as promedio_porcentaje_bienes_raices,
        COALESCE(AVG(t.porcentaje_admin_edificio), 0) as promedio_porcentaje_admin_edificio
      FROM edificios e
      LEFT JOIN departamentos d ON e.id = d.edificio_id
      LEFT JOIN transacciones_departamentos t ON d.id = t.departamento_id
      GROUP BY e.id, e.nombre
      LIMIT 3
    `)
    
    buildingIncomeResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.edificio_nombre}:`)
      console.log(`      - promedio_porcentaje_homestate: ${row.promedio_porcentaje_homestate} (tipo: ${typeof row.promedio_porcentaje_homestate})`)
      console.log(`      - promedio_porcentaje_bienes_raices: ${row.promedio_porcentaje_bienes_raices} (tipo: ${typeof row.promedio_porcentaje_bienes_raices})`)
      console.log(`      - promedio_porcentaje_admin_edificio: ${row.promedio_porcentaje_admin_edificio} (tipo: ${typeof row.promedio_porcentaje_admin_edificio})`)
    })
    
    // 2. Verificar datos de comisiones distribuidas
    console.log('\n2. 📈 VERIFICANDO DATOS DE COMISIONES DISTRIBUIDAS')
    console.log('--------------------------------------------------')
    
    const commissionSummaryResult = await client.query(`
      SELECT 
        COALESCE(AVG(porcentaje_homestate), 0) as promedio_porcentaje_homestate,
        COALESCE(AVG(porcentaje_bienes_raices), 0) as promedio_porcentaje_bienes_raices,
        COALESCE(AVG(porcentaje_admin_edificio), 0) as promedio_porcentaje_admin_edificio,
        CASE 
          WHEN SUM(comision_valor) > 0 
          THEN (SUM(valor_homestate) / SUM(comision_valor)) * 100 
          ELSE 0 
        END as porcentaje_total_homestate,
        CASE 
          WHEN SUM(comision_valor) > 0 
          THEN (SUM(valor_bienes_raices) / SUM(comision_valor)) * 100 
          ELSE 0 
        END as porcentaje_total_bienes_raices,
        CASE 
          WHEN SUM(comision_valor) > 0 
          THEN (SUM(valor_admin_edificio) / SUM(comision_valor)) * 100 
          ELSE 0 
        END as porcentaje_total_admin_edificio
      FROM transacciones_departamentos
    `)
    
    if (commissionSummaryResult.rows.length > 0) {
      const summary = commissionSummaryResult.rows[0]
      console.log('   Resumen de comisiones:')
      console.log(`      - promedio_porcentaje_homestate: ${summary.promedio_porcentaje_homestate} (tipo: ${typeof summary.promedio_porcentaje_homestate})`)
      console.log(`      - promedio_porcentaje_bienes_raices: ${summary.promedio_porcentaje_bienes_raices} (tipo: ${typeof summary.promedio_porcentaje_bienes_raices})`)
      console.log(`      - promedio_porcentaje_admin_edificio: ${summary.promedio_porcentaje_admin_edificio} (tipo: ${typeof summary.promedio_porcentaje_admin_edificio})`)
      console.log(`      - porcentaje_total_homestate: ${summary.porcentaje_total_homestate} (tipo: ${typeof summary.porcentaje_total_homestate})`)
      console.log(`      - porcentaje_total_bienes_raices: ${summary.porcentaje_total_bienes_raices} (tipo: ${typeof summary.porcentaje_total_bienes_raices})`)
      console.log(`      - porcentaje_total_admin_edificio: ${summary.porcentaje_total_admin_edificio} (tipo: ${typeof summary.porcentaje_total_admin_edificio})`)
    }
    
    // 3. Verificar si hay valores null o undefined
    console.log('\n3. ⚠️ VERIFICANDO VALORES NULL O UNDEFINED')
    console.log('-------------------------------------------')
    
    const nullCheckResult = await client.query(`
      SELECT 
        COUNT(*) as total_transacciones,
        COUNT(CASE WHEN porcentaje_homestate IS NULL THEN 1 END) as null_homestate,
        COUNT(CASE WHEN porcentaje_bienes_raices IS NULL THEN 1 END) as null_bienes_raices,
        COUNT(CASE WHEN porcentaje_admin_edificio IS NULL THEN 1 END) as null_admin_edificio,
        COUNT(CASE WHEN valor_homestate IS NULL THEN 1 END) as null_valor_homestate,
        COUNT(CASE WHEN valor_bienes_raices IS NULL THEN 1 END) as null_valor_bienes_raices,
        COUNT(CASE WHEN valor_admin_edificio IS NULL THEN 1 END) as null_valor_admin_edificio
      FROM transacciones_departamentos
    `)
    
    if (nullCheckResult.rows.length > 0) {
      const nullStats = nullCheckResult.rows[0]
      console.log(`   Total transacciones: ${nullStats.total_transacciones}`)
      console.log(`   Valores NULL en porcentajes:`)
      console.log(`      - porcentaje_homestate: ${nullStats.null_homestate}`)
      console.log(`      - porcentaje_bienes_raices: ${nullStats.null_bienes_raices}`)
      console.log(`      - porcentaje_admin_edificio: ${nullStats.null_admin_edificio}`)
      console.log(`   Valores NULL en valores:`)
      console.log(`      - valor_homestate: ${nullStats.null_valor_homestate}`)
      console.log(`      - valor_bienes_raices: ${nullStats.null_valor_bienes_raices}`)
      console.log(`      - valor_admin_edificio: ${nullStats.null_valor_admin_edificio}`)
    }
    
    // 4. Actualizar valores NULL a 0 si es necesario
    console.log('\n4. 🔧 ACTUALIZANDO VALORES NULL A 0')
    console.log('------------------------------------')
    
    const updateResult = await client.query(`
      UPDATE transacciones_departamentos 
      SET 
        porcentaje_homestate = COALESCE(porcentaje_homestate, 0),
        porcentaje_bienes_raices = COALESCE(porcentaje_bienes_raices, 0),
        porcentaje_admin_edificio = COALESCE(porcentaje_admin_edificio, 0),
        valor_homestate = COALESCE(valor_homestate, 0),
        valor_bienes_raices = COALESCE(valor_bienes_raices, 0),
        valor_admin_edificio = COALESCE(valor_admin_edificio, 0)
      WHERE 
        porcentaje_homestate IS NULL OR 
        porcentaje_bienes_raices IS NULL OR 
        porcentaje_admin_edificio IS NULL OR
        valor_homestate IS NULL OR 
        valor_bienes_raices IS NULL OR 
        valor_admin_edificio IS NULL
    `)
    
    console.log(`   ✅ Filas actualizadas: ${updateResult.rowCount}`)
    
    console.log('\n✅ VERIFICACIÓN DE TIPOS DE DATOS COMPLETADA')
    console.log('============================================')
    console.log('Los valores NULL han sido actualizados a 0.')
    console.log('Los componentes ahora manejan valores numéricos de forma segura.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkReportDataTypes().catch(console.error) 