const { Pool } = require('pg');

// Configuración específica para Heroku PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'ec2-54-83-137-254.compute-1.amazonaws.com',
  database: 'd4vqj8qj8qj8qj8',
  password: 'p4ssw0rd',
  port: 5432,
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
    
    // Mostrar algunos departamentos antes de eliminar (para confirmación)
    const sampleResult = await client.query('SELECT id, numero, nombre, edificio_id FROM departamentos LIMIT 5');
    console.log('📋 Ejemplos de departamentos que serán eliminados:');
    sampleResult.rows.forEach(dept => {
      console.log(`   - ID: ${dept.id}, Número: ${dept.numero}, Nombre: ${dept.nombre}, Edificio: ${dept.edificio_id}`);
    });
    
    if (totalDepartments > 5) {
      console.log(`   ... y ${totalDepartments - 5} departamentos más`);
    }
    
    // Confirmación visual
    console.log('\n⚠️  ADVERTENCIA: Esta acción eliminará TODOS los departamentos de la base de datos.');
    console.log('   Esta acción NO se puede deshacer.');
    
    // Eliminar todos los departamentos
    console.log('\n🗑️  Eliminando todos los departamentos...');
    const deleteResult = await client.query('DELETE FROM departamentos');
    const deletedCount = deleteResult.rowCount;
    
    console.log(`✅ Departamentos eliminados: ${deletedCount}`);
    
    // Verificar que se eliminaron todos
    const verifyResult = await client.query('SELECT COUNT(*) FROM departamentos');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
      console.log('=' .repeat(60));
      console.log(`📈 RESUMEN FINAL:`);
      console.log(`   ✅ Departamentos eliminados: ${deletedCount}`);
      console.log(`   ✅ Departamentos restantes: ${remainingCount}`);
      console.log(`   ✅ Estado: Base de datos completamente limpia`);
      console.log('=' .repeat(60));
    } else {
      console.log('\n⚠️  ADVERTENCIA: Algunos departamentos no pudieron ser eliminados');
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
    console.log('🚀 SCRIPT DE LIMPIEZA DE DEPARTAMENTOS');
    console.log('=' .repeat(60));
    console.log('📅 Fecha y hora:', new Date().toLocaleString('es-ES'));
    console.log('=' .repeat(60));
    
    await clearAllDepartments();
    
    console.log('\n🎯 SCRIPT COMPLETADO EXITOSAMENTE');
    console.log('   Todos los departamentos han sido eliminados de la base de datos.');
    
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