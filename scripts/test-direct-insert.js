const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: { rejectUnauthorized: false }
})

async function testDirectInsert() {
  try {
    await client.connect()
    console.log('🧪 PROBANDO INSERCIÓN DIRECTA')
    console.log('==============================\n')
    
    // Datos de prueba
    const testData = {
      departamento_id: 269,
      agente_id: 4,
      tipo_transaccion: 'venta',
      valor_transaccion: 250000000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      cliente_nombre: 'Test Cliente Directo',
      cliente_email: 'test.directo@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Datos a insertar:')
    console.log(`   - Cliente: ${testData.cliente_nombre}`)
    console.log(`   - Email: ${testData.cliente_email}`)
    console.log(`   - Teléfono: ${testData.cliente_telefono}`)
    console.log(`   - Cédula: ${testData.cliente_cedula}`)
    
    // Calcular valores
    const comisionValor = (testData.valor_transaccion * testData.comision_porcentaje) / 100
    const valorHomestate = (comisionValor * testData.porcentaje_homestate) / 100
    const valorBienesRaices = (comisionValor * testData.porcentaje_bienes_raices) / 100
    const valorAdminEdificio = (comisionValor * testData.porcentaje_admin_edificio) / 100
    
    // Insertar directamente
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
      testData.departamento_id,
      testData.agente_id,
      testData.tipo_transaccion,
      testData.valor_transaccion,
      null, // precio_original
      comisionValor,
      testData.comision_porcentaje,
      comisionValor,
      testData.porcentaje_homestate,
      testData.porcentaje_bienes_raices,
      testData.porcentaje_admin_edificio,
      valorHomestate,
      valorBienesRaices,
      valorAdminEdificio,
      testData.cliente_nombre,
      testData.cliente_email,
      testData.cliente_telefono,
      testData.cliente_cedula,
      testData.cliente_tipo_documento,
      'Prueba inserción directa',
      new Date().toISOString(),
      'reservado',
      '{}',
      new Date().toISOString(),
      new Date().toISOString().split('T')[0],
      'test-direct'
    ])
    
    const created = result.rows[0]
    console.log('\n📥 Resultado de la inserción:')
    console.log(`   - ID: ${created.id}`)
    console.log(`   - Cliente: ${created.cliente_nombre}`)
    console.log(`   - Email: ${created.cliente_email}`)
    console.log(`   - Teléfono: ${created.cliente_telefono}`)
    console.log(`   - Cédula: ${created.cliente_cedula}`)
    console.log(`   - Tipo documento: ${created.cliente_tipo_documento}`)
    
    if (created.cliente_nombre) {
      console.log('\n✅ Inserción directa exitosa - Los datos del cliente se guardaron correctamente')
    } else {
      console.log('\n❌ Inserción directa falló - Los datos del cliente están NULL')
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

testDirectInsert() 