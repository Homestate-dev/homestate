// Script simplificado para eliminar restricción UNIQUE
console.log('🚀 Iniciando script para eliminar restricción UNIQUE...');

// Intentar usar fetch para llamar al endpoint API
async function removeConstraintViaAPI() {
  try {
    console.log('🌐 Usando endpoint API para eliminar restricción...');
    
    // Usar la API local
    const response = await fetch('http://localhost:3000/api/remove-unique-constraint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Éxito:', data.message);
      if (data.results) {
        data.results.forEach(result => {
          console.log(`  - ${result.constraint}: ${result.status} - ${result.message}`);
        });
      }
    } else {
      console.error('❌ Error desde API:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error al llamar API:', error.message);
    console.log('\n💡 Alternativa: Ejecutar SQL directamente en la base de datos:');
    console.log(`
-- SQL para eliminar restricción manualmente:
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'transacciones_ventas_arriendos' 
AND constraint_type = 'UNIQUE';

-- Luego ejecutar (reemplaza NOMBRE_RESTRICCION con el nombre encontrado):
-- ALTER TABLE transacciones_ventas_arriendos DROP CONSTRAINT NOMBRE_RESTRICCION;
    `);
  }
}

removeConstraintViaAPI();
