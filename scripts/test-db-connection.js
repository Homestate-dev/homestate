const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'homestate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function testConnection() {
  console.log('🔍 Probando conexión a la base de datos...\n');
  
  console.log('Configuración actual:');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT || 5432}`);
  console.log(`Database: ${process.env.DB_NAME || 'homestate'}`);
  console.log(`User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`Password: ${process.env.DB_PASSWORD ? '***' : 'password'}\n`);
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL!');
    
    // Probar consulta simple
    const result = await client.query('SELECT version()');
    console.log('✅ Consulta exitosa');
    console.log(`Versión de PostgreSQL: ${result.rows[0].version}`);
    
    // Verificar si la base de datos homestate existe
    const dbExists = await client.query(`
      SELECT datname FROM pg_database WHERE datname = 'homestate'
    `);
    
    if (dbExists.rows.length > 0) {
      console.log('✅ Base de datos "homestate" existe');
    } else {
      console.log('❌ Base de datos "homestate" no existe');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verifica que PostgreSQL esté ejecutándose');
    console.log('2. Verifica las credenciales en tu archivo .env');
    console.log('3. Verifica que la base de datos "homestate" exista');
    console.log('4. Si usas Heroku, verifica la variable DATABASE_URL');
  }
}

testConnection().catch(console.error); 