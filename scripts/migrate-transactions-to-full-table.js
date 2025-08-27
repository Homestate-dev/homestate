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

async function migrateTransactions() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar estado actual
    console.log('\n🔍 1. Verificando estado actual...');
    
    const oldTableCount = await client.query('SELECT COUNT(*) as total FROM transacciones_departamentos');
    const newTableCount = await client.query('SELECT COUNT(*) as total FROM transacciones_ventas_arriendos');
    
    console.log(`📊 transacciones_departamentos: ${oldTableCount.rows[0].total} registros`);
    console.log(`📊 transacciones_ventas_arriendos: ${newTableCount.rows[0].total} registros`);

    if (oldTableCount.rows[0].total === 0) {
      console.log('⚠️ No hay transacciones para migrar');
      return;
    }

    // 2. Migrar transacciones
    console.log('\n🚀 2. Iniciando migración...');
    
    // Obtener todas las transacciones de la tabla antigua
    const oldTransactions = await client.query(`
      SELECT 
        departamento_id,
        agente_id,
        tipo_transaccion,
        precio_final as valor_transaccion,
        precio_original,
        comision_agente as comision_valor,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        cliente_cedula,
        cliente_tipo_documento,
        notas,
        fecha_transaccion,
        fecha_registro,
        creado_por,
        comision_porcentaje,
        porcentaje_homestate,
        porcentaje_bienes_raices,
        porcentaje_admin_edificio,
        valor_homestate,
        valor_bienes_raices,
        valor_admin_edificio,
        estado_actual,
        datos_estado,
        fecha_ultimo_estado
      FROM transacciones_departamentos
      ORDER BY id
    `);

    console.log(`📋 Migrando ${oldTransactions.rows.length} transacciones...`);

    // Insertar cada transacción en la nueva tabla
    for (let i = 0; i < oldTransactions.rows.length; i++) {
      const transaction = oldTransactions.rows[i];
      
      try {
        const insertQuery = `
          INSERT INTO transacciones_ventas_arriendos (
            departamento_id, agente_id, tipo_transaccion, valor_transaccion, 
            comision_porcentaje, comision_valor, fecha_transaccion, fecha_registro,
            cliente_nombre, cliente_email, cliente_telefono, cliente_cedula, cliente_tipo_documento,
            notas, estado_actual, datos_estado, fecha_ultimo_estado,
            porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
            valor_homestate, valor_bienes_raices, valor_admin_edificio
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
          )
        `;
        
        await client.query(insertQuery, [
          transaction.departamento_id,
          transaction.agente_id,
          transaction.tipo_transaccion,
          transaction.valor_transaccion,
          transaction.comision_porcentaje || 3.0,
          transaction.comision_valor,
          transaction.fecha_transaccion,
          transaction.fecha_registro,
          transaction.cliente_nombre,
          transaction.cliente_email,
          transaction.cliente_telefono,
          transaction.cliente_cedula,
          transaction.cliente_tipo_documento,
          transaction.notas,
          transaction.estado_actual || 'reservado',
          transaction.datos_estado,
          transaction.fecha_ultimo_estado,
          transaction.porcentaje_homestate,
          transaction.porcentaje_bienes_raices,
          transaction.porcentaje_admin_edificio,
          transaction.valor_homestate,
          transaction.valor_bienes_raices,
          transaction.valor_admin_edificio
        ]);
        
        console.log(`  ✅ Migrada transacción ${i + 1}/${oldTransactions.rows.length} - Cliente: ${transaction.cliente_nombre}`);
        
      } catch (error) {
        console.error(`  ❌ Error en transacción ${i + 1} - Cliente: ${transaction.cliente_nombre}:`, error.message);
      }
    }

    // 3. Verificar migración
    console.log('\n🔍 3. Verificando migración...');
    
    const finalCount = await client.query('SELECT COUNT(*) as total FROM transacciones_ventas_arriendos');
    console.log(`📊 transacciones_ventas_arriendos después de migración: ${finalCount.rows[0].total} registros`);

    // Mostrar algunas transacciones migradas
    const sampleQuery = `
      SELECT id, cliente_nombre, notas, referido_por, canal_captacion, observaciones
      FROM transacciones_ventas_arriendos 
      ORDER BY fecha_registro DESC 
      LIMIT 3
    `;
    
    const sampleResult = await client.query(sampleQuery);
    console.log('\n📄 Muestra de transacciones migradas:');
    sampleResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id} - Cliente: ${row.cliente_nombre}`);
      console.log(`     Notas: ${row.notas || 'NULL'}`);
      console.log(`     Referido por: ${row.referido_por || 'NULL'}`);
      console.log(`     Canal captación: ${row.canal_captacion || 'NULL'}`);
      console.log(`     Observaciones: ${row.observaciones || 'NULL'}`);
    });

    console.log('\n🎉 ¡Migración completada!');
    console.log('💡 Ahora las nuevas transacciones se guardarán en transacciones_ventas_arriendos con todos los campos adicionales');

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
  }
}

migrateTransactions().catch(console.error);

