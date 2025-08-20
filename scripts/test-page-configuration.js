const { Pool } = require('pg');

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

async function testPageConfiguration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🧪 Probando funcionalidad de page_configuration...\n');
    
    const client = await pool.connect();
    
    // 1. Verificar que la tabla existe
    console.log('1️⃣ Verificando existencia de la tabla...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'page_configuration'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabla page_configuration existe');
    } else {
      console.log('❌ Tabla page_configuration no existe');
      console.log('Ejecuta primero: node scripts/apply-page-configuration-table.js');
      return;
    }
    
    // 2. Verificar estructura de la tabla
    console.log('\n2️⃣ Verificando estructura de la tabla...');
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'page_configuration'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla:');
    console.table(structure.rows);
    
    // 3. Verificar datos existentes
    console.log('\n3️⃣ Verificando datos existentes...');
    const existingData = await client.query(`
      SELECT * FROM page_configuration ORDER BY created_at DESC;
    `);
    
    if (existingData.rows.length > 0) {
      console.log('📊 Datos existentes:');
      console.table(existingData.rows);
    } else {
      console.log('ℹ️  No hay datos en la tabla');
    }
    
    // 4. Probar inserción de datos
    console.log('\n4️⃣ Probando inserción de datos...');
    const testData = {
      whatsapp: '+56 9 1234 5678',
      tally: 'https://tally.so/r/test-configuration'
    };
    
    const insertResult = await client.query(`
      INSERT INTO page_configuration (whatsapp_number, tally_link) 
      VALUES ($1, $2) 
      RETURNING *;
    `, [testData.whatsapp, testData.tally]);
    
    console.log('✅ Datos insertados exitosamente:');
    console.table(insertResult.rows);
    
    // 5. Probar actualización de datos
    console.log('\n5️⃣ Probando actualización de datos...');
    const updatedData = {
      whatsapp: '+56 9 8765 4321',
      tally: 'https://tally.so/r/updated-configuration'
    };
    
    const updateResult = await client.query(`
      UPDATE page_configuration 
      SET whatsapp_number = $1, tally_link = $2 
      WHERE id = $3 
      RETURNING *;
    `, [updatedData.whatsapp, updatedData.tally, insertResult.rows[0].id]);
    
    console.log('✅ Datos actualizados exitosamente:');
    console.table(updateResult.rows);
    
    // 6. Verificar que updated_at se actualizó
    console.log('\n6️⃣ Verificando trigger de updated_at...');
    const originalCreated = insertResult.rows[0].created_at;
    const updatedUpdated = updateResult.rows[0].updated_at;
    
    if (updatedUpdated > originalCreated) {
      console.log('✅ Trigger de updated_at funcionando correctamente');
      console.log(`   Creado: ${originalCreated}`);
      console.log(`   Actualizado: ${updatedUpdated}`);
    } else {
      console.log('❌ Trigger de updated_at no funcionó correctamente');
    }
    
    // 7. Probar consulta de configuración actual
    console.log('\n7️⃣ Probando consulta de configuración actual...');
    const currentConfig = await client.query(`
      SELECT whatsapp_number, tally_link, updated_at 
      FROM page_configuration 
      ORDER BY updated_at DESC 
      LIMIT 1;
    `);
    
    console.log('📱 Configuración actual:');
    console.table(currentConfig.rows);
    
    // 8. Limpiar datos de prueba
    console.log('\n8️⃣ Limpiando datos de prueba...');
    await client.query('DELETE FROM page_configuration WHERE id = $1', [insertResult.rows[0].id]);
    console.log('✅ Datos de prueba eliminados');
    
    // 9. Verificar estado final
    console.log('\n9️⃣ Verificando estado final...');
    const finalData = await client.query(`
      SELECT COUNT(*) as total_records FROM page_configuration;
    `);
    
    console.log(`📊 Total de registros en la tabla: ${finalData.rows[0].total_records}`);
    
    client.release();
    
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('\n📝 La tabla page_configuration está lista para usar en tu aplicación');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencias:');
      console.error('1. Verifica que PostgreSQL esté ejecutándose');
      console.error('2. Verifica las credenciales de la base de datos');
      console.error('3. Ejecuta: node scripts/apply-page-configuration-table.js');
    }
    
    if (error.code === '28P01') {
      console.error('\n💡 Error de autenticación:');
      console.error('Verifica el usuario y contraseña de la base de datos');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Función para mostrar información de la tabla
async function showTableInfo() {
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    
    console.log('📊 Información de la tabla page_configuration:\n');
    
    // Mostrar estructura
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'page_configuration'
      ORDER BY ordinal_position;
    `);
    
    console.log('🏗️  Estructura:');
    console.table(structure.rows);
    
    // Mostrar datos
    const data = await client.query(`
      SELECT * FROM page_configuration ORDER BY updated_at DESC;
    `);
    
    if (data.rows.length > 0) {
      console.log('\n📱 Datos actuales:');
      console.table(data.rows);
    } else {
      console.log('\nℹ️  No hay datos en la tabla');
    }
    
    // Mostrar triggers
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'page_configuration';
    `);
    
    if (triggers.rows.length > 0) {
      console.log('\n🔧 Triggers activos:');
      console.table(triggers.rows);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error al obtener información:', error.message);
  } finally {
    await pool.end();
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--info') || args.includes('-i')) {
    await showTableInfo();
  } else {
    await testPageConfiguration();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testPageConfiguration,
  showTableInfo
};
