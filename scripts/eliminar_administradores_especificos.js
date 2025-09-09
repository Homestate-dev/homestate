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

async function eliminarAdministradoresEspecificos() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando eliminación de administradores específicos...');
    
    const emailsAEliminar = ['jose@email.com', 'tomas@email.com'];
    
    // ===== ELIMINAR DE TABLA ADMINISTRADORES =====
    console.log('\n📋 ELIMINANDO DE TABLA: administradores');
    console.log('=' .repeat(50));
    
    // Contar administradores antes
    const countAdminsBefore = await client.query('SELECT COUNT(*) FROM administradores');
    const totalAdminsBefore = parseInt(countAdminsBefore.rows[0].count);
    console.log(`📊 Total de administradores antes: ${totalAdminsBefore}`);
    
    // Mostrar administradores a eliminar
    const adminsAEliminar = await client.query(`
      SELECT id, nombre, email, firebase_uid, activo
      FROM administradores 
      WHERE email IN ($1, $2)
    `, emailsAEliminar);
    
    if (adminsAEliminar.rows.length === 0) {
      console.log('✅ No se encontraron administradores con esos emails para eliminar.');
    } else {
      console.log(`📋 Administradores a eliminar (${adminsAEliminar.rows.length}):`);
      adminsAEliminar.rows.forEach((admin, index) => {
        console.log(`   ${index + 1}. ID: ${admin.id} | Nombre: ${admin.nombre} | Email: ${admin.email} | Activo: ${admin.activo}`);
      });
      
      // Eliminar administradores
      const deleteAdminsResult = await client.query(`
        DELETE FROM administradores 
        WHERE email IN ($1, $2)
      `, emailsAEliminar);
      
      console.log(`🗑️  Administradores eliminados: ${deleteAdminsResult.rowCount}`);
    }
    
    // Verificar administradores restantes
    const countAdminsAfter = await client.query('SELECT COUNT(*) FROM administradores');
    const totalAdminsAfter = parseInt(countAdminsAfter.rows[0].count);
    console.log(`📊 Total de administradores después: ${totalAdminsAfter}`);
    
    // ===== ELIMINAR DE TABLA AGENTES_INMOBILIARIOS =====
    console.log('\n📋 ELIMINANDO DE TABLA: agentes_inmobiliarios');
    console.log('=' .repeat(50));
    
    // Contar agentes antes
    const countAgentesBefore = await client.query('SELECT COUNT(*) FROM agentes_inmobiliarios');
    const totalAgentesBefore = parseInt(countAgentesBefore.rows[0].count);
    console.log(`📊 Total de agentes antes: ${totalAgentesBefore}`);
    
    // Mostrar agentes a eliminar
    const agentesAEliminar = await client.query(`
      SELECT id, nombre, email, telefono, especialidad, activo
      FROM agentes_inmobiliarios 
      WHERE email IN ($1, $2)
    `, emailsAEliminar);
    
    if (agentesAEliminar.rows.length === 0) {
      console.log('✅ No se encontraron agentes con esos emails para eliminar.');
    } else {
      console.log(`📋 Agentes a eliminar (${agentesAEliminar.rows.length}):`);
      agentesAEliminar.rows.forEach((agente, index) => {
        console.log(`   ${index + 1}. ID: ${agente.id} | Nombre: ${agente.nombre} | Email: ${agente.email} | Especialidad: ${agente.especialidad} | Activo: ${agente.activo}`);
      });
      
      // Eliminar agentes
      const deleteAgentesResult = await client.query(`
        DELETE FROM agentes_inmobiliarios 
        WHERE email IN ($1, $2)
      `, emailsAEliminar);
      
      console.log(`🗑️  Agentes eliminados: ${deleteAgentesResult.rowCount}`);
    }
    
    // Verificar agentes restantes
    const countAgentesAfter = await client.query('SELECT COUNT(*) FROM agentes_inmobiliarios');
    const totalAgentesAfter = parseInt(countAgentesAfter.rows[0].count);
    console.log(`📊 Total de agentes después: ${totalAgentesAfter}`);
    
    // ===== RESUMEN FINAL =====
    console.log('\n📈 RESUMEN FINAL');
    console.log('=' .repeat(50));
    console.log(`🏢 Administradores:`);
    console.log(`   - Antes: ${totalAdminsBefore}`);
    console.log(`   - Después: ${totalAdminsAfter}`);
    console.log(`   - Eliminados: ${totalAdminsBefore - totalAdminsAfter}`);
    
    console.log(`\n👨‍💼 Agentes:`);
    console.log(`   - Antes: ${totalAgentesBefore}`);
    console.log(`   - Después: ${totalAgentesAfter}`);
    console.log(`   - Eliminados: ${totalAgentesBefore - totalAgentesAfter}`);
    
    console.log(`\n📧 Emails eliminados: ${emailsAEliminar.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando script de eliminación de administradores específicos...');
    console.log('📧 Emails objetivo: jose@email.com, tomas@email.com');
    console.log('=' .repeat(70));
    
    await eliminarAdministradoresEspecificos();
    
    console.log('=' .repeat(70));
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

module.exports = { eliminarAdministradoresEspecificos };



