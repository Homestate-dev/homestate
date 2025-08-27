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

async function checkAdditionalFields() {
  try {
    console.log('🔍 VERIFICANDO CAMPOS ADICIONALES EN TRANSACCIONES_DEPARTAMENTOS');
    console.log('================================================================\n');
    
    const client = await pool.connect();
    
    // Verificar estructura de la tabla
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transacciones_departamentos'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura actual de la tabla:');
    columns.rows.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} - Default: ${col.column_default || 'none'}`);
    });
    
    // Verificar si existen los campos adicionales
    const additionalFields = ['referido_por', 'canal_captacion', 'fecha_primer_contacto', 'observaciones'];
    console.log('\n🔍 Verificando campos adicionales:');
    
    for (const field of additionalFields) {
      const exists = columns.rows.some(col => col.column_name === field);
      console.log(`   ${field}: ${exists ? '✅ EXISTE' : '❌ FALTA'}`);
    }
    
    // Si faltan campos, mostrar SQL para agregarlos
    const missingFields = additionalFields.filter(field => 
      !columns.rows.some(col => col.column_name === field)
    );
    
    if (missingFields.length > 0) {
      console.log('\n🚨 CAMPOS FALTANTES DETECTADOS');
      console.log('SQL para agregar campos faltantes:');
      console.log('ALTER TABLE transacciones_departamentos');
      
      missingFields.forEach((field, index) => {
        let fieldType = 'VARCHAR(200)';
        if (field === 'fecha_primer_contacto') fieldType = 'DATE';
        if (field === 'observaciones') fieldType = 'TEXT';
        
        const comma = index < missingFields.length - 1 ? ',' : ';';
        console.log(`ADD COLUMN IF NOT EXISTS ${field} ${fieldType}${comma}`);
      });
      
      // Ejecutar la alteración automáticamente
      console.log('\n🔧 Agregando campos faltantes automáticamente...');
      
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
      console.log('✅ Campos agregados exitosamente!');
      
      // Verificar nuevamente
      const newColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'transacciones_departamentos'
        AND column_name IN (${additionalFields.map(f => `'${f}'`).join(', ')})
        ORDER BY column_name
      `);
      
      console.log('\n✅ Verificación final de campos adicionales:');
      newColumns.rows.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('\n✅ Todos los campos adicionales ya existen en la tabla');
    }
    
    await client.release();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAdditionalFields();