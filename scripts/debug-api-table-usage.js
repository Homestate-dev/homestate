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

async function debugAPITableUsage() {
  try {
    console.log('🔍 DEBUGGEANDO USO DE TABLA EN API')
    console.log('===================================\n')
    
    // Verificar qué tabla de transacciones existe (exactamente como la API)
    console.log('1. 🔍 Verificando tablas existentes...')
    const hasTransaccionesDepartamentos = await tableExists('transacciones_departamentos')
    const hasTransaccionesVentasArriendos = await tableExists('transacciones_ventas_arriendos')
    
    console.log(`   - transacciones_departamentos: ${hasTransaccionesDepartamentos}`)
    console.log(`   - transacciones_ventas_arriendos: ${hasTransaccionesVentasArriendos}`)
    
    if (!hasTransaccionesDepartamentos && !hasTransaccionesVentasArriendos) {
      console.log('\n❌ No se encontró tabla de transacciones')
      return
    }

    // Usar la tabla que existe (exactamente como la API)
    const tableName = hasTransaccionesDepartamentos ? 'transacciones_departamentos' : 'transacciones_ventas_arriendos'
    console.log(`\n✅ Tabla seleccionada: ${tableName}`)
    
    // Verificar la estructura de ambas tablas
    console.log('\n2. 🔍 Verificando estructura de ambas tablas...')
    
    if (hasTransaccionesDepartamentos) {
      const deptStructure = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'transacciones_departamentos'
        ORDER BY ordinal_position
      `)
      
      console.log('\n📋 Estructura de transacciones_departamentos:')
      deptStructure.rows.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
      })
    }
    
    if (hasTransaccionesVentasArriendos) {
      const ventasStructure = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'transacciones_ventas_arriendos'
        ORDER BY ordinal_position
      `)
      
      console.log('\n📋 Estructura de transacciones_ventas_arriendos:')
      ventasStructure.rows.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
      })
    }
    
    // Verificar si hay transacciones en ambas tablas
    console.log('\n3. 🔍 Verificando transacciones existentes...')
    
    if (hasTransaccionesDepartamentos) {
      const deptCount = await query('SELECT COUNT(*) as count FROM transacciones_departamentos')
      console.log(`   - transacciones_departamentos: ${deptCount.rows[0].count} transacciones`)
    }
    
    if (hasTransaccionesVentasArriendos) {
      const ventasCount = await query('SELECT COUNT(*) as count FROM transacciones_ventas_arriendos')
      console.log(`   - transacciones_ventas_arriendos: ${ventasCount.rows[0].count} transacciones`)
    }
    
    // Verificar la última transacción en cada tabla
    console.log('\n4. 🔍 Verificando última transacción...')
    
    if (hasTransaccionesDepartamentos) {
      const lastDept = await query(`
        SELECT id, cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento
        FROM transacciones_departamentos
        ORDER BY id DESC
        LIMIT 1
      `)
      
      if (lastDept.rows.length > 0) {
        const last = lastDept.rows[0]
        console.log(`   - Última en transacciones_departamentos:`)
        console.log(`     * ID: ${last.id}`)
        console.log(`     * Cliente: ${last.cliente_nombre}`)
        console.log(`     * Email: ${last.cliente_email}`)
        console.log(`     * Teléfono: ${last.cliente_telefono}`)
        console.log(`     * Cédula: ${last.cliente_cedula}`)
      }
    }
    
    if (hasTransaccionesVentasArriendos) {
      const lastVentas = await query(`
        SELECT id, cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento
        FROM transacciones_ventas_arriendos
        ORDER BY id DESC
        LIMIT 1
      `)
      
      if (lastVentas.rows.length > 0) {
        const last = lastVentas.rows[0]
        console.log(`   - Última en transacciones_ventas_arriendos:`)
        console.log(`     * ID: ${last.id}`)
        console.log(`     * Cliente: ${last.cliente_nombre}`)
        console.log(`     * Email: ${last.cliente_email}`)
        console.log(`     * Teléfono: ${last.cliente_telefono}`)
        console.log(`     * Cédula: ${last.cliente_cedula}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

debugAPITableUsage() 