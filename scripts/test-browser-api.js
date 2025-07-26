// Simular el comportamiento del frontend
async function testBrowserAPI() {
  try {
    console.log('🧪 Probando API como lo hace el frontend...\n');
    
    // Probar sin filtros de fecha primero
    console.log('📤 Probando SIN filtros de fecha...');
    const response1 = await fetch(`https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions`);
    const data1 = await response1.json();
    
    console.log('📥 Respuesta sin filtros:', {
      success: data1.success,
      count: data1.data?.length || 0
    });
    
    // Probar con filtros de fecha
    console.log('\n📤 Probando CON filtros de fecha...');
    const params = new URLSearchParams({
      search: '',
      type: 'all',
      status: 'all',
      agent: 'all',
      building: 'all',
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    });
    
    console.log('📤 Parámetros de búsqueda:', params.toString());
    
    const response2 = await fetch(`https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions?${params}`);
    const data2 = await response2.json();
    
    console.log('📥 Respuesta con filtros:', {
      success: data2.success,
      count: data2.data?.length || 0
    });
    
    if (data1.success && data1.data && data1.data.length > 0) {
      console.log('\n📋 Primera transacción (sin filtros):');
      const first = data1.data[0];
      console.log('- ID:', first.id);
      console.log('- Tipo:', first.tipo_transaccion);
      console.log('- Valor:', first.valor_transaccion);
      console.log('- Cliente:', first.cliente_nombre);
      console.log('- Fecha transacción:', first.fecha_transaccion);
      console.log('- Fecha registro:', first.fecha_registro);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testBrowserAPI(); 