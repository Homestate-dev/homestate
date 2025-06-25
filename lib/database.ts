import { Client, Pool } from 'pg'

const dbConfig = {
  host: 'c2hbg00ac72j9d.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dauaho3sghau5i',
  user: 'ufcmrjr46j97t8',
  port: 5432,
  password: 'p70abb1114a5ec3d4d98dc2afc768f855cf22ad2fc64f2f3aa005f6e773e0defd',
  ssl: {
    rejectUnauthorized: false
  }
}

// Pool de conexiones para mejor rendimiento
const pool = new Pool(dbConfig)

export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result
  } finally {
    client.release()
  }
}

export async function getAdmins() {
  const query = `
    SELECT 
      id,
      firebase_uid,
      nombre,
      email,
      activo,
      fecha_creacion,
      fecha_actualizacion,
      (SELECT COUNT(*) FROM admin_acciones WHERE admin_firebase_uid = administradores.firebase_uid) as acciones_totales,
      (SELECT MAX(fecha) FROM admin_acciones WHERE admin_firebase_uid = administradores.firebase_uid) as ultima_accion
    FROM administradores 
    ORDER BY fecha_creacion DESC
  `
  const result = await executeQuery(query)
  return result.rows
}

export async function createAdmin(adminData: {
  firebase_uid: string
  nombre: string
  email: string
  creado_por?: string
}) {
  const query = `
    INSERT INTO administradores (firebase_uid, nombre, email, creado_por)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const values = [adminData.firebase_uid, adminData.nombre, adminData.email, adminData.creado_por]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function updateAdmin(firebase_uid: string, updates: {
  nombre?: string
  email?: string
  activo?: boolean
}) {
  const setClauses = []
  const values = []
  let paramIndex = 1

  if (updates.nombre !== undefined) {
    setClauses.push(`nombre = $${paramIndex}`)
    values.push(updates.nombre)
    paramIndex++
  }

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex}`)
    values.push(updates.email)
    paramIndex++
  }

  if (updates.activo !== undefined) {
    setClauses.push(`activo = $${paramIndex}`)
    values.push(updates.activo)
    paramIndex++
  }

  if (setClauses.length === 0) {
    throw new Error('No hay campos para actualizar')
  }

  values.push(firebase_uid)
  const query = `
    UPDATE administradores 
    SET ${setClauses.join(', ')}
    WHERE firebase_uid = $${paramIndex}
    RETURNING *
  `

  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function deleteAdmin(firebase_uid: string) {
  // Primero eliminar todas las acciones del admin
  await executeQuery('DELETE FROM admin_acciones WHERE admin_firebase_uid = $1', [firebase_uid])
  
  // Luego eliminar el admin
  const query = 'DELETE FROM administradores WHERE firebase_uid = $1 RETURNING *'
  const result = await executeQuery(query, [firebase_uid])
  return result.rows[0]
}

export async function logAdminAction(adminFirebaseUid: string, accion: string, tipo: string, metadata?: any) {
  const query = `
    INSERT INTO admin_acciones (admin_firebase_uid, accion, tipo, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const values = [adminFirebaseUid, accion, tipo, metadata ? JSON.stringify(metadata) : null]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function getAdminActions(firebase_uid: string, limit: number = 50) {
  const query = `
    SELECT * FROM admin_acciones 
    WHERE admin_firebase_uid = $1 
    ORDER BY fecha DESC 
    LIMIT $2
  `
  const result = await executeQuery(query, [firebase_uid, limit])
  return result.rows
} 