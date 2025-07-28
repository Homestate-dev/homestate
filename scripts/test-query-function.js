const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
})

async function testQueryFunction() {
  try {
    await client.connect()
    console.log('🧪 PROBANDO FUNCIÓN QUERY')
    console.log('==========================\n')
    
    // Usar los mismos parámetros que la API
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
    
    const queryParams = [
      235, // departamento_id
      4, // agente_id
      'venta', // tipo_transaccion
      250000000, // precio_final
      null, // precio_original
      7500000, // comision_agente
      3.0, // comision_porcentaje
      7500000, // comision_valor
      60, // porcentaje_homestate
      30, // porcentaje_bienes_raices
      10, // porcentaje_admin_edificio
      4500000, // valor_homestate
      2250000, // valor_bienes_raices
      750000, // valor_admin_edificio
      'Test Query Function', // cliente_nombre
      'test.query@email.com', // cliente_email
      '3001234567', // cliente_telefono
      '12345678', // cliente_cedula
      'CC', // cliente_tipo_documento
      'Prueba función query', // notas
      new Date().toISOString(), // fecha_transaccion
      'reservado', // estado_actual
      '{}', // datos_estado
      new Date().toISOString(), // fecha_ultimo_estado
      new Date().toISOString().split('T')[0], // fecha_registro
      'test-query' // creado_por
    ]
    
    console.log('📤 Datos del cliente a insertar:')
    console.log(`   - Nombre: ${queryParams[14]}`)
    console.log(`   - Email: ${queryParams[15]}`)
    console.log(`   - Teléfono: ${queryParams[16]}`)
    console.log(`   - Cédula: ${queryParams[17]}`)
    console.log(`   - Tipo documento: ${queryParams[18]}`)
    
    console.log('\n🔍 Ejecutando consulta...')
    const result = await client.query(sql, queryParams)
    
    const created = result.rows[0]
    console.log('\n📥 Resultado:')
    console.log(`   - ID: ${created.id}`)
    console.log(`   - Cliente: ${created.cliente_nombre}`)
    console.log(`   - Email: ${created.cliente_email}`)
    console.log(`   - Teléfono: ${created.cliente_telefono}`)
    console.log(`   - Cédula: ${created.cliente_cedula}`)
    console.log(`   - Tipo documento: ${created.cliente_tipo_documento}`)
    
    if (created.cliente_nombre) {
      console.log('\n✅ Función query funciona correctamente')
    } else {
      console.log('\n❌ Función query no guarda los datos del cliente')
    }
    
    // Limpiar
    await client.query('DELETE FROM transacciones_departamentos WHERE id = $1', [created.id])
    console.log('\n🧹 Datos de prueba eliminados')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

testQueryFunction() 