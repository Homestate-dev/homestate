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

async function limpiarAdminAcciones() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando limpieza de la tabla admin_acciones...');
    
    // Primero contar cuántas acciones hay
    const countResult = await client.query('SELECT COUNT(*) FROM admin_acciones');
    const totalAcciones = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Total de acciones encontradas: ${totalAcciones}`);
    
    if (totalAcciones === 0) {
      console.log('✅ No hay acciones para eliminar. La tabla ya está limpia.');
      return;
    }
    
    // Mostrar información de las acciones antes de eliminar
    console.log('\n📋 Información de las acciones a eliminar:');
    const sampleData = await client.query(`
      SELECT 
        aa.id,
        aa.admin_firebase_uid,
        aa.accion,
        aa.tipo,
        aa.fecha,
        aa.metadata
      FROM admin_acciones aa
      LIMIT 5
    `);
    
    sampleData.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id} | Admin UID: ${row.admin_firebase_uid} | Acción: ${row.accion} | Tipo: ${row.tipo} | Fecha: ${row.fecha}`);
    });
    
    if (totalAcciones > 5) {
      console.log(`   ... y ${totalAcciones - 5} acciones más`);
    }
    
    // Confirmar la eliminación
    console.log('\n⚠️  ADVERTENCIA: Esta acción eliminará TODAS las acciones de administradores de la tabla.');
    console.log('   Esta operación NO se puede deshacer.');
    
    // Eliminar todas las acciones
    console.log('\n🗑️  Eliminando todas las acciones...');
    const deleteResult = await client.query('DELETE FROM admin_acciones');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`✅ Acciones eliminadas: ${deletedCount}`);
    
    // Verificar que se eliminaron todas
    const verifyResult = await client.query('SELECT COUNT(*) FROM admin_acciones');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('🎉 ¡Limpieza completada exitosamente!');
      console.log(`📈 Resumen:`);
      console.log(`   - Acciones eliminadas: ${deletedCount}`);
      console.log(`   - Acciones restantes: ${remainingCount}`);
      console.log(`   - Estado: Tabla completamente limpia`);
    } else {
      console.log('⚠️  Advertencia: Algunas acciones no pudieron ser eliminadas');
      console.log(`   - Acciones restantes: ${remainingCount}`);
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
    console.log('🚀 Iniciando script de limpieza de admin_acciones...');
    console.log('=' .repeat(50));
    
    await limpiarAdminAcciones();
    
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

module.exports = { limpiarAdminAcciones };
