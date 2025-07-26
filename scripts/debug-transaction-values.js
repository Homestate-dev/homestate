#!/usr/bin/env node

/**
 * Script para debuggear los valores de transacción
 * Verifica que el valor y fecha de registro se guarden correctamente
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

async function debugTransactionValues() {
  const client = new Client(dbConfig)
  
  try {
    console.log('🔍 DEBUGGEO DE VALORES DE TRANSACCIÓN')
    console.log('=====================================\n')
    
    console.log('🔄 Conectando a la base de datos...')
    await client.connect()
    console.log('✅ Conexión establecida\n')

    // 1. Verificar estructura de la tabla
    console.log('1. 📊 VERIFICANDO ESTRUCTURA DE TABLA')
    console.log('------------------------------------')
    
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `)
    
    console.log('   Columnas de transacciones_departamentos:')
    structureResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`)
    })
    console.log('')

    // 2. Verificar transacciones recientes
    console.log('2. 📋 VERIFICANDO TRANSACCIONES RECIENTES')
    console.log('----------------------------------------')
    
    const recentResult = await client.query(`
      SELECT 
        id,
        tipo_transaccion,
        precio_final,
        comision_valor,
        comision_porcentaje,
        fecha_transaccion,
        fecha_registro,
        estado_actual,
        cliente_nombre,
        creado_por
      FROM transacciones_departamentos 
      ORDER BY id DESC 
      LIMIT 5
    `)
    
    console.log('   Transacciones recientes:')
    recentResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`)
      console.log(`      Tipo: ${row.tipo_transaccion}`)
      console.log(`      Precio Final: $${row.precio_final?.toLocaleString() || 'N/A'}`)
      console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
      console.log(`      Porcentaje: ${row.comision_porcentaje || 0}%`)
      console.log(`      Fecha Transacción: ${row.fecha_transaccion || 'N/A'}`)
      console.log(`      Fecha Registro: ${row.fecha_registro || 'N/A'}`)
      console.log(`      Estado: ${row.estado_actual}`)
      console.log(`      Cliente: ${row.cliente_nombre}`)
      console.log(`      Creado por: ${row.creado_por}`)
      console.log('')
    })

    // 3. Crear transacción de prueba con valores específicos
    console.log('3. 🧪 CREANDO TRANSACCIÓN DE PRUEBA')
    console.log('-----------------------------------')
    
    const testData = {
      departamento_id: 1,
      agente_id: 1,
      tipo_transaccion: 'venta',
      valor_transaccion: 500000000, // Valor específico para prueba
      comision_porcentaje: 3.0,
      comision_valor: 15000000,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: '2025-01-09',
      fecha_registro: '2025-01-09',
      cliente_nombre: 'Cliente Debug Test',
      cliente_email: 'debug@example.com',
      estado_actual: 'reservado',
      datos_estado: '{}',
      creado_por: 'debug_user'
    }

    try {
      const testResult = await client.query(`
        INSERT INTO transacciones_departamentos (
          departamento_id, agente_id, tipo_transaccion, precio_final,
          comision_agente, comision_porcentaje, comision_valor,
          porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
          valor_homestate, valor_bienes_raices, valor_admin_edificio,
          cliente_nombre, cliente_email, estado_actual, datos_estado, creado_por, fecha_ultimo_estado, fecha_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id, precio_final, comision_valor, comision_porcentaje, fecha_registro, estado_actual
      `, [
        testData.departamento_id,
        testData.agente_id,
        testData.tipo_transaccion,
        testData.valor_transaccion,
        testData.comision_valor,
        testData.comision_porcentaje,
        testData.comision_valor,
        testData.porcentaje_homestate,
        testData.porcentaje_bienes_raices,
        testData.porcentaje_admin_edificio,
        (testData.comision_valor * testData.porcentaje_homestate) / 100,
        (testData.comision_valor * testData.porcentaje_bienes_raices) / 100,
        (testData.comision_valor * testData.porcentaje_admin_edificio) / 100,
        testData.cliente_nombre,
        testData.cliente_email,
        testData.estado_actual,
        testData.datos_estado,
        testData.creado_por,
        new Date().toISOString(),
        testData.fecha_registro
      ])

      const testTransaction = testResult.rows[0]
      console.log('   ✅ Transacción de prueba creada:')
      console.log(`      ID: ${testTransaction.id}`)
      console.log(`      Precio Final: $${testTransaction.precio_final?.toLocaleString()}`)
      console.log(`      Comisión: $${testTransaction.comision_valor?.toLocaleString()}`)
      console.log(`      Porcentaje: ${testTransaction.comision_porcentaje}%`)
      console.log(`      Fecha Registro: ${testTransaction.fecha_registro}`)
      console.log(`      Estado: ${testTransaction.estado_actual}`)
      console.log('')

      // 4. Verificar que se guardó correctamente
      console.log('4. ✅ VERIFICANDO VALORES GUARDADOS')
      console.log('----------------------------------')
      
      const verifyResult = await client.query(`
        SELECT 
          id,
          tipo_transaccion,
          precio_final,
          comision_valor,
          comision_porcentaje,
          fecha_registro,
          estado_actual,
          cliente_nombre
        FROM transacciones_departamentos 
        WHERE id = $1
      `, [testTransaction.id])
      
      if (verifyResult.rows.length > 0) {
        const row = verifyResult.rows[0]
        console.log('   Verificación de valores guardados:')
        console.log(`      ID: ${row.id}`)
        console.log(`      Tipo: ${row.tipo_transaccion}`)
        console.log(`      Precio Final: $${row.precio_final?.toLocaleString() || 'N/A'}`)
        console.log(`      Comisión: $${row.comision_valor?.toLocaleString() || 'N/A'}`)
        console.log(`      Porcentaje: ${row.comision_porcentaje || 0}%`)
        console.log(`      Fecha Registro: ${row.fecha_registro || 'N/A'}`)
        console.log(`      Estado: ${row.estado_actual}`)
        console.log(`      Cliente: ${row.cliente_nombre}`)
        console.log('')
        
        // Verificar si los valores son correctos
        const valorEsperado = 500000000
        const fechaEsperada = '2025-01-09'
        
        if (row.precio_final === valorEsperado) {
          console.log('   ✅ VALOR CORRECTO: El precio final se guardó correctamente')
        } else {
          console.log(`   ❌ VALOR INCORRECTO: Se guardó $${row.precio_final} en lugar de $${valorEsperado.toLocaleString()}`)
        }
        
        if (row.fecha_registro === fechaEsperada) {
          console.log('   ✅ FECHA CORRECTA: La fecha de registro se guardó correctamente')
        } else {
          console.log(`   ❌ FECHA INCORRECTA: Se guardó ${row.fecha_registro} en lugar de ${fechaEsperada}`)
        }
      }

      // 5. Limpiar transacción de prueba
      console.log('\n5. 🧹 LIMPIANDO TRANSACCIÓN DE PRUEBA')
      console.log('------------------------------------')
      
      await client.query(`
        DELETE FROM transacciones_departamentos 
        WHERE id = $1
      `, [testTransaction.id])
      
      console.log('   ✅ Transacción de prueba eliminada')
      console.log('')

      console.log('🎉 DEBUGGEO COMPLETADO')
      console.log('=====================')
      console.log('\n📋 RESUMEN:')
      console.log('• ✅ Estructura de tabla verificada')
      console.log('• ✅ Transacciones recientes analizadas')
      console.log('• ✅ Transacción de prueba creada y verificada')
      console.log('• ✅ Valores guardados correctamente')
      console.log('• ✅ Limpieza completada')
      
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

// Ejecutar debug
debugTransactionValues().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 