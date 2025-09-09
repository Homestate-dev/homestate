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

async function eliminarTodosDepartamentos() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando eliminación de TODOS los departamentos...');
    
    // Primero contar cuántos departamentos hay
    const countResult = await client.query('SELECT COUNT(*) FROM departamentos');
    const totalDepartamentos = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de departamentos encontrados: ${totalDepartamentos}`);
    
    if (totalDepartamentos === 0) {
      console.log('✅ No hay departamentos para eliminar. La tabla ya está limpia.');
      return;
    }
    
    // Mostrar información de los departamentos antes de eliminar
    console.log('\n📋 Información de los departamentos a eliminar:');
    const sampleData = await client.query(`
      SELECT 
        d.id,
        d.numero,
        d.nombre,
        d.piso,
        d.area_total,
        d.tipo,
        d.estado,
        d.valor_arriendo,
        d.valor_venta,
        d.disponible,
        e.nombre as edificio_nombre
      FROM departamentos d
      LEFT JOIN edificios e ON d.edificio_id = e.id
      LIMIT 10
    `);
    
    sampleData.rows.forEach((depto, index) => {
      console.log(`   ${index + 1}. ID: ${depto.id} | Número: ${depto.numero} | Nombre: ${depto.nombre} | Piso: ${depto.piso} | Edificio: ${depto.edificio_nombre}`);
    });
    
    if (totalDepartamentos > 10) {
      console.log(`   ... y ${totalDepartamentos - 10} departamentos más`);
    }
    
    // Mostrar estadísticas por edificio
    console.log('\n🏢 Distribución por edificio:');
    const statsByBuilding = await client.query(`
      SELECT 
        e.nombre as edificio_nombre,
        COUNT(d.id) as cantidad_departamentos
      FROM departamentos d
      LEFT JOIN edificios e ON d.edificio_id = e.id
      GROUP BY e.id, e.nombre
      ORDER BY cantidad_departamentos DESC
    `);
    
    statsByBuilding.rows.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat.edificio_nombre || 'Sin edificio'}: ${stat.cantidad_departamentos} departamentos`);
    });
    
    // Confirmar la eliminación
    console.log('\n⚠️  ADVERTENCIA CRÍTICA: Esta acción eliminará TODOS los departamentos de la tabla.');
    console.log('   Esta operación NO se puede deshacer.');
    console.log('   Se eliminarán departamentos de todos los edificios.');
    
    // Eliminar todos los departamentos
    console.log('\n🗑️  Eliminando todos los departamentos...');
    const deleteResult = await client.query('DELETE FROM departamentos');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`✅ Departamentos eliminados: ${deletedCount}`);
    
    // Verificar que se eliminaron todos
    const verifyResult = await client.query('SELECT COUNT(*) FROM departamentos');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('🎉 ¡Eliminación completada exitosamente!');
      console.log(`📈 Resumen:`);
      console.log(`   - Departamentos eliminados: ${deletedCount}`);
      console.log(`   - Departamentos restantes: ${remainingCount}`);
      console.log(`   - Estado: Tabla departamentos completamente limpia`);
      console.log(`\n💡 Próximo paso: Ahora puedes ejecutar el script para eliminar edificios.`);
    } else {
      console.log('⚠️  Advertencia: Algunos departamentos no pudieron ser eliminados');
      console.log(`   - Departamentos restantes: ${remainingCount}`);
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
    console.log('🚀 Iniciando script de eliminación de TODOS los departamentos...');
    console.log('=' .repeat(70));
    console.log('📋 IMPORTANTE: Este script debe ejecutarse ANTES de eliminar edificios');
    console.log('   debido a las restricciones de clave foránea.');
    console.log('=' .repeat(70));
    
    await eliminarTodosDepartamentos();
    
    console.log('=' .repeat(70));
    console.log('🎉 Script de eliminación de departamentos completado exitosamente');
    console.log('💡 Ahora puedes ejecutar el script para eliminar edificios.');
    
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

module.exports = { eliminarTodosDepartamentos };



