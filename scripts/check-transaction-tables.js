const { Pool } = require('pg');

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

async function checkTransactionTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 VERIFICANDO TABLAS DE TRANSACCIONES');
    console.log('=====================================\n');
    
    // Verificar si existen las tablas de transacciones
    const tables = ['transacciones_departamentos', 'transacciones_ventas_arriendos'];
    
    for (const tableName of tables) {
      console.log(`📋 Verificando tabla: ${tableName}`);
      
      // Verificar si la tabla existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1 AND table_schema = 'public'
        ) AS exists
      `, [tableName]);
      
      if (tableExists.rows[0].exists) {
        console.log(`   ✅ La tabla ${tableName} existe`);
        
        // Contar registros
        const count = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);
        console.log(`   📊 Total de registros: ${count.rows[0].total}`);
        
        // Mostrar algunos registros de ejemplo
        if (parseInt(count.rows[0].total) > 0) {
          const sample = await client.query(`SELECT * FROM "${tableName}" LIMIT 3`);
          console.log('   📋 Ejemplos de datos:');
          sample.rows.forEach((row, index) => {
            console.log(`      ${index + 1}. ID: ${row.id}, Cliente: ${row.cliente_nombre || 'N/A'}, Tipo: ${row.tipo_transaccion || 'N/A'}`);
          });
        }
      } else {
        console.log(`   ❌ La tabla ${tableName} NO existe`);
      }
      
      console.log('');
    }
    
    // Verificar otras tablas relacionadas
    const relatedTables = ['administradores', 'departamentos', 'edificios'];
    console.log('🔍 VERIFICANDO TABLAS RELACIONADAS');
    console.log('==================================\n');
    
    for (const tableName of relatedTables) {
      const count = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);
      console.log(`📊 ${tableName}: ${count.rows[0].total} registros`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTransactionTables().catch(console.error); 