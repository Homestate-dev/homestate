// Simular exactamente lo que hace el frontend sin filtros de fecha
async function testFrontendNoDates() {
  try {
    console.log('🧪 Probando API como lo hace el frontend (sin filtros de fecha)...\n');
    
    // Simular los parámetros exactos del frontend (sin fechas)
    const params = new URLSearchParams({
      search: '',
      type: 'all',
      status: 'all',
      agent: 'all',
      building: 'all'
    });
    
    console.log('📤 Parámetros de búsqueda:', params.toString());
    
    const response = await fetch(`https://homestate-17ca5a8016cd.herokuapp.com/api/sales-rentals/transactions?${params}`);
    const data = await response.json();
    
    console.log('📥 Respuesta completa:', {
      success: data.success,
      count: data.data?.length || 0
    });
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('\n📋 Transacciones encontradas:');
      data.data.forEach((transaction, index) => {
        console.log(`\n${index + 1}. Transacción:`);
        console.log(`   - ID: ${transaction.id}`);
        console.log(`   - Tipo: ${transaction.tipo_transaccion}`);
        console.log(`   - Valor: ${transaction.valor_transaccion}`);
        console.log(`   - Cliente: ${transaction.cliente_nombre}`);
        console.log(`   - Agente: ${transaction.agente_nombre}`);
        console.log(`   - Edificio: ${transaction.edificio_nombre}`);
        console.log(`   - Departamento: ${transaction.departamento_numero}`);
        console.log(`   - Estado: ${transaction.estado_actual}`);
      });
    } else {
      console.log('❌ No se encontraron transacciones');
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
  }
}

testFrontendNoDates(); 