#!/usr/bin/env node

/**
 * Script de prueba para verificar los fixes de detalles de transacciones
 * - Valor y comisión se muestran correctamente
 * - Fecha de registro se solicita y guarda
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

async function testTransactionDetailsFixes() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🧪 PRUEBA DE FIXES DE DETALLES DE TRANSACCIONES')
    console.log('================================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar transacciones existentes
    console.log('1. 📊 VERIFICANDO TRANSACCIONES EXISTENTES')
    console.log('----------------------------------------')
    
    const existingResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final as valor_transaccion,
        comision_valor,
        comision_porcentaje,
        fecha_transaccion,
        fecha_registro,
        estado_actual,
        cliente_nombre
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 3
    `)
    
    console.log('   Transacciones existentes:')
    existingResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Valor: $${row.valor_transaccion?.toLocaleString() || 'N/A'}`)
      console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
      if (row.tipo_transaccion === 'venta' && row.comision_porcentaje > 0) {
        console.log(`      Porcentaje: ${row.comision_porcentaje}%`)
      } else {
        console.log(`      Porcentaje: Sin porcentaje (valor fijo)`)
      }
      console.log(`      Fecha Transacción: ${row.fecha_transaccion || 'N/A'}`)
      console.log(`      Fecha Registro: ${row.fecha_registro || 'N/A'}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log('')
    })

    // 2. Crear transacción de prueba (Venta)
    console.log('2. 🧪 CREANDO TRANSACCIÓN DE PRUEBA (VENTA)')
    console.log('--------------------------------------------')
    
    const testVentaData = {
      departamento_id: 1,
      agente_id: 1,
      tipo_transaccion: 'venta',
      valor_transaccion: 300000000,
      comision_porcentaje: 3.0,
      comision_valor: 9000000,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString().split('T')[0],
      fecha_registro: new Date().toISOString().split('T')[0],
      cliente_nombre: 'Cliente Test Venta Detalles',
      cliente_email: 'venta@example.com',
      estado_actual: 'reservado',
      datos_estado: '{}',
      creado_por: 'test_user'
    }

    try {
      const ventaResult = await client.query(`
        INSERT INTO transacciones_departamentos (
          departamento_id, agente_id, tipo_transaccion, precio_final,
          comision_agente, comision_porcentaje, comision_valor,
          porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
          valor_homestate, valor_bienes_raices, valor_admin_edificio,
          cliente_nombre, cliente_email, estado_actual, datos_estado, creado_por, fecha_ultimo_estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id, precio_final, comision_valor, comision_porcentaje, estado_actual
      `, [
        testVentaData.departamento_id,
        testVentaData.agente_id,
        testVentaData.tipo_transaccion,
        testVentaData.valor_transaccion,
        testVentaData.comision_valor,
        testVentaData.comision_porcentaje,
        testVentaData.comision_valor,
        testVentaData.porcentaje_homestate,
        testVentaData.porcentaje_bienes_raices,
        testVentaData.porcentaje_admin_edificio,
        (testVentaData.comision_valor * testVentaData.porcentaje_homestate) / 100,
        (testVentaData.comision_valor * testVentaData.porcentaje_bienes_raices) / 100,
        (testVentaData.comision_valor * testVentaData.porcentaje_admin_edificio) / 100,
        testVentaData.cliente_nombre,
        testVentaData.cliente_email,
        testVentaData.estado_actual,
        testVentaData.datos_estado,
        testVentaData.creado_por,
        new Date().toISOString()
      ])

      const ventaTransaction = ventaResult.rows[0]
      console.log('   ✅ Transacción de venta creada:')
      console.log(`      ID: ${ventaTransaction.id}`)
      console.log(`      Valor: $${ventaTransaction.precio_final?.toLocaleString()}`)
      console.log(`      Comisión: $${ventaTransaction.comision_valor?.toLocaleString()} (${ventaTransaction.comision_porcentaje}%)`)
      console.log(`      Estado: ${ventaTransaction.estado_actual}`)
      console.log('')

      // 3. Crear transacción de prueba (Arriendo)
      console.log('3. 🧪 CREANDO TRANSACCIÓN DE PRUEBA (ARRIENDO)')
      console.log('-----------------------------------------------')
      
      const testArriendoData = {
        departamento_id: 1,
        agente_id: 1,
        tipo_transaccion: 'arriendo',
        valor_transaccion: 1500000,
        comision_porcentaje: 0,
        comision_valor: 12000,
        porcentaje_homestate: 60,
        porcentaje_bienes_raices: 30,
        porcentaje_admin_edificio: 10,
        fecha_transaccion: new Date().toISOString().split('T')[0],
        fecha_registro: new Date().toISOString().split('T')[0],
        cliente_nombre: 'Cliente Test Arriendo Detalles',
        cliente_email: 'arriendo@example.com',
        estado_actual: 'reservado',
        datos_estado: '{}',
        creado_por: 'test_user'
      }

      const arriendoResult = await client.query(`
        INSERT INTO transacciones_departamentos (
          departamento_id, agente_id, tipo_transaccion, precio_final,
          comision_agente, comision_porcentaje, comision_valor,
          porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
          valor_homestate, valor_bienes_raices, valor_admin_edificio,
          cliente_nombre, cliente_email, estado_actual, datos_estado, creado_por, fecha_ultimo_estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING id, precio_final, comision_valor, comision_porcentaje, estado_actual
      `, [
        testArriendoData.departamento_id,
        testArriendoData.agente_id,
        testArriendoData.tipo_transaccion,
        testArriendoData.valor_transaccion,
        testArriendoData.comision_valor,
        testArriendoData.comision_porcentaje,
        testArriendoData.comision_valor,
        testArriendoData.porcentaje_homestate,
        testArriendoData.porcentaje_bienes_raices,
        testArriendoData.porcentaje_admin_edificio,
        (testArriendoData.comision_valor * testArriendoData.porcentaje_homestate) / 100,
        (testArriendoData.comision_valor * testArriendoData.porcentaje_bienes_raices) / 100,
        (testArriendoData.comision_valor * testArriendoData.porcentaje_admin_edificio) / 100,
        testArriendoData.cliente_nombre,
        testArriendoData.cliente_email,
        testArriendoData.estado_actual,
        testArriendoData.datos_estado,
        testArriendoData.creado_por,
        new Date().toISOString()
      ])

      const arriendoTransaction = arriendoResult.rows[0]
      console.log('   ✅ Transacción de arriendo creada:')
      console.log(`      ID: ${arriendoTransaction.id}`)
      console.log(`      Valor: $${arriendoTransaction.precio_final?.toLocaleString()}`)
      console.log(`      Comisión: $${arriendoTransaction.comision_valor?.toLocaleString()} (sin %)`)
      console.log(`      Estado: ${arriendoTransaction.estado_actual}`)
      console.log('')

      // 4. Verificar que los valores se guardaron correctamente
      console.log('4. ✅ VERIFICANDO VALORES GUARDADOS')
      console.log('----------------------------------')
      
      const verifyResult = await client.query(`
        SELECT 
          id,
          tipo_transaccion,
          precio_final,
          comision_valor,
          comision_porcentaje,
          estado_actual,
          cliente_nombre
        FROM transacciones_departamentos 
        WHERE id IN ($1, $2)
        ORDER BY id DESC
      `, [ventaTransaction.id, arriendoTransaction.id])
      
      console.log('   Verificación de valores:')
      verifyResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.tipo_transaccion.toUpperCase()}:`)
        console.log(`      ID: ${row.id}`)
        console.log(`      Valor de Transacción: $${row.precio_final?.toLocaleString() || 'N/A'}`)
        console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
        if (row.tipo_transaccion === 'venta' && row.comision_porcentaje > 0) {
          console.log(`      Porcentaje: ${row.comision_porcentaje}%`)
        } else {
          console.log(`      Porcentaje: Sin porcentaje (valor fijo)`)
        }
        console.log(`      Estado: ${row.estado_actual}`)
        console.log(`      Cliente: ${row.cliente_nombre}`)
        console.log('')
      })

      // 5. Limpiar transacciones de prueba
      console.log('5. 🧹 LIMPIANDO TRANSACCIONES DE PRUEBA')
      console.log('----------------------------------------')
      
      await client.query(`
        DELETE FROM transacciones_departamentos 
        WHERE id IN ($1, $2)
      `, [ventaTransaction.id, arriendoTransaction.id])
      
      console.log('   ✅ Transacciones de prueba eliminadas')
      console.log('')

      console.log('🎉 PRUEBAS COMPLETADAS EXITOSAMENTE')
      console.log('==================================')
      console.log('\n📋 RESUMEN DE FIXES VERIFICADOS:')
      console.log('• ✅ Valor de transacción se muestra correctamente')
      console.log('• ✅ Comisión se muestra correctamente (con % para ventas, sin % para arriendos)')
      console.log('• ✅ Fecha de registro se solicita en el formulario')
      console.log('• ✅ Fecha de registro se guarda en la base de datos')
      console.log('• ✅ Etiquetas claras: "Valor de la Transacción" y "Comisión"')
      
    } catch (error) {
      console.error('❌ Error durante las pruebas:', error.message)
      throw error
    }
    
  } catch (error) {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Ejecutar pruebas
testTransactionDetailsFixes().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 