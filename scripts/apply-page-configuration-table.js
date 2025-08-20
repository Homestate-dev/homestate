const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
};

async function createPageConfigurationTable() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Conectando a la base de datos...');
    
    // Verificar conexión
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create-page-configuration-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 Ejecutando script SQL...');
    
    // Ejecutar el script SQL
    await client.query(sqlContent);
    
    console.log('✅ Tabla page_configuration creada exitosamente');
    
    // Verificar que la tabla se creó
    const tableCheck = await client.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'page_configuration'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de la tabla creada:');
    console.table(tableCheck.rows);
    
    // Verificar datos por defecto
    const dataCheck = await client.query(`
      SELECT * FROM page_configuration ORDER BY created_at DESC LIMIT 1;
    `);
    
    if (dataCheck.rows.length > 0) {
      console.log('\n📊 Datos por defecto insertados:');
      console.table(dataCheck.rows);
    }
    
    // Verificar trigger
    const triggerCheck = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'page_configuration';
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('\n🔧 Triggers creados:');
      console.table(triggerCheck.rows);
    }
    
    client.release();
    console.log('\n🎉 Script ejecutado completamente');
    
  } catch (error) {
    console.error('❌ Error al ejecutar el script:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencias:');
      console.error('1. Verifica que PostgreSQL esté ejecutándose');
      console.error('2. Verifica las credenciales de la base de datos');
      console.error('3. Verifica que la base de datos exista');
    }
    
    if (error.code === '28P01') {
      console.error('\n💡 Error de autenticación:');
      console.error('Verifica el usuario y contraseña de la base de datos');
    }
    
    if (error.code === '3D000') {
      console.error('\n💡 Base de datos no encontrada:');
      console.error('Verifica que la base de datos especificada exista');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Función para probar la funcionalidad de la tabla
async function testPageConfigurationTable() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('\n🧪 Probando funcionalidad de la tabla...');
    
    const client = await pool.connect();
    
    // Probar inserción
    const insertResult = await client.query(`
      INSERT INTO page_configuration (whatsapp_number, tally_link) 
      VALUES ($1, $2) 
      RETURNING *;
    `, ['+56 9 8765 4321', 'https://tally.so/r/test']);
    
    console.log('✅ Inserción exitosa:', insertResult.rows[0]);
    
    // Probar actualización
    const updateResult = await client.query(`
      UPDATE page_configuration 
      SET whatsapp_number = $1, tally_link = $2 
      WHERE id = $3 
      RETURNING *;
    `, ['+56 9 1111 2222', 'https://tally.so/r/updated', insertResult.rows[0].id]);
    
    console.log('✅ Actualización exitosa:', updateResult.rows[0]);
    
    // Verificar que updated_at se actualizó
    if (updateResult.rows[0].updated_at > insertResult.rows[0].created_at) {
      console.log('✅ Trigger de updated_at funcionando correctamente');
    }
    
    // Limpiar datos de prueba
    await client.query('DELETE FROM page_configuration WHERE id = $1', [insertResult.rows[0].id]);
    console.log('✅ Datos de prueba eliminados');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    await pool.end();
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando creación de tabla page_configuration...\n');
  
  await createPageConfigurationTable();
  await testPageConfigurationTable();
  
  console.log('\n✨ Proceso completado exitosamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. La tabla page_configuration está lista para usar');
  console.log('2. Puedes ahora conectar el componente PageConfiguration a la base de datos');
  console.log('3. Los campos whatsapp_number y tally_link están disponibles para almacenar la configuración');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createPageConfigurationTable,
  testPageConfigurationTable
};
