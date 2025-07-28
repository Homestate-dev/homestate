const fetch = require('node-fetch')

async function debugAPI() {
  try {
    console.log('🔍 DEBUGGEANDO API')
    console.log('==================\n')
    
    const testData = {
      departamento_id: 272,
      agente_id: 4,
      tipo_transaccion: 'venta',
      valor_transaccion: 250000000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Debug API',
      currentUserUid: 'test-user-123',
      cliente_nombre: 'Debug Cliente',
      cliente_email: 'debug@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Datos enviados:')
    console.log(JSON.stringify(testData, null, 2))
    
    const response = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    console.log('\n📥 Respuesta de la API:')
    console.log(JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

debugAPI() 