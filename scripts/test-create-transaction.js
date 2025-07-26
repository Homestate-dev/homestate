// Probar la creación de transacciones
async function testCreateTransaction() {
  try {
    console.log('🧪 Probando creación de transacción...\n');
    
    const postData = {
      departamento_id: 298,
      agente_id: 100,
      tipo_transaccion: 'arriendo',
      valor_transaccion: 540,
      comision_porcentaje: 3.0,
      porcentaje_homestate: 60,
      porcentaje_bienes_raices: 30,
      porcentaje_admin_edificio: 10,
      fecha_transaccion: new Date().toISOString(),
      fecha_registro: new Date().toISOString().split('T')[0],
      estado_actual: 'reservado',
      notas: 'Transacción de prueba',
      currentUserUid: 'test-user-123',
      cliente_nombre: 'Cliente de Prueba' // Agregar cliente_nombre
    };
    
    console.log('📤 Datos a enviar:', postData);
    
    const response = await fetch('https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    const result = await response.json();
    
    console.log('📥 Respuesta:', {
      success: result.success,
      error: result.error,
      data: result.data ? { id: result.data.id } : null
    });
    
    if (result.success) {
      console.log('✅ Transacción creada exitosamente');
    } else {
      console.log('❌ Error al crear transacción:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testCreateTransaction(); 