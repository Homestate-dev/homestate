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

async function testAPIWithExactData() {
  try {
    console.log('🧪 PROBANDO API CON DATOS EXACTOS')
    console.log('==================================\n')
    
    // Usar exactamente los mismos datos que se envían desde el frontend
    const data = {
      departamento_id: 265,
      agente_id: 4,
      tipo_transaccion: 'arriendo',
      valor_transaccion: 250000000,
      comision_porcentaje: 3,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Debug API',
      currentUserUid: 'test-user-123',
      cliente_nombre: 'Test Cliente',
      cliente_email: 'test@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Datos exactos que se envían:')
    console.log(`   - Cliente: ${data.cliente_nombre}`)
    console.log(`   - Email: ${data.cliente_email}`)
    console.log(`   - Teléfono: ${data.cliente_telefono}`)
    console.log(`   - Cédula: ${data.cliente_cedula}`)
    
    // Procesar los datos exactamente como lo hace la API
    const comisionPorcentaje = data.comision_porcentaje || 3.0
    const valorTransaccion = parseFloat(data.valor_transaccion) || 0
    const comisionValor = data.tipo_transaccion === 'venta' 
      ? (valorTransaccion * comisionPorcentaje) / 100 
      : (parseFloat(data.comision_valor) || 0)
    
    const porcentajeHomestate = data.porcentaje_homestate || 60
    const porcentajeBienesRaices = data.porcentaje_bienes_raices || 30
    const porcentajeAdminEdificio = data.porcentaje_admin_edificio || 10
    
    const valorHomestate = (comisionValor * porcentajeHomestate) / 100
    const valorBienesRaices = (comisionValor * porcentajeBienesRaices) / 100
    const valorAdminEdificio = (comisionValor * porcentajeAdminEdificio) / 100

    // Asegurar que los datos del cliente se procesen correctamente
    const clienteNombre = data.cliente_nombre || null
    const clienteEmail = data.cliente_email || null
    const clienteTelefono = data.cliente_telefono || null
    const clienteCedula = data.cliente_cedula || null
    const clienteTipoDocumento = data.cliente_tipo_documento || 'CC'
    
    const queryParams = [
      data.departamento_id,
      data.agente_id,
      data.tipo_transaccion,
      valorTransaccion,
      data.precio_original || null,
      comisionValor,
      comisionPorcentaje,
      comisionValor,
      porcentajeHomestate,
      porcentajeBienesRaices,
      porcentajeAdminEdificio,
      valorHomestate,
      valorBienesRaices,
      valorAdminEdificio,
      clienteNombre,
      clienteEmail,
      clienteTelefono,
      clienteCedula,
      clienteTipoDocumento,
      data.notas || null,
      data.fecha_transaccion || new Date().toISOString(),
      data.estado_actual || 'reservado',
      data.datos_estado || '{}',
      new Date().toISOString(),
      data.fecha_registro || new Date().toISOString().split('T')[0],
      data.currentUserUid || 'system'
    ]
    
    console.log('\n📋 Parámetros procesados:')
    console.log(`   - Cliente: ${queryParams[14]}`)
    console.log(`   - Email: ${queryParams[15]}`)
    console.log(`   - Teléfono: ${queryParams[16]}`)
    console.log(`   - Cédula: ${queryParams[17]}`)
    
    // Usar exactamente la misma consulta SQL que usa la API
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
    
    console.log('\n🔍 Ejecutando consulta...')
    const result = await query(sql, queryParams)
    
    const created = result.rows[0]
    console.log('\n📥 Resultado:')
    console.log(`   - ID: ${created.id}`)
    console.log(`   - Cliente: ${created.cliente_nombre}`)
    console.log(`   - Email: ${created.cliente_email}`)
    console.log(`   - Teléfono: ${created.cliente_telefono}`)
    console.log(`   - Cédula: ${created.cliente_cedula}`)
    
    if (created.cliente_nombre) {
      console.log('\n✅ API funciona correctamente con datos exactos')
    } else {
      console.log('\n❌ API no guarda los datos del cliente')
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

testAPIWithExactData() 