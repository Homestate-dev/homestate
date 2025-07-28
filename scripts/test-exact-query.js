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

async function testExactQuery() {
  try {
    console.log('🧪 PROBANDO FUNCIÓN QUERY EXACTA DE LA API')
    console.log('===========================================\n')
    
    // Usar exactamente los mismos parámetros que la API
    const sql = `
      INSERT INTO transacciones_departamentos (
        departamento_id, agente_id, tipo_transaccion, precio_final, precio_original,
        comision_agente, comision_porcentaje, comision_valor,
        porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
        valor_homestate, valor_bienes_raices, valor_admin_edificio,
        cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
        notas, fecha_transaccion, estado_actual, datos_estado, fecha_ultimo_estado, fecha_registro, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id, cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento
    `
    
    // Usar exactamente los mismos parámetros que la API
    const queryParams = [
      299, 4, 'venta', 250000000, null, 7500000, 3.0, 7500000, 60, 30, 10, 4500000, 2250000, 750000,
      'Test Exact Query', 'test.exact@email.com', '3001234567', '12345678', 'CC',
      'Prueba exact query', new Date().toISOString(), 'reservado', '{}', new Date().toISOString(), new Date().toISOString().split('T')[0], 'test-exact'
    ]
    
    console.log('📤 Datos del cliente a insertar:')
    console.log(`   - Nombre: ${queryParams[14]}`)
    console.log(`   - Email: ${queryParams[15]}`)
    console.log(`   - Teléfono: ${queryParams[16]}`)
    console.log(`   - Cédula: ${queryParams[17]}`)
    
    console.log('\n🔍 Ejecutando con función query (alias de executeQuery)...')
    const result = await query(sql, queryParams)
    
    const created = result.rows[0]
    console.log('\n📥 Resultado:')
    console.log(`   - ID: ${created.id}`)
    console.log(`   - Cliente: ${created.cliente_nombre}`)
    console.log(`   - Email: ${created.cliente_email}`)
    console.log(`   - Teléfono: ${created.cliente_telefono}`)
    console.log(`   - Cédula: ${created.cliente_cedula}`)
    
    if (created.cliente_nombre) {
      console.log('\n✅ Función query (alias) funciona correctamente')
    } else {
      console.log('\n❌ Función query (alias) no guarda los datos del cliente')
    }
    
    // Limpiar
    await query('DELETE FROM transacciones_departamentos WHERE id = $1', [created.id])
    console.log('\n🧹 Datos de prueba eliminados')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

testExactQuery() 