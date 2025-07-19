const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración correcta de la base de datos Heroku
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

async function executeAddFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando agregado de nuevos campos a departamentos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'add-new-department-fields.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Ejecutando comandos SQL...');
    
    // Ejecutar cada comando SQL por separado
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log(`   Ejecutando: ${command.trim().substring(0, 50)}...`);
        await client.query(command);
      }
    }
    
    console.log('✅ Comandos SQL ejecutados exitosamente');
    
    // Verificar el resultado
    console.log('\n📊 Verificando estructura de la tabla...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'departamentos' 
      AND column_name IN ('cantidad_banos', 'area_cubierta', 'area_descubierta', 'area_total', 'tiene_bodega', 'videos_url')
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Nuevos campos agregados a la tabla departamentos:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} | ${row.data_type} | Default: ${row.column_default}`);
    });
    
    console.log('\n🎉 ¡Agregado de campos completado exitosamente!');
    console.log('   Se agregaron: cantidad_banos, area_cubierta, area_descubierta, tiene_bodega, videos_url');
    console.log('   Se renombró: area -> area_total');
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 SCRIPT DE AGREGADO DE CAMPOS');
    console.log('=' .repeat(60));
    console.log('📅 Fecha y hora:', new Date().toLocaleString('es-ES'));
    console.log('=' .repeat(60));
    
    await executeAddFields();
    
    console.log('\n🎯 SCRIPT COMPLETADO EXITOSAMENTE');
    console.log('   Los nuevos campos han sido agregados a la tabla departamentos.');
    
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

module.exports = { executeAddFields }; 