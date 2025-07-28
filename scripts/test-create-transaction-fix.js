#!/usr/bin/env node

/**
 * Script para probar la creación de transacciones con datos del cliente
 * Verifica que los campos del cliente se guarden correctamente
 */

const { Client } = require('pg')

// Configuración de la base de datos (misma que Heroku)
const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
}

async function testCreateTransactionFix() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🧪 PROBANDO CREACIÓN DE TRANSACCIÓN CON DATOS DEL CLIENTE')
    console.log('========================================================\n')
    
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Obtener un departamento y agente válidos
    console.log('1. 📋 OBTENIENDO DATOS DE PRUEBA')
    console.log('----------------------------------')
    
    const deptResult = await client.query(`
      SELECT id, numero, nombre 
      FROM departamentos 
      WHERE disponible = true 
      LIMIT 1
    `)
    
    const agentResult = await client.query(`
      SELECT id, nombre 
      FROM agentes_inmobiliarios 
      LIMIT 1
    `)
    
    if (deptResult.rows.length === 0 || agentResult.rows.length === 0) {
      console.log('❌ No se encontraron departamentos o agentes disponibles')
      return
    }
    
    const departamento = deptResult.rows[0]
    const agente = agentResult.rows[0]
    
    console.log(`   Departamento: ${departamento.numero} - ${departamento.nombre} (ID: ${departamento.id})`)
    console.log(`   Agente: ${agente.nombre} (ID: ${agente.id})`)

    // 2. Crear transacción de prueba con datos del cliente
    console.log('\n2. 📝 CREANDO TRANSACCIÓN DE PRUEBA')
    console.log('------------------------------------')
    
    const testTransaction = {
      departamento_id: departamento.id,
      agente_id: agente.id,
      tipo_transaccion: 'venta',
      valor_transaccion: 250000000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Transacción de prueba con datos del cliente',
      currentUserUid: 'test-user-123',
      // Datos del cliente
      cliente_nombre: 'Juan Pérez García',
      cliente_email: 'juan.perez@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('   Datos del cliente:')
    console.log(`   - Nombre: ${testTransaction.cliente_nombre}`)
    console.log(`   - Email: ${testTransaction.cliente_email}`)
    console.log(`   - Teléfono: ${testTransaction.cliente_telefono}`)
    console.log(`   - Cédula: ${testTransaction.cliente_cedula}`)
    console.log(`   - Tipo documento: ${testTransaction.cliente_tipo_documento}`)

    // 3. Insertar transacción directamente en la base de datos
    console.log('\n3. 💾 INSERTANDO TRANSACCIÓN EN LA BASE DE DATOS')
    console.log('------------------------------------------------')
    
    const comisionValor = (testTransaction.valor_transaccion * testTransaction.comision_porcentaje) / 100
    const valorHomestate = (comisionValor * testTransaction.porcentaje_homestate) / 100
    const valorBienesRaices = (comisionValor * testTransaction.porcentaje_bienes_raices) / 100
    const valorAdminEdificio = (comisionValor * testTransaction.porcentaje_admin_edificio) / 100

    const insertResult = await client.query(`
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
      testTransaction.departamento_id,
      testTransaction.agente_id,
      testTransaction.tipo_transaccion,
      testTransaction.valor_transaccion,
      null, // precio_original
      comisionValor,
      testTransaction.comision_porcentaje,
      comisionValor,
      testTransaction.porcentaje_homestate,
      testTransaction.porcentaje_bienes_raices,
      testTransaction.porcentaje_admin_edificio,
      valorHomestate,
      valorBienesRaices,
      valorAdminEdificio,
      testTransaction.cliente_nombre,
      testTransaction.cliente_email,
      testTransaction.cliente_telefono,
      testTransaction.cliente_cedula,
      testTransaction.cliente_tipo_documento,
      testTransaction.notas,
      testTransaction.fecha_transaccion,
      testTransaction.estado_actual,
      '{}', // datos_estado
      new Date().toISOString(),
      testTransaction.fecha_registro,
      testTransaction.currentUserUid
    ])

    const createdTransaction = insertResult.rows[0]
    console.log('   ✅ Transacción creada exitosamente')
    console.log(`   - ID: ${createdTransaction.id}`)
    console.log(`   - Cliente: ${createdTransaction.cliente_nombre}`)
    console.log(`   - Email: ${createdTransaction.cliente_email}`)
    console.log(`   - Teléfono: ${createdTransaction.cliente_telefono}`)
    console.log(`   - Cédula: ${createdTransaction.cliente_cedula}`)
    console.log(`   - Tipo documento: ${createdTransaction.cliente_tipo_documento}`)

    // 4. Verificar que se guardó correctamente
    console.log('\n4. 🔍 VERIFICANDO DATOS GUARDADOS')
    console.log('----------------------------------')
    
    const verifyResult = await client.query(`
      SELECT 
        id,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        cliente_cedula,
        cliente_tipo_documento,
        tipo_transaccion,
        precio_final
      FROM transacciones_departamentos 
      WHERE id = $1
    `, [createdTransaction.id])

    if (verifyResult.rows.length > 0) {
      const transaction = verifyResult.rows[0]
      console.log('   ✅ Datos verificados correctamente:')
      console.log(`   - ID: ${transaction.id}`)
      console.log(`   - Cliente: ${transaction.cliente_nombre}`)
      console.log(`   - Email: ${transaction.cliente_email}`)
      console.log(`   - Teléfono: ${transaction.cliente_telefono}`)
      console.log(`   - Cédula: ${transaction.cliente_cedula}`)
      console.log(`   - Tipo documento: ${transaction.cliente_tipo_documento}`)
      console.log(`   - Tipo transacción: ${transaction.tipo_transaccion}`)
      console.log(`   - Valor: ${transaction.precio_final}`)
    } else {
      console.log('❌ No se pudo verificar la transacción')
    }

    // 5. Limpiar datos de prueba
    console.log('\n5. 🧹 LIMPIANDO DATOS DE PRUEBA')
    console.log('--------------------------------')
    
    await client.query('DELETE FROM transacciones_departamentos WHERE id = $1', [createdTransaction.id])
    console.log('   ✅ Datos de prueba eliminados')

    console.log('\n🎉 Prueba completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
  } finally {
    await client.end()
  }
}

testCreateTransactionFix() 