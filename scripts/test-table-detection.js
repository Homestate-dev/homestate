// Simular exactamente la misma importación que usa la API
const { Pool } = require('pg')

const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
}

const pool = new Pool(dbConfig)

// Exactamente la misma función que está en lib/database.ts
async function executeQuery(query, params = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result
  } finally {
    client.release()
  }
}

// Alias para compatibilidad con endpoints existentes (exactamente como en lib/database.ts)
const query = executeQuery

// Exactamente la misma función tableExists que usa la API
async function tableExists(tableName) {
  try {
    const res = await query(
      `SELECT EXISTS (
         SELECT 1
         FROM   information_schema.tables
         WHERE  table_name = $1
       ) AS exists`,
      [tableName]
    )
    return res.rows[0]?.exists === true
  } catch (error) {
    console.warn(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

async function testTableDetection() {
  try {
    console.log('🔍 VERIFICANDO DETECCIÓN DE TABLAS')
    console.log('===================================\n')
    
    // Verificar qué tabla de transacciones existe (exactamente como la API)
    const hasTransaccionesDepartamentos = await tableExists('transacciones_departamentos')
    const hasTransaccionesVentasArriendos = await tableExists('transacciones_ventas_arriendos')
    
    console.log('📋 Resultados de detección:')
    console.log(`   - transacciones_departamentos: ${hasTransaccionesDepartamentos}`)
    console.log(`   - transacciones_ventas_arriendos: ${hasTransaccionesVentasArriendos}`)
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      console.log('\n❌ No se encontró tabla de transacciones')
      return
    }

    // Usar la tabla que existe (exactamente como la API)
    const tableName = hasTransaccionesDepartamentos ? 'transacciones_departamentos' : 'transacciones_ventas_arriendos'
    console.log(`\n✅ Tabla seleccionada: ${tableName}`)
    
    // Verificar la estructura de la tabla seleccionada
    const structureResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName])
    
    console.log('\n📋 Estructura de la tabla:')
    structureResult.rows.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })
    
    // Verificar específicamente las columnas del cliente
    const clientColumns = structureResult.rows.filter(col => 
      col.column_name.startsWith('cliente_')
    )
    
    console.log('\n👤 Columnas del cliente:')
    clientColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

testTableDetection() 