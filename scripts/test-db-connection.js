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

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a la base de datos...');
    
    const client = await pool.connect();
    console.log('✅ Conexión exitosa');
    
    // Verificar tablas de transacciones
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('transacciones_departamentos', 'transacciones_ventas_arriendos')
      AND table_schema = 'public'
    `);
    
    console.log('📋 Tablas de transacciones encontradas:', result.rows.map(r => r.table_name));
    
    // Contar registros en cada tabla
    for (const row of result.rows) {
      const count = await client.query(`SELECT COUNT(*) as total FROM "${row.table_name}"`);
      console.log(`📊 ${row.table_name}: ${count.rows[0].total} registros`);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection(); 