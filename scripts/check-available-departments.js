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

async function checkAvailableDepartments() {
  try {
    await client.connect()
    console.log('🔍 VERIFICANDO DEPARTAMENTOS DISPONIBLES')
    console.log('========================================\n')
    
    // Verificar departamentos disponibles
    const deptResult = await client.query(`
      SELECT 
        d.id,
        d.numero,
        d.nombre,
        d.disponible,
        e.nombre as edificio_nombre,
        COUNT(td.id) as transacciones_activas
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      LEFT JOIN transacciones_departamentos td ON d.id = td.departamento_id 
        AND td.estado_actual IN ('reservado', 'promesa_compra_venta')
      WHERE d.disponible = true
      GROUP BY d.id, d.numero, d.nombre, d.disponible, e.nombre
      HAVING COUNT(td.id) = 0
      ORDER BY d.id
      LIMIT 10
    `)
    
    console.log('📋 Departamentos disponibles (sin transacciones activas):')
    deptResult.rows.forEach((dept, index) => {
      console.log(`   ${index + 1}. ID: ${dept.id} - ${dept.numero} (${dept.nombre}) - ${dept.edificio_nombre}`)
    })
    
    if (deptResult.rows.length === 0) {
      console.log('❌ No hay departamentos disponibles sin transacciones activas')
    } else {
      console.log(`\n✅ Se encontraron ${deptResult.rows.length} departamentos disponibles`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkAvailableDepartments() 