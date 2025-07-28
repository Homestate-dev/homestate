#!/usr/bin/env node

/**
 * Script para probar la API de creación de transacciones
 * Verifica que la API funcione correctamente con datos del cliente
 */

async function testAPITransaction() {
  try {
    console.log('🧪 PROBANDO API DE CREACIÓN DE TRANSACCIONES')
    console.log('============================================\n')
    
    // Datos de prueba
    const testData = {
      departamento_id: 271, // Usar el tercer departamento disponible
      agente_id: 4, // Usar el mismo agente de la prueba anterior
      tipo_transaccion: 'arriendo',
      valor_transaccion: 300000000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Transacción de prueba desde API',
      currentUserUid: 'test-user-123',
      // Datos del cliente
      cliente_nombre: 'María Rodríguez López',
      cliente_email: 'maria.rodriguez@email.com',
      cliente_telefono: '3109876543',
      cliente_cedula: '87654321',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Datos a enviar:')
    console.log(`   - Cliente: ${testData.cliente_nombre}`)
    console.log(`   - Email: ${testData.cliente_email}`)
    console.log(`   - Teléfono: ${testData.cliente_telefono}`)
    console.log(`   - Cédula: ${testData.cliente_cedula}`)
    console.log(`   - Tipo documento: ${testData.cliente_tipo_documento}`)
    console.log(`   - Valor: ${testData.valor_transaccion}`)
    console.log(`   - Tipo: ${testData.tipo_transaccion}`)

    // Hacer la petición POST a la API
    console.log('\n📡 Enviando petición a la API...')
    
    const response = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    console.log('\n📥 Respuesta de la API:')
    console.log(`   - Success: ${result.success}`)
    console.log(`   - Error: ${result.error || 'Ninguno'}`)
    
    if (result.success && result.data) {
      console.log(`   - ID creado: ${result.data.id}`)
      console.log(`   - Cliente guardado: ${result.data.cliente_nombre}`)
      console.log(`   - Email guardado: ${result.data.cliente_email}`)
      console.log(`   - Teléfono guardado: ${result.data.cliente_telefono}`)
      console.log(`   - Cédula guardada: ${result.data.cliente_cedula}`)
      console.log(`   - Tipo documento guardado: ${result.data.cliente_tipo_documento}`)
      
      console.log('\n✅ Transacción creada exitosamente a través de la API')
    } else {
      console.log('\n❌ Error al crear transacción:')
      console.log(`   - ${result.error}`)
    }

    // Probar obtener las transacciones para verificar que aparece
    console.log('\n📋 Verificando que la transacción aparece en la lista...')
    
    const getResponse = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions')
    const getResult = await getResponse.json()
    
    if (getResult.success && getResult.data) {
      const newTransaction = getResult.data.find(t => 
        t.cliente_nombre === testData.cliente_nombre && 
        t.valor_transaccion === testData.valor_transaccion
      )
      
      if (newTransaction) {
        console.log('✅ Transacción encontrada en la lista:')
        console.log(`   - ID: ${newTransaction.id}`)
        console.log(`   - Cliente: ${newTransaction.cliente_nombre}`)
        console.log(`   - Email: ${newTransaction.cliente_email}`)
        console.log(`   - Teléfono: ${newTransaction.cliente_telefono}`)
        console.log(`   - Cédula: ${newTransaction.cliente_cedula}`)
        console.log(`   - Tipo documento: ${newTransaction.cliente_tipo_documento}`)
      } else {
        console.log('❌ Transacción no encontrada en la lista')
      }
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message)
  }
}

testAPITransaction() 