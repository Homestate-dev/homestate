const { Pool } = require('pg');

// Configuración exacta de la base de datos de Heroku (igual que tus otros scripts)
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

async function removeUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Conectado a la base de datos');

    // Verificar restricciones UNIQUE existentes
    console.log('\n🔍 Verificando restricciones UNIQUE en transacciones_ventas_arriendos...');
    
    const checkConstraintsQuery = `
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'transacciones_ventas_arriendos' 
      AND constraint_type = 'UNIQUE';
    `;
    
    const constraintsResult = await client.query(checkConstraintsQuery);
    
    if (constraintsResult.rows.length === 0) {
      console.log('⚠️ No se encontraron restricciones UNIQUE en la tabla');
      return;
    }
    
    console.log('📋 Restricciones UNIQUE encontradas:');
    constraintsResult.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type}`);
    });

    // Eliminar cada restricción UNIQUE
    for (const constraint of constraintsResult.rows) {
      console.log(`\n🗑️ Eliminando restricción: ${constraint.constraint_name}...`);
      
      try {
        const dropQuery = `ALTER TABLE transacciones_ventas_arriendos DROP CONSTRAINT ${constraint.constraint_name};`;
        await client.query(dropQuery);
        console.log(`✅ Restricción ${constraint.constraint_name} eliminada exitosamente`);
      } catch (error) {
        console.error(`❌ Error al eliminar restricción ${constraint.constraint_name}:`, error.message);
      }
    }

    // Verificar que se eliminaron las restricciones
    console.log('\n🔍 Verificando eliminación...');
    const finalCheckResult = await client.query(checkConstraintsQuery);
    
    if (finalCheckResult.rows.length === 0) {
      console.log('✅ Todas las restricciones UNIQUE fueron eliminadas exitosamente');
      console.log('🎉 Ahora se pueden crear múltiples transacciones del mismo tipo para el mismo departamento');
    } else {
      console.log('⚠️ Algunas restricciones aún permanecen:');
      finalCheckResult.rows.forEach(row => {
        console.log(`  - ${row.constraint_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Mensaje del error:', error.message);
    console.error('❌ Stack trace:', error.stack);
  } finally {
    client.release();
  }
}

// Ejecutar el script
removeUniqueConstraint().catch(console.error);
