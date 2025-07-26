async function testFrontendAPI() {
  try {
    console.log('🧪 Probando API desde el frontend...\n');
    
    // Simular la petición que hace el frontend
    const response = await fetch('/api/sales-rentals/transactions');
    const data = await response.json();
    
    console.log('✅ Respuesta de la API:');
    console.log('- Success:', data.success);
    console.log('- Count:', data.data?.length || 0);
    
    if (data.data && data.data.length > 0) {
      console.log('- Primera transacción:');
      console.log('  * ID:', data.data[0].id);
      console.log('  * Tipo:', data.data[0].tipo_transaccion);
      console.log('  * Valor:', data.data[0].valor_transaccion);
      console.log('  * Cliente:', data.data[0].cliente_nombre);
      console.log('  * Agente:', data.data[0].agente_nombre);
      console.log('  * Edificio:', data.data[0].edificio_nombre);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAPI(); 