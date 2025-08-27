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

async function migrateTransactionsTable() {
  try {
    console.log('🚀 MIGRACIÓN DE TABLA TRANSACCIONES_DEPARTAMENTOS');
    console.log('=================================================\n');
    
    const client = await pool.connect();
    
    // 1. Verificar estructura actual
    console.log('🔍 1. Verificando estructura actual...');
    const currentColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `);
    
    console.log(`   Columnas actuales: ${currentColumns.rows.length}`);
    
    // 2. Agregar campos adicionales si faltan
    console.log('\n🔧 2. Agregando campos adicionales...');
    const additionalFields = ['referido_por', 'canal_captacion', 'fecha_primer_contacto', 'observaciones'];
    
    const missingFields = additionalFields.filter(field => 
      !currentColumns.rows.some(col => col.column_name === field)
    );
    
    if (missingFields.length > 0) {
      console.log(`   Campos faltantes detectados: ${missingFields.join(', ')}`);
      
      const alterSQL = `
        ALTER TABLE transacciones_departamentos
        ${missingFields.map(field => {
          let fieldType = 'VARCHAR(200)';
          if (field === 'fecha_primer_contacto') fieldType = 'DATE';
          if (field === 'observaciones') fieldType = 'TEXT';
          return `ADD COLUMN IF NOT EXISTS ${field} ${fieldType}`;
        }).join(',\n        ')};
      `;
      
      await client.query(alterSQL);
      console.log('   ✅ Campos agregados exitosamente!');
    } else {
      console.log('   ✅ Todos los campos ya existen');
    }
    
    // 3. Verificar estructura final
    console.log('\n📋 3. Verificando estructura final...');
    const finalColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `);
    
    console.log(`   Total columnas: ${finalColumns.rows.length}`);
    
    // Mostrar campos adicionales
    const additionalFieldsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      AND column_name IN ('referido_por', 'canal_captacion', 'fecha_primer_contacto', 'observaciones')
      ORDER BY column_name
    `);
    
    console.log('\n   Campos adicionales confirmados:');
    additionalFieldsCheck.rows.forEach(col => {
      console.log(`   ✅ ${col.column_name} (${col.data_type})`);
    });
    
    // 4. Contar registros existentes
    console.log('\n📊 4. Verificando datos existentes...');
    const count = await client.query('SELECT COUNT(*) as total FROM transacciones_departamentos');
    console.log(`   Total de transacciones: ${count.rows[0].total}`);
    
    // 5. Mostrar algunas transacciones recientes
    if (parseInt(count.rows[0].total) > 0) {
      console.log('\n   Últimas 3 transacciones:');
      const recent = await client.query(`
        SELECT 
          id,
          tipo_transaccion,
          cliente_nombre,
          referido_por,
          canal_captacion,
          fecha_primer_contacto,
          observaciones,
          fecha_transaccion
        FROM transacciones_departamentos 
        ORDER BY id DESC 
        LIMIT 3
      `);
      
      recent.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id} | Cliente: ${row.cliente_nombre} | Tipo: ${row.tipo_transaccion}`);
        console.log(`      Referido: ${row.referido_por || 'No especificado'}`);
        console.log(`      Canal: ${row.canal_captacion || 'No especificado'}`);
        console.log(`      Fecha Contacto: ${row.fecha_primer_contacto || 'No especificado'}`);
        console.log(`      Observaciones: ${row.observaciones ? 'Sí' : 'No'}`);
      });
    }
    
    await client.release();
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=====================================');
    console.log('✅ Tabla transacciones_departamentos actualizada');
    console.log('✅ Campos adicionales disponibles');
    console.log('✅ API preparada para recibir campos adicionales');
    console.log('\nLos siguientes campos están ahora disponibles:');
    console.log('- referido_por (VARCHAR)');
    console.log('- canal_captacion (VARCHAR)');
    console.log('- fecha_primer_contacto (DATE)');
    console.log('- observaciones (TEXT)');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await pool.end();
  }
}

migrateTransactionsTable();