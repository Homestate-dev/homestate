async function testFrontendAPI() {
  try {
    console.log('🧪 PROBANDO API DESDE FRONTEND')
    console.log('================================\n')
    
    // Usar exactamente los mismos datos que envía el frontend
    const testData = {
      departamento_id: 298,
      agente_id: 4,
      tipo_transaccion: 'venta',
      valor_transaccion: 250000000,
      comision_porcentaje: 3,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Test Frontend API',
      currentUserUid: 'test-user-123',
      cliente_nombre: 'Test Frontend Cliente',
      cliente_email: 'test.frontend@email.com',
      cliente_telefono: '3001234567',
      cliente_cedula: '12345678',
      cliente_tipo_documento: 'CC'
    }
    
    console.log('📤 Datos enviados desde frontend:')
    console.log(`   - Cliente: ${testData.cliente_nombre}`)
    console.log(`   - Email: ${testData.cliente_email}`)
    console.log(`   - Teléfono: ${testData.cliente_telefono}`)
    console.log(`   - Cédula: ${testData.cliente_cedula}`)
    
    // Llamar a la API exactamente como lo hace el frontend
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
    console.log(`   - Error: ${result.error}`)
    
    if (result.data) {
      console.log(`   - ID: ${result.data.id}`)
      console.log(`   - Cliente: ${result.data.cliente_nombre}`)
      console.log(`   - Email: ${result.data.cliente_email}`)
      console.log(`   - Teléfono: ${result.data.cliente_telefono}`)
      console.log(`   - Cédula: ${result.data.cliente_cedula}`)
      console.log(`   - Tipo documento: ${result.data.cliente_tipo_documento}`)
      
      if (result.data.cliente_nombre) {
        console.log('\n✅ API funciona correctamente desde frontend')
      } else {
        console.log('\n❌ API no guarda los datos del cliente desde frontend')
      }
    } else {
      console.log('\n❌ API devolvió error:', result.error)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testFrontendAPI() 