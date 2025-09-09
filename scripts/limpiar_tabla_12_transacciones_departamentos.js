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

async function limpiarTransaccionesDepartamentos() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando limpieza de la tabla transacciones_departamentos...');
    
    // Primero contar cuántas transacciones hay
    const countResult = await client.query('SELECT COUNT(*) FROM transacciones_departamentos');
    const totalTransacciones = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de transacciones encontradas: ${totalTransacciones}`);
    
    if (totalTransacciones === 0) {
      console.log('✅ No hay transacciones para eliminar. La tabla ya está limpia.');
      return;
    }
    
    // Mostrar información de las transacciones antes de eliminar
    console.log('\n📋 Información de las transacciones a eliminar:');
    const sampleData = await client.query(`
      SELECT 
        td.id,
        td.cliente_nombre,
        td.tipo_transaccion,
        td.precio_final,
        td.estado_actual,
        td.fecha_transaccion
      FROM transacciones_departamentos td
      LIMIT 5
    `);
    
    sampleData.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id} | Cliente: ${row.cliente_nombre} | Tipo: ${row.tipo_transaccion} | Estado: ${row.estado_actual}`);
    });
    
    if (totalTransacciones > 5) {
      console.log(`   ... y ${totalTransacciones - 5} transacciones más`);
    }
    
    // Confirmar la eliminación
    console.log('\n⚠️  ADVERTENCIA: Esta acción eliminará TODAS las transacciones de la tabla.');
    console.log('   Esta operación NO se puede deshacer.');
    
    // Eliminar todas las transacciones
    console.log('\n🗑️  Eliminando todas las transacciones...');
    const deleteResult = await client.query('DELETE FROM transacciones_departamentos');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`✅ Transacciones eliminadas: ${deletedCount}`);
    
    // Verificar que se eliminaron todas
    const verifyResult = await client.query('SELECT COUNT(*) FROM transacciones_departamentos');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('🎉 ¡Limpieza completada exitosamente!');
      console.log(`📈 Resumen:`);
      console.log(`   - Transacciones eliminadas: ${deletedCount}`);
      console.log(`   - Transacciones restantes: ${remainingCount}`);
      console.log(`   - Estado: Tabla completamente limpia`);
    } else {
      console.log('⚠️  Advertencia: Algunas transacciones no pudieron ser eliminadas');
      console.log(`   - Transacciones restantes: ${remainingCount}`);
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
    console.log('🚀 Iniciando script de limpieza de transacciones_departamentos...');
    console.log('=' .repeat(60));
    
    await limpiarTransaccionesDepartamentos();
    
    console.log('=' .repeat(60));
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

module.exports = { limpiarTransaccionesDepartamentos };

