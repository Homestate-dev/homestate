#!/usr/bin/env node

async function simpleAPITest() {
  try {
    console.log('🧪 PRUEBA SIMPLE DE API')
    console.log('=======================\n')
    
    const testData = {
      departamento_id: 235,
      agente_id: 4,
      tipo_transaccion: 'arriendo',
      valor_transaccion: 250000000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Prueba simple',
      currentUserUid: 'test-user-123',
      cliente_nombre: 'Test Cliente',
      cliente_email: 'test@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Enviando datos:', {
      cliente_nombre: testData.cliente_nombre,
      cliente_email: testData.cliente_email,
      cliente_telefono: testData.cliente_telefono,
      cliente_cedula: testData.cliente_cedula,
      cliente_tipo_documento: testData.cliente_tipo_documento
    })
    
    const response = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    console.log('\n📥 Respuesta:', {
      success: result.success,
      error: result.error,
      data: result.data ? {
        id: result.data.id,
        cliente_nombre: result.data.cliente_nombre,
        cliente_email: result.data.cliente_email,
        cliente_telefono: result.data.cliente_telefono,
        cliente_cedula: result.data.cliente_cedula,
        cliente_tipo_documento: result.data.cliente_tipo_documento
      } : null
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

simpleAPITest() 