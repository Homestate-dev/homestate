const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function ejecutarScript() {
  const sqlPath = path.join(__dirname, 'add-descripcion-columns.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('Columnas "descripcion" agregadas correctamente a ambas tablas.');
  } catch (error) {
    console.error('Error al agregar la columna:', error);
  } finally {
    await pool.end();
  }
}

ejecutarScript(); 