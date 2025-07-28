const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
})

async function testSimpleQuery() {
  try {
    await client.connect()
    console.log('🧪 PRUEBA SIMPLE DE QUERY')
    console.log('=========================\n')
    
    // Insertar con datos del cliente
    const result = await client.query(`
      INSERT INTO transacciones_departamentos (
        departamento_id, agente_id, tipo_transaccion, precio_final, precio_original,
        comision_agente, comision_porcentaje, comision_valor,
        porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
        valor_homestate, valor_bienes_raices, valor_admin_edificio,
        cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
        notas, fecha_transaccion, estado_actual, datos_estado, fecha_ultimo_estado, fecha_registro, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id, cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento
    `, [
      265, 4, 'venta', 250000000, null, 7500000, 3.0, 7500000, 60, 30, 10, 4500000, 2250000, 750000,
      'Test Simple Query', 'test.simple@email.com', '3001234567', '12345678', 'CC',
      'Prueba simple', new Date().toISOString(), 'reservado', '{}', new Date().toISOString(), new Date().toISOString().split('T')[0], 'test-simple'
    ])
    
    const created = result.rows[0]
    console.log('📥 Resultado:')
    console.log(`   - ID: ${created.id}`)
    console.log(`   - Cliente: ${created.cliente_nombre}`)
    console.log(`   - Email: ${created.cliente_email}`)
    console.log(`   - Teléfono: ${created.cliente_telefono}`)
    console.log(`   - Cédula: ${created.cliente_cedula}`)
    
    if (created.cliente_nombre) {
      console.log('\n✅ Query simple funciona')
    } else {
      console.log('\n❌ Query simple no guarda datos del cliente')
    }
    
    // Limpiar
    await client.query('DELETE FROM transacciones_departamentos WHERE id = $1', [created.id])
    console.log('\n🧹 Limpiado')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

testSimpleQuery() 