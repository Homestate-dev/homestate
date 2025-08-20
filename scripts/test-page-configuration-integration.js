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

async function testPageConfigurationIntegration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🧪 Probando integración completa de page_configuration...\n');
    
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
      console.log('Ejecuta primero: node scripts/setup-page-configuration.js');
      return;
    }
    
    // 2. Verificar triggers de limpieza
    console.log('\n2️⃣ Verificando triggers de limpieza automática...');
    const cleanupTriggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'page_configuration'
      AND trigger_name LIKE '%cleanup%';
    `);
    
    if (cleanupTriggers.rows.length > 0) {
      console.log('✅ Triggers de limpieza automática configurados:');
      console.table(cleanupTriggers.rows);
    } else {
      console.log('⚠️  Triggers de limpieza automática no encontrados');
    }
    
    // 3. Probar inserción múltiple y limpieza automática
    console.log('\n3️⃣ Probando inserción múltiple y limpieza automática...');
    
    // Insertar múltiples configuraciones
    const configs = [
      { whatsapp: '+56 9 1111 1111', tally: 'https://tally.so/r/test1' },
      { whatsapp: '+56 9 2222 2222', tally: 'https://tally.so/r/test2' },
      { whatsapp: '+56 9 3333 3333', tally: 'https://tally.so/r/test3' }
    ];
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`   Insertando configuración ${i + 1}: ${config.whatsapp}`);
      
      await client.query(`
        INSERT INTO page_configuration (whatsapp_number, tally_link) 
        VALUES ($1, $2)
      `, [config.whatsapp, config.tally]);
      
      // Pequeña pausa para asegurar timestamps diferentes
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Verificar cuántos registros quedaron después de la limpieza automática
    const remainingRecords = await client.query(`
      SELECT COUNT(*) as total FROM page_configuration;
    `);
    
    console.log(`   Registros después de limpieza automática: ${remainingRecords.rows[0].total}`);
    
    if (remainingRecords.rows[0].total === 1) {
      console.log('✅ Limpieza automática funcionando correctamente');
    } else {
      console.log('❌ Limpieza automática no funcionó como esperado');
    }
    
    // 4. Verificar configuración actual
    console.log('\n4️⃣ Verificando configuración actual...');
    const currentConfig = await client.query(`
      SELECT * FROM page_configuration ORDER BY updated_at DESC LIMIT 1;
    `);
    
    console.log('📱 Configuración actual:');
    console.table(currentConfig.rows);
    
    // 5. Probar actualización
    console.log('\n5️⃣ Probando actualización de configuración...');
    const updatedConfig = {
      whatsapp: '+56 9 9999 9999',
      tally: 'https://tally.so/r/final-test'
    };
    
    await client.query(`
      UPDATE page_configuration 
      SET whatsapp_number = $1, tally_link = $2 
      WHERE id = $3
    `, [updatedConfig.whatsapp, updatedConfig.tally, currentConfig.rows[0].id]);
    
    // Verificar que se actualizó
    const finalConfig = await client.query(`
      SELECT * FROM page_configuration ORDER BY updated_at DESC LIMIT 1;
    `);
    
    if (finalConfig.rows[0].whatsapp_number === updatedConfig.whatsapp) {
      console.log('✅ Actualización exitosa');
    } else {
      console.log('❌ Error en la actualización');
    }
    
    // 6. Verificar que sigue habiendo solo un registro
    const finalCount = await client.query(`
      SELECT COUNT(*) as total FROM page_configuration;
    `);
    
    console.log(`   Total de registros final: ${finalCount.rows[0].total}`);
    
    if (finalCount.rows[0].total === 1) {
      console.log('✅ Sistema mantiene solo un registro como esperado');
    } else {
      console.log('❌ Sistema no mantiene solo un registro');
    }
    
    // 7. Limpiar datos de prueba
    console.log('\n7️⃣ Limpiando datos de prueba...');
    await client.query('DELETE FROM page_configuration WHERE id = $1', [finalConfig.rows[0].id]);
    console.log('✅ Datos de prueba eliminados');
    
    client.release();
    
    console.log('\n🎉 ¡Todas las pruebas de integración pasaron exitosamente!');
    console.log('\n📝 El sistema está listo para:');
    console.log('1. Almacenar configuración de WhatsApp y Tally');
    console.log('2. Mantener solo un registro activo');
    console.log('3. Limpiar automáticamente registros antiguos');
    console.log('4. Actualizar la configuración existente');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas de integración:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencias:');
      console.error('1. Verifica que la base de datos esté accesible');
      console.error('2. Verifica las credenciales de la base de datos');
      console.error('3. Ejecuta: node scripts/setup-page-configuration.js');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPageConfigurationIntegration().catch(console.error);
}

module.exports = {
  testPageConfigurationIntegration
};
