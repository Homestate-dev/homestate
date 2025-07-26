async function testTransactionsAPI() {
  try {
    console.log('🧪 Probando API de transacciones...\n');
    
    // Probar GET
    console.log('📥 Probando GET /api/sales-rentals/transactions');
    const getResponse = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions');
    const getData = await getResponse.json();
    
    console.log('✅ GET Response:', {
      success: getData.success,
      count: getData.data?.length || 0,
      firstTransaction: getData.data?.[0] ? {
        id: getData.data[0].id,
        tipo: getData.data[0].tipo_transaccion,
        valor: getData.data[0].valor_transaccion,
        cliente: getData.data[0].cliente_nombre
      } : null
    });
    
    // Probar POST (crear transacción)
    console.log('\n📤 Probando POST /api/sales-rentals/transactions');
    const postData = {
      departamento_id: 235, // Usar un departamento que existe
      agente_id: 34, // Usar un agente que existe
      tipo_transaccion: 'venta',
      valor_transaccion: 500000,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Transacción de prueba',
      currentUserUid: 'test-user'
    };
    
    const postResponse = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    const postResult = await postResponse.json();
    console.log('✅ POST Response:', {
      success: postResult.success,
      error: postResult.error,
      data: postResult.data ? { id: postResult.data.id } : null
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTransactionsAPI(); 