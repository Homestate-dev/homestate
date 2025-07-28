const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
})

async function findAvailableDepartments() {
  try {
    await client.connect()
    console.log('🔍 BUSCANDO DEPARTAMENTOS DISPONIBLES')
    console.log('=====================================\n')
    
    // Buscar departamentos sin transacciones activas
    const result = await client.query(`
      SELECT d.id, d.numero, d.nombre, e.nombre as edificio
      FROM departamentos d
      JOIN edificios e ON d.edificio_id = e.id
      WHERE d.id NOT IN (
        SELECT DISTINCT departamento_id 
        FROM transacciones_departamentos 
        WHERE estado_actual IN ('reservado', 'promesa_compra_venta')
      )
      ORDER BY d.id
      LIMIT 10
    `)
    
    if (result.rows.length > 0) {
      console.log('📋 Departamentos disponibles:')
      result.rows.forEach((dept, index) => {
        console.log(`   ${index + 1}. ID: ${dept.id} - ${dept.nombre} (${dept.numero}) - ${dept.edificio}`)
      })
    } else {
      console.log('❌ No se encontraron departamentos disponibles')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

findAvailableDepartments() 