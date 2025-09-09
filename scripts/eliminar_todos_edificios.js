const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
});

async function eliminarTodosEdificios() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando eliminación de TODOS los edificios...');
    
    // Primero verificar que no hay departamentos
    const countDepartamentos = await client.query('SELECT COUNT(*) FROM departamentos');
    const totalDepartamentos = parseInt(countDepartamentos.rows[0].count);
    
    if (totalDepartamentos > 0) {
      console.log(`❌ ERROR: Aún hay ${totalDepartamentos} departamentos en la tabla departamentos.`);
      console.log('   Debes eliminar primero TODOS los departamentos antes de eliminar edificios.');
      console.log('   Ejecuta primero: node scripts/eliminar_todos_departamentos.js');
      return;
    }
    
    console.log('✅ Verificación exitosa: No hay departamentos que impidan la eliminación de edificios.');
    
    // Contar cuántos edificios hay
    const countResult = await client.query('SELECT COUNT(*) FROM edificios');
    const totalEdificios = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de edificios encontrados: ${totalEdificios}`);
    
    if (totalEdificios === 0) {
      console.log('✅ No hay edificios para eliminar. La tabla ya está limpia.');
      return;
    }
    
    // Mostrar información de los edificios antes de eliminar
    console.log('\n📋 Información de los edificios a eliminar:');
    const sampleData = await client.query(`
      SELECT 
        e.id,
        e.nombre,
        e.direccion,
        e.permalink,
        e.costo_expensas,
        e.fecha_creacion,
        e.descripcion
      FROM edificios e
      LIMIT 10
    `);
    
    sampleData.rows.forEach((edificio, index) => {
      console.log(`   ${index + 1}. ID: ${edificio.id} | Nombre: ${edificio.nombre} | Dirección: ${edificio.direccion.substring(0, 50)}... | Permalink: ${edificio.permalink}`);
    });
    
    if (totalEdificios > 10) {
      console.log(`   ... y ${totalEdificios - 10} edificios más`);
    }
    
    // Mostrar estadísticas de costos
    console.log('\n💰 Estadísticas de costos:');
    const costStats = await client.query(`
      SELECT 
        COUNT(*) as total_edificios,
        AVG(costo_expensas) as promedio_expensas,
        MIN(costo_expensas) as min_expensas,
        MAX(costo_expensas) as max_expensas
      FROM edificios
      WHERE costo_expensas > 0
    `);
    
    if (costStats.rows[0].total_edificios > 0) {
      const stats = costStats.rows[0];
      console.log(`   - Edificios con expensas: ${stats.total_edificios}`);
      console.log(`   - Promedio de expensas: $${parseFloat(stats.promedio_expensas).toFixed(2)}`);
      console.log(`   - Mínimo de expensas: $${parseFloat(stats.min_expensas).toFixed(2)}`);
      console.log(`   - Máximo de expensas: $${parseFloat(stats.max_expensas).toFixed(2)}`);
    } else {
      console.log('   - No hay edificios con costos de expensas registrados');
    }
    
    // Confirmar la eliminación
    console.log('\n⚠️  ADVERTENCIA CRÍTICA: Esta acción eliminará TODOS los edificios de la tabla.');
    console.log('   Esta operación NO se puede deshacer.');
    console.log('   Se eliminarán todos los edificios y su información asociada.');
    
    // Eliminar todos los edificios
    console.log('\n🗑️  Eliminando todos los edificios...');
    const deleteResult = await client.query('DELETE FROM edificios');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`✅ Edificios eliminados: ${deletedCount}`);
    
    // Verificar que se eliminaron todos
    const verifyResult = await client.query('SELECT COUNT(*) FROM edificios');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('🎉 ¡Eliminación completada exitosamente!');
      console.log(`📈 Resumen:`);
      console.log(`   - Edificios eliminados: ${deletedCount}`);
      console.log(`   - Edificios restantes: ${remainingCount}`);
      console.log(`   - Estado: Tabla edificios completamente limpia`);
      console.log(`\n🎯 Proceso completo: Se han eliminado departamentos y edificios exitosamente.`);
    } else {
      console.log('⚠️  Advertencia: Algunos edificios no pudieron ser eliminados');
      console.log(`   - Edificios restantes: ${remainingCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando script de eliminación de TODOS los edificios...');
    console.log('=' .repeat(70));
    console.log('📋 IMPORTANTE: Este script debe ejecutarse DESPUÉS de eliminar departamentos');
    console.log('   debido a las restricciones de clave foránea.');
    console.log('=' .repeat(70));
    
    await eliminarTodosEdificios();
    
    console.log('=' .repeat(70));
    console.log('🎉 Script de eliminación de edificios completado exitosamente');
    console.log('🎯 Proceso de limpieza completo: departamentos + edificios eliminados.');
    
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

module.exports = { eliminarTodosEdificios };



