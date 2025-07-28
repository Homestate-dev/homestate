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

async function testAPITableSelection() {
  try {
    console.log('🧪 PROBANDO SELECCIÓN DE TABLA DE LA API')
    console.log('==========================================\n')
    
    // Simular exactamente la misma lógica que usa la API
    console.log('1. 🔍 Verificando qué tabla de transacciones existe...')
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
    
    // Verificar si hay transacciones activas (exactamente como la API)
    console.log('\n2. 🔍 Verificando transacciones activas...')
    const existingTransaction = await query(
      `SELECT id FROM ${tableName} WHERE departamento_id = $1 AND tipo_transaccion = $2 AND estado_actual IN ($3, $4)`,
      [265, 'arriendo', 'reservado', 'promesa_compra_venta']
    )
    
    console.log(`   - Transacciones activas encontradas: ${existingTransaction.rows.length}`)
    
    if (existingTransaction.rows.length > 0) {
      console.log('\n❌ El departamento ya tiene una transacción activa')
      return
    }
    
    // Construir la query según la tabla que existe (exactamente como la API)
    console.log('\n3. 🔍 Construyendo consulta SQL...')
    let sql
    let queryParams
    
    if (hasTransaccionesDepartamentos) {
      console.log('   - Usando tabla transacciones_departamentos')
      sql = `
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
      
      // Procesar datos exactamente como la API
      const data = {
        departamento_id: 265,
        agente_id: 4,
        tipo_transaccion: 'arriendo',
        valor_transaccion: 250000000,
        comision_porcentaje: 3,
        porcentaje_homestate: 60,
        porcentaje_bienes_raices: 30,
        porcentaje_admin_edificio: 10,
        cliente_nombre: 'Test Table Selection',
        cliente_email: 'test.table@email.com',
        cliente_telefono: '3001234567',
        cliente_cedula: '12345678',
        cliente_tipo_documento: 'CC'
      }
      
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
      
      queryParams = [
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
      
      console.log('\n4. 🔍 Ejecutando inserción...')
      const result = await query(sql, queryParams)
      
      const created = result.rows[0]
      console.log('\n📥 Resultado:')
      console.log(`   - ID: ${created.id}`)
      console.log(`   - Cliente: ${created.cliente_nombre}`)
      console.log(`   - Email: ${created.cliente_email}`)
      console.log(`   - Teléfono: ${created.cliente_telefono}`)
      console.log(`   - Cédula: ${created.cliente_cedula}`)
      
      if (created.cliente_nombre) {
        console.log('\n✅ API funciona correctamente con selección de tabla')
      } else {
        console.log('\n❌ API no guarda los datos del cliente')
      }
      
      // Limpiar
      await query('DELETE FROM transacciones_departamentos WHERE id = $1', [created.id])
      console.log('\n🧹 Datos de prueba eliminados')
      
    } else {
      console.log('   - Usando tabla transacciones_ventas_arriendos')
      // No implementado para esta prueba
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

testAPITableSelection() 