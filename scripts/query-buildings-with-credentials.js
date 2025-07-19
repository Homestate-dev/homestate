const { Pool } = require('pg');

// Configuración exacta de la base de datos de Heroku
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

async function queryBuildingsWithCredentials() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Consultando edificios en la base de datos de Heroku...\n');
    
    // 1. Verificar si la tabla edificios existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'edificios'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ La tabla "edificios" no existe');
      return;
    }
    
    // 2. Obtener información de las columnas
    console.log('📋 ESTRUCTURA DE LA TABLA EDIFICIOS:');
    console.log('=====================================');
    
    const columns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'edificios'
      ORDER BY ordinal_position;
    `);
    
    columns.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n📊 DATOS DE EDIFICIOS:');
    console.log('=======================');
    
    // 3. Obtener todos los edificios
    const buildings = await client.query('SELECT * FROM edificios ORDER BY id;');
    
    if (buildings.rows.length === 0) {
      console.log('No hay edificios registrados en la base de datos.');
    } else {
      console.log(`Total de edificios: ${buildings.rows.length}\n`);
      
      buildings.rows.forEach((building, index) => {
        console.log(`🏢 EDIFICIO ${index + 1}:`);
        console.log(`   ID: ${building.id}`);
        console.log(`   Nombre: ${building.nombre}`);
        console.log(`   Dirección: ${building.direccion}`);
        console.log(`   Permalink: ${building.permalink}`);
        console.log(`   Costo expensas: ${building.costo_expensas || 'No especificado'}`);
        console.log(`   Creado por: ${building.creado_por || 'No especificado'}`);
        console.log(`   Fecha creación: ${building.fecha_creacion}`);
        console.log(`   Fecha actualización: ${building.fecha_actualizacion}`);
        console.log(`   URL imagen principal: ${building.url_imagen_principal || 'No especificada'}`);
        console.log(`   Imágenes secundarias: ${building.imagenes_secundarias ? building.imagenes_secundarias.length : 0} imágenes`);
        console.log(`   Áreas comunales: ${building.areas_comunales ? building.areas_comunales.length : 0} áreas`);
        console.log(`   Seguridad: ${building.seguridad ? building.seguridad.length : 0} elementos`);
        console.log(`   Aparcamiento: ${building.aparcamiento ? building.aparcamiento.length : 0} elementos`);
        console.log('');
      });
    }
    
    // 4. Estadísticas adicionales
    console.log('📈 ESTADÍSTICAS:');
    console.log('=================');
    
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_edificios,
        COUNT(CASE WHEN costo_expensas > 0 THEN 1 END) as edificios_con_expensas,
        AVG(costo_expensas) as promedio_expensas,
        MIN(costo_expensas) as min_expensas,
        MAX(costo_expensas) as max_expensas
      FROM edificios;
    `);
    
    const stat = stats.rows[0];
    console.log(`Total de edificios: ${stat.total_edificios}`);
    console.log(`Edificios con expensas definidas: ${stat.edificios_con_expensas}`);
    console.log(`Promedio de expensas: ${stat.promedio_expensas ? parseFloat(stat.promedio_expensas).toFixed(2) : 'N/A'}`);
    console.log(`Mínimo de expensas: ${stat.min_expensas || 'N/A'}`);
    console.log(`Máximo de expensas: ${stat.max_expensas || 'N/A'}`);
    
    // 5. Verificar también la tabla departamentos
    console.log('\n🏢 VERIFICANDO TABLA DEPARTAMENTOS:');
    console.log('===================================');
    
    const deptTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'departamentos'
      );
    `);
    
    if (deptTableExists.rows[0].exists) {
      const deptCount = await client.query('SELECT COUNT(*) as total FROM departamentos');
      console.log(`Total de departamentos: ${deptCount.rows[0].total}`);
      
      // Mostrar algunos departamentos de ejemplo
      const sampleDepts = await client.query('SELECT id, numero, nombre, edificio_id, disponible FROM departamentos LIMIT 5');
      if (sampleDepts.rows.length > 0) {
        console.log('\n📋 Ejemplos de departamentos:');
        sampleDepts.rows.forEach(dept => {
          console.log(`   ID: ${dept.id} | Número: ${dept.numero} | Nombre: ${dept.nombre} | Edificio: ${dept.edificio_id} | Disponible: ${dept.disponible}`);
        });
      }
    } else {
      console.log('❌ La tabla "departamentos" no existe');
    }
    
  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar el script
queryBuildingsWithCredentials().catch(console.error); 