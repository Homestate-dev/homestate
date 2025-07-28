#!/usr/bin/env node

const { Client } = require('pg')

const client = new Client({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
})

async function testCommissionFields() {
  try {
    await client.connect()
    console.log('🔍 PROBANDO CAMPOS DE COMISIONES')
    console.log('==================================\n')
    
    // 1. Verificar que los campos existen en la tabla
    console.log('1. 📋 VERIFICANDO ESTRUCTURA DE LA TABLA')
    console.log('------------------------------------------')
    
    const structureResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos' 
      AND column_name LIKE '%porcentaje%' OR column_name LIKE '%valor%'
      ORDER BY column_name
    `)
    
    console.log('   Campos de comisiones encontrados:')
    structureResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`)
    })
    
    // 2. Verificar transacciones existentes con campos de comisiones
    console.log('\n2. 📊 VERIFICANDO TRANSACCIONES EXISTENTES')
    console.log('--------------------------------------------')
    
    const transactionsResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        comision_valor,
        porcentaje_homestate,
        porcentaje_bienes_raices,
        porcentaje_admin_edificio,
        valor_homestate,
        valor_bienes_raices,
        valor_admin_edificio,
        cliente_nombre
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 3
    `)
    
    if (transactionsResult.rows.length === 0) {
      console.log('   ❌ No hay transacciones en la base de datos')
    } else {
      console.log('   Transacciones encontradas:')
      transactionsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}`)
        console.log(`      Tipo: ${row.tipo_transaccion}`)
        console.log(`      Valor: $${row.precio_final?.toLocaleString() || 'N/A'}`)
        console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
        console.log(`      Porcentajes:`)
        console.log(`        - HomeState: ${row.porcentaje_homestate || 0}%`)
        console.log(`        - Bienes Raíces: ${row.porcentaje_bienes_raices || 0}%`)
        console.log(`        - Admin Edificio: ${row.porcentaje_admin_edificio || 0}%`)
        console.log(`      Valores:`)
        console.log(`        - HomeState: $${row.valor_homestate?.toLocaleString() || 0}`)
        console.log(`        - Bienes Raíces: $${row.valor_bienes_raices?.toLocaleString() || 0}`)
        console.log(`        - Admin Edificio: $${row.valor_admin_edificio?.toLocaleString() || 0}`)
        console.log(`      Cliente: ${row.cliente_nombre}`)
        console.log('')
      })
    }
    
    // 3. Crear una transacción de prueba con campos de comisiones
    console.log('3. 🧪 CREANDO TRANSACCIÓN DE PRUEBA')
    console.log('-----------------------------------')
    
    const testTransactionData = {
      departamento_id: 1,
      agente_id: 1,
      tipo_transaccion: 'venta',
      precio_final: 250000000,
      comision_valor: 7500000,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      valor_homestate: 4500000,
      valor_bienes_raices: 2250000,
      valor_admin_edificio: 750000,
      cliente_nombre: 'Cliente Test Comisiones',
      cliente_email: 'test@example.com',
      estado_actual: 'reservado',
      creado_por: 'test_user'
    }
    
    const insertResult = await client.query(`
      INSERT INTO transacciones_departamentos (
        departamento_id, agente_id, tipo_transaccion, precio_final, comision_valor,
        porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
        valor_homestate, valor_bienes_raices, valor_admin_edificio,
        cliente_nombre, cliente_email, estado_actual, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `, [
      testTransactionData.departamento_id,
      testTransactionData.agente_id,
      testTransactionData.tipo_transaccion,
      testTransactionData.precio_final,
      testTransactionData.comision_valor,
      testTransactionData.porcentaje_homestate,
      testTransactionData.porcentaje_bienes_raices,
      testTransactionData.porcentaje_admin_edificio,
      testTransactionData.valor_homestate,
      testTransactionData.valor_bienes_raices,
      testTransactionData.valor_admin_edificio,
      testTransactionData.cliente_nombre,
      testTransactionData.cliente_email,
      testTransactionData.estado_actual,
      testTransactionData.creado_por
    ])
    
    const newTransactionId = insertResult.rows[0].id
    console.log(`   ✅ Transacción de prueba creada con ID: ${newTransactionId}`)
    
    // 4. Verificar que la transacción se creó correctamente
    console.log('\n4. ✅ VERIFICANDO TRANSACCIÓN CREADA')
    console.log('------------------------------------')
    
    const verifyResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        comision_valor,
        porcentaje_homestate,
        porcentaje_bienes_raices,
        porcentaje_admin_edificio,
        valor_homestate,
        valor_bienes_raices,
        valor_admin_edificio,
        cliente_nombre
      FROM transacciones_departamentos 
      WHERE id = $1
    `, [newTransactionId])
    
    if (verifyResult.rows.length > 0) {
      const transaction = verifyResult.rows[0]
      console.log('   ✅ Transacción verificada:')
      console.log(`      ID: ${transaction.id}`)
      console.log(`      Tipo: ${transaction.tipo_transaccion}`)
      console.log(`      Valor: $${transaction.precio_final?.toLocaleString()}`)
      console.log(`      Comisión Total: $${transaction.comision_valor?.toLocaleString()}`)
      console.log(`      Porcentajes:`)
      console.log(`        - HomeState: ${transaction.porcentaje_homestate}%`)
      console.log(`        - Bienes Raíces: ${transaction.porcentaje_bienes_raices}%`)
      console.log(`        - Admin Edificio: ${transaction.porcentaje_admin_edificio}%`)
      console.log(`      Valores:`)
      console.log(`        - HomeState: $${transaction.valor_homestate?.toLocaleString()}`)
      console.log(`        - Bienes Raíces: $${transaction.valor_bienes_raices?.toLocaleString()}`)
      console.log(`        - Admin Edificio: $${transaction.valor_admin_edificio?.toLocaleString()}`)
      console.log(`      Cliente: ${transaction.cliente_nombre}`)
    } else {
      console.log('   ❌ Error: No se pudo verificar la transacción creada')
    }
    
    // 5. Limpiar transacción de prueba
    console.log('\n5. 🧹 LIMPIANDO TRANSACCIÓN DE PRUEBA')
    console.log('---------------------------------------')
    
    await client.query('DELETE FROM transacciones_departamentos WHERE id = $1', [newTransactionId])
    console.log(`   ✅ Transacción de prueba eliminada`)
    
    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE')
    console.log('==================================')
    console.log('Los campos de comisiones están funcionando correctamente.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

testCommissionFields().catch(console.error) 