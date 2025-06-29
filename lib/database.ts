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

// Funciones para edificios
export async function createBuilding(buildingData: {
  nombre: string
  direccion: string
  permalink: string
  costo_expensas?: number
  areas_comunales: string[]
  seguridad: string[]
  aparcamiento: string[]
  url_imagen_principal: string
  imagenes_secundarias: string[]
  creado_por: string
}) {
  const query = `
    INSERT INTO edificios (
      nombre, direccion, permalink, costo_expensas, areas_comunales, 
      seguridad, aparcamiento, url_imagen_principal, imagenes_secundarias, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `
  const values = [
    buildingData.nombre,
    buildingData.direccion,
    buildingData.permalink,
    buildingData.costo_expensas || 0,
    JSON.stringify(buildingData.areas_comunales),
    JSON.stringify(buildingData.seguridad),
    JSON.stringify(buildingData.aparcamiento),
    buildingData.url_imagen_principal,
    JSON.stringify(buildingData.imagenes_secundarias),
    buildingData.creado_por
  ]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function getBuildings() {
  const query = `
    SELECT 
      id,
      nombre,
      direccion,
      permalink,
      costo_expensas,
      areas_comunales,
      seguridad,
      aparcamiento,
      url_imagen_principal,
      imagenes_secundarias,
      fecha_creacion,
      fecha_actualizacion,
      0 as departamentos_count,
      0 as disponibles_count
    FROM edificios 
    ORDER BY fecha_creacion DESC
  `
  const result = await executeQuery(query)
  return result.rows.map(row => {
    try {
      return {
        ...row,
        areas_comunales: safeJsonParse(row.areas_comunales, []),
        seguridad: safeJsonParse(row.seguridad, []),
        aparcamiento: safeJsonParse(row.aparcamiento, []),
        imagenes_secundarias: safeJsonParse(row.imagenes_secundarias, [])
      }
    } catch (error) {
      console.error('Error parsing building data:', error, 'Row:', row)
      return {
        ...row,
        areas_comunales: [],
        seguridad: [],
        aparcamiento: [],
        imagenes_secundarias: []
      }
    }
  })
}

function safeJsonParse(jsonString: string | any[] | null, defaultValue: any = null) {
  if (!jsonString) return defaultValue
  
  // Si ya es un array o objeto, devolverlo directamente
  if (Array.isArray(jsonString) || typeof jsonString === 'object') {
    return jsonString
  }
  
  // Solo intentar parsear si es un string
  if (typeof jsonString !== 'string') {
    return defaultValue
  }
  
  try {
    // Primero intentar parsear directamente
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Error parsing JSON, trying to fix encoding:', jsonString.substring(0, 50))
    try {
      // Si falla, intentar arreglar caracteres especiales
      const fixedString = jsonString
        .replace(/Á/g, 'Á')
        .replace(/É/g, 'É')
        .replace(/Í/g, 'Í')
        .replace(/Ó/g, 'Ó')
        .replace(/Ú/g, 'Ú')
        .replace(/á/g, 'á')
        .replace(/é/g, 'é')
        .replace(/í/g, 'í')
        .replace(/ó/g, 'ó')
        .replace(/ú/g, 'ú')
        .replace(/ñ/g, 'ñ')
        .replace(/Ñ/g, 'Ñ')
      
      return JSON.parse(fixedString)
    } catch (secondError) {
      console.error('Failed to parse JSON even after fixing:', secondError)
      return defaultValue
    }
  }
}

function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('Error stringifying JSON:', error)
    return '[]'
  }
}

export async function getBuildingById(id: number) {
  const query = `
    SELECT 
      id,
      nombre,
      direccion,
      permalink,
      costo_expensas,
      areas_comunales,
      seguridad,
      aparcamiento,
      url_imagen_principal,
      imagenes_secundarias,
      fecha_creacion,
      fecha_actualizacion,
      0 as departamentos_count,
      0 as disponibles_count
    FROM edificios 
    WHERE id = $1
  `
  const result = await executeQuery(query, [id])
  
  if (result.rows.length === 0) return null
  
  const building = result.rows[0]
  try {
    return {
      ...building,
      areas_comunales: safeJsonParse(building.areas_comunales, []),
      seguridad: safeJsonParse(building.seguridad, []),
      aparcamiento: safeJsonParse(building.aparcamiento, []),
      imagenes_secundarias: safeJsonParse(building.imagenes_secundarias, [])
    }
  } catch (error) {
    console.error('Error parsing building by ID:', error)
    return {
      ...building,
      areas_comunales: [],
      seguridad: [],
      aparcamiento: [],
      imagenes_secundarias: []
    }
  }
}

export async function updateBuilding(id: number, updates: {
  nombre?: string
  direccion?: string
  costo_expensas?: number
  areas_comunales?: string[]
  seguridad?: string[]
  aparcamiento?: string[]
  url_imagen_principal?: string
  imagenes_secundarias?: string[]
}) {
  const setClauses = []
  const values = []
  let paramIndex = 1

  if (updates.nombre !== undefined) {
    setClauses.push(`nombre = $${paramIndex}`)
    values.push(updates.nombre)
    paramIndex++
  }

  if (updates.direccion !== undefined) {
    setClauses.push(`direccion = $${paramIndex}`)
    values.push(updates.direccion)
    paramIndex++
  }

  if (updates.costo_expensas !== undefined) {
    setClauses.push(`costo_expensas = $${paramIndex}`)
    values.push(updates.costo_expensas)
    paramIndex++
  }

  if (updates.areas_comunales !== undefined) {
    setClauses.push(`areas_comunales = $${paramIndex}`)
    values.push(JSON.stringify(updates.areas_comunales))
    paramIndex++
  }

  if (updates.seguridad !== undefined) {
    setClauses.push(`seguridad = $${paramIndex}`)
    values.push(JSON.stringify(updates.seguridad))
    paramIndex++
  }

  if (updates.aparcamiento !== undefined) {
    setClauses.push(`aparcamiento = $${paramIndex}`)
    values.push(JSON.stringify(updates.aparcamiento))
    paramIndex++
  }

  if (updates.url_imagen_principal !== undefined) {
    setClauses.push(`url_imagen_principal = $${paramIndex}`)
    values.push(updates.url_imagen_principal)
    paramIndex++
  }

  if (updates.imagenes_secundarias !== undefined) {
    setClauses.push(`imagenes_secundarias = $${paramIndex}`)
    values.push(JSON.stringify(updates.imagenes_secundarias))
    paramIndex++
  }

  if (setClauses.length === 0) {
    throw new Error('No hay campos para actualizar')
  }

  values.push(id)
  const query = `
    UPDATE edificios 
    SET ${setClauses.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `

  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function deleteBuilding(id: number) {
  // Primero eliminar departamentos asociados si los hay
  await executeQuery('DELETE FROM departamentos WHERE edificio_id = $1', [id])
  
  // Luego eliminar el edificio
  const query = 'DELETE FROM edificios WHERE id = $1 RETURNING *'
  const result = await executeQuery(query, [id])
  return result.rows[0]
}

// Funciones para departamentos
export async function createDepartment(departmentData: {
  edificio_id: number
  numero: string
  nombre: string
  piso: number
  area: number
  valor_arriendo?: number
  valor_venta?: number
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
  amueblado?: boolean
  tiene_living_comedor?: boolean
  tiene_cocina_separada?: boolean
  tiene_antebano?: boolean
  tiene_bano_completo?: boolean
  tiene_aire_acondicionado?: boolean
  tiene_placares?: boolean
  tiene_cocina_con_horno_y_anafe?: boolean
  tiene_muebles_bajo_mesada?: boolean
  tiene_desayunador_madera?: boolean
  imagenes: string[]
  creado_por: string
}) {
  const query = `
    INSERT INTO departamentos (
      edificio_id, numero, nombre, piso, area, valor_arriendo, valor_venta,
      cantidad_habitaciones, tipo, estado, ideal_para, amueblado,
      tiene_living_comedor, tiene_cocina_separada, tiene_antebano, tiene_bano_completo,
      tiene_aire_acondicionado, tiene_placares, tiene_cocina_con_horno_y_anafe,
      tiene_muebles_bajo_mesada, tiene_desayunador_madera, imagenes, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
    RETURNING *
  `
  const values = [
    departmentData.edificio_id,
    departmentData.numero,
    departmentData.nombre,
    departmentData.piso,
    departmentData.area,
    departmentData.valor_arriendo || 0,
    departmentData.valor_venta || 0,
    departmentData.cantidad_habitaciones,
    departmentData.tipo,
    departmentData.estado,
    departmentData.ideal_para,
    departmentData.amueblado || false,
    departmentData.tiene_living_comedor || false,
    departmentData.tiene_cocina_separada || false,
    departmentData.tiene_antebano || false,
    departmentData.tiene_bano_completo || false,
    departmentData.tiene_aire_acondicionado || false,
    departmentData.tiene_placares || false,
    departmentData.tiene_cocina_con_horno_y_anafe || false,
    departmentData.tiene_muebles_bajo_mesada || false,
    departmentData.tiene_desayunador_madera || false,
    JSON.stringify(departmentData.imagenes),
    departmentData.creado_por
  ]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function getDepartmentsByBuilding(edificio_id: number) {
  const query = `
    SELECT 
      id, edificio_id, numero, nombre, piso, area, valor_arriendo, valor_venta,
      disponible, cantidad_habitaciones, tipo, estado, ideal_para, amueblado,
      tiene_living_comedor, tiene_cocina_separada, tiene_antebano, tiene_bano_completo,
      tiene_aire_acondicionado, tiene_placares, tiene_cocina_con_horno_y_anafe,
      tiene_muebles_bajo_mesada, tiene_desayunador_madera, imagenes,
      fecha_creacion, fecha_actualizacion
    FROM departamentos 
    WHERE edificio_id = $1 
    ORDER BY piso ASC, numero ASC
  `
  const result = await executeQuery(query, [edificio_id])
  return result.rows.map(row => ({
    ...row,
    imagenes: safeJsonParse(row.imagenes, [])
  }))
}

export async function getDepartmentById(id: number) {
  const query = `
    SELECT 
      d.*,
      e.nombre as edificio_nombre,
      e.direccion as edificio_direccion,
      e.permalink as edificio_permalink
    FROM departamentos d
    JOIN edificios e ON d.edificio_id = e.id
    WHERE d.id = $1
  `
  const result = await executeQuery(query, [id])
  
  if (result.rows.length === 0) return null
  
  const department = result.rows[0]
  return {
    ...department,
    imagenes: safeJsonParse(department.imagenes, [])
  }
}

export async function updateDepartment(id: number, updates: {
  numero?: string
  nombre?: string
  piso?: number
  area?: number
  valor_arriendo?: number
  valor_venta?: number
  disponible?: boolean
  cantidad_habitaciones?: string
  tipo?: string
  estado?: string
  ideal_para?: string
  amueblado?: boolean
  tiene_living_comedor?: boolean
  tiene_cocina_separada?: boolean
  tiene_antebano?: boolean
  tiene_bano_completo?: boolean
  tiene_aire_acondicionado?: boolean
  tiene_placares?: boolean
  tiene_cocina_con_horno_y_anafe?: boolean
  tiene_muebles_bajo_mesada?: boolean
  tiene_desayunador_madera?: boolean
  imagenes?: string[]
}) {
  const setClauses = []
  const values = []
  let paramIndex = 1

  // Iterar sobre las actualizaciones y construir la query dinámicamente
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'imagenes') {
        setClauses.push(`${key} = $${paramIndex}`)
        values.push(JSON.stringify(value))
      } else {
        setClauses.push(`${key} = $${paramIndex}`)
        values.push(value)
      }
      paramIndex++
    }
  })

  if (setClauses.length === 0) {
    throw new Error('No hay campos para actualizar')
  }

  values.push(id)
  const query = `
    UPDATE departamentos 
    SET ${setClauses.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `

  const result = await executeQuery(query, values)
  const department = result.rows[0]
  return {
    ...department,
    imagenes: safeJsonParse(department.imagenes, [])
  }
}

export async function deleteDepartment(id: number) {
  const query = 'DELETE FROM departamentos WHERE id = $1 RETURNING *'
  const result = await executeQuery(query, [id])
  return result.rows[0]
}

export async function toggleDepartmentAvailability(id: number) {
  const query = `
    UPDATE departamentos 
    SET disponible = NOT disponible, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `
  const result = await executeQuery(query, [id])
  const department = result.rows[0]
  return {
    ...department,
    imagenes: safeJsonParse(department.imagenes, [])
  }
}

// Obtener edificio con sus departamentos por permalink (para micrositio)
export async function getBuildingWithDepartmentsByPermalink(permalink: string) {
  try {
    // Obtener el edificio
    const buildingQuery = `
      SELECT 
        id, nombre, direccion, permalink, costo_expensas, areas_comunales, 
        seguridad, aparcamiento, url_imagen_principal, imagenes_secundarias, fecha_creacion
      FROM edificios 
      WHERE permalink = $1
    `
    const buildingResult = await executeQuery(buildingQuery, [permalink])
    
    if (buildingResult.rows.length === 0) return null
    
    const building = buildingResult.rows[0]
    
    // Obtener los departamentos del edificio
    const departments = await getDepartmentsByBuilding(building.id)
    
    return {
      building: {
        ...building,
        areas_comunales: safeJsonParse(building.areas_comunales, []),
        seguridad: safeJsonParse(building.seguridad, []),
        aparcamiento: safeJsonParse(building.aparcamiento, []),
        imagenes_secundarias: safeJsonParse(building.imagenes_secundarias, [])
      },
      departments: departments
    }
  } catch (error) {
    console.error('Error fetching building with departments by permalink:', error)
    return null
  }
}

// Actualizar contadores de departamentos en edificios
export async function updateBuildingCounters() {
  const query = `
    UPDATE edificios 
    SET 
      departamentos_count = (
        SELECT COUNT(*) FROM departamentos WHERE edificio_id = edificios.id
      ),
      disponibles_count = (
        SELECT COUNT(*) FROM departamentos WHERE edificio_id = edificios.id AND disponible = true
      )
  `
  await executeQuery(query)
} 