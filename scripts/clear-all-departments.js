const { Pool } = require('pg');

// Configuración de la base de datos Heroku
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearAllDepartments() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando limpieza de todos los departamentos...');
    
    // Primero contar cuántos departamentos hay
    const countResult = await client.query('SELECT COUNT(*) FROM departamentos');
    const totalDepartments = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de departamentos encontrados: ${totalDepartments}`);
    
    if (totalDepartments === 0) {
      console.log('✅ No hay departamentos para eliminar. La base de datos ya está limpia.');
      return;
    }
    
    // Eliminar todos los departamentos
    const deleteResult = await client.query('DELETE FROM departamentos');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`🗑️  Departamentos eliminados: ${deletedCount}`);
    
    // Verificar que se eliminaron todos
    const verifyResult = await client.query('SELECT COUNT(*) FROM departamentos');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('✅ ¡Limpieza completada exitosamente!');
      console.log(`📈 Resumen:`);
      console.log(`   - Departamentos eliminados: ${deletedCount}`);
      console.log(`   - Departamentos restantes: ${remainingCount}`);
      console.log(`   - Estado: Base de datos limpia`);
    } else {
      console.log('⚠️  Advertencia: Algunos departamentos no pudieron ser eliminados');
      console.log(`   - Departamentos restantes: ${remainingCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando script de limpieza de departamentos...');
    console.log('=' .repeat(50));
    
    await clearAllDepartments();
    
    console.log('=' .repeat(50));
    console.log('🎉 Script completado exitosamente');
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { clearAllDepartments }; 