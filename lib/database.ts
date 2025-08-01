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

// Alias para compatibilidad con endpoints existentes
export const query = executeQuery

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

// Función auxiliar para verificar columnas de agente inmobiliario
async function checkAgentColumnsExist(): Promise<boolean> {
  try {
    const result = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'administradores' AND column_name = 'es_agente'
    `)
    return result.rows.length > 0
  } catch (error) {
    console.warn('Error checking agent columns:', error)
    return false
  }
}

export async function createAdmin(adminData: {
  firebase_uid: string
  nombre: string
  email: string
  creado_por?: string
  // Campos de agente inmobiliario
  telefono?: string
  cedula?: string
  especialidad?: string
  comision_ventas?: number
  comision_arriendos?: number
  foto_perfil?: string
  biografia?: string
  es_agente?: boolean
}) {
  const hasAgentColumns = await checkAgentColumnsExist()
  
  if (hasAgentColumns) {
    // Usar la versión completa con campos de agente
    const query = `
      INSERT INTO administradores (
        firebase_uid, nombre, email, telefono, cedula, especialidad, 
        comision_ventas, comision_arriendos, foto_perfil, biografia, 
        es_agente, creado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `
    const values = [
      adminData.firebase_uid, 
      adminData.nombre, 
      adminData.email, 
      adminData.telefono || null,
      adminData.cedula || null,
      adminData.especialidad || 'ambas',
      adminData.comision_ventas || 3.00,
      adminData.comision_arriendos || 10.00,
      adminData.foto_perfil || null,
      adminData.biografia || null,
      adminData.es_agente !== false, // Por defecto true, excepto si se especifica false
      adminData.creado_por
    ]
    const result = await executeQuery(query, values)
    return result.rows[0]
  } else {
    // Usar la versión básica sin campos de agente
    const query = `
      INSERT INTO administradores (firebase_uid, nombre, email, creado_por)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const values = [adminData.firebase_uid, adminData.nombre, adminData.email, adminData.creado_por]
    const result = await executeQuery(query, values)
    return result.rows[0]
  }
}

export async function updateAdmin(firebase_uid: string, updates: {
  nombre?: string
  email?: string
  activo?: boolean
  // Campos de agente inmobiliario
  telefono?: string
  cedula?: string
  especialidad?: string
  comision_ventas?: number
  comision_arriendos?: number
  foto_perfil?: string
  biografia?: string
  es_agente?: boolean
}) {
  const hasAgentColumns = await checkAgentColumnsExist()
  
  const setClauses = []
  const values = []
  let paramIndex = 1

  // Campos básicos de administrador
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

  // Solo añadir campos de agente si las columnas existen
  if (hasAgentColumns) {
    if (updates.telefono !== undefined) {
      setClauses.push(`telefono = $${paramIndex}`)
      values.push(updates.telefono || null)
      paramIndex++
    }

    if (updates.cedula !== undefined) {
      setClauses.push(`cedula = $${paramIndex}`)
      values.push(updates.cedula || null)
      paramIndex++
    }

    if (updates.especialidad !== undefined) {
      setClauses.push(`especialidad = $${paramIndex}`)
      values.push(updates.especialidad)
      paramIndex++
    }

    if (updates.comision_ventas !== undefined) {
      setClauses.push(`comision_ventas = $${paramIndex}`)
      values.push(updates.comision_ventas)
      paramIndex++
    }

    if (updates.comision_arriendos !== undefined) {
      setClauses.push(`comision_arriendos = $${paramIndex}`)
      values.push(updates.comision_arriendos)
      paramIndex++
    }

    if (updates.foto_perfil !== undefined) {
      setClauses.push(`foto_perfil = $${paramIndex}`)
      values.push(updates.foto_perfil || null)
      paramIndex++
    }

    if (updates.biografia !== undefined) {
      setClauses.push(`biografia = $${paramIndex}`)
      values.push(updates.biografia || null)
      paramIndex++
    }

    if (updates.es_agente !== undefined) {
      setClauses.push(`es_agente = $${paramIndex}`)
      values.push(updates.es_agente)
      paramIndex++
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No hay campos para actualizar')
  }

  // Solo añadir fecha_actualizacion si la columna existe (probable que sí, pero por seguridad)
  if (hasAgentColumns) {
    setClauses.push(`fecha_actualizacion = CURRENT_TIMESTAMP`)
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
  descripcion: string
  url_imagen_principal: string
  imagenes_secundarias: string[]
  creado_por: string
}) {
  const query = `
    INSERT INTO edificios (
      nombre, direccion, permalink, costo_expensas, areas_comunales, 
      seguridad, aparcamiento, descripcion, url_imagen_principal, imagenes_secundarias, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
    buildingData.descripcion,
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
      e.id,
      e.nombre,
      e.direccion,
      e.permalink,
      e.costo_expensas,
      e.areas_comunales,
      e.seguridad,
      e.aparcamiento,
      e.url_imagen_principal,
      e.imagenes_secundarias,
      e.fecha_creacion,
      e.fecha_actualizacion,
      COALESCE(dept_stats.departamentos_count, 0) as departamentos_count,
      COALESCE(dept_stats.disponibles_count, 0) as disponibles_count
    FROM edificios e
    LEFT JOIN (
      SELECT 
        edificio_id,
        COUNT(*) as departamentos_count,
        COUNT(CASE WHEN disponible = true THEN 1 END) as disponibles_count
      FROM departamentos 
      GROUP BY edificio_id
    ) dept_stats ON e.id = dept_stats.edificio_id
    ORDER BY e.fecha_creacion DESC
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
      e.id,
      e.nombre,
      e.direccion,
      e.permalink,
      e.costo_expensas,
      e.areas_comunales,
      e.seguridad,
      e.aparcamiento,
      e.url_imagen_principal,
      e.imagenes_secundarias,
      e.fecha_creacion,
      e.fecha_actualizacion,
      COALESCE(dept_stats.departamentos_count, 0) as departamentos_count,
      COALESCE(dept_stats.disponibles_count, 0) as disponibles_count
    FROM edificios e
    LEFT JOIN (
      SELECT 
        edificio_id,
        COUNT(*) as departamentos_count,
        COUNT(CASE WHEN disponible = true THEN 1 END) as disponibles_count
      FROM departamentos 
      WHERE edificio_id = $1
      GROUP BY edificio_id
    ) dept_stats ON e.id = dept_stats.edificio_id
    WHERE e.id = $1
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
  area_total: number
  area_cubierta?: number
  area_descubierta?: number
  cantidad_banos?: number
  valor_arriendo?: number
  valor_venta?: number
  alicuota?: number
  incluye_alicuota?: boolean
  cantidad_habitaciones: string
  tipo: string
  estado: string
  ideal_para: string
  ambientes_y_adicionales?: string[]
  tiene_bodega?: boolean
  videos_url?: string[]
  imagenes: string[]
  descripcion: string
  creado_por: string
}) {
  const query = `
    INSERT INTO departamentos (
      edificio_id, numero, nombre, piso, area_total, area_cubierta, area_descubierta, cantidad_banos,
      valor_arriendo, valor_venta, alicuota, incluye_alicuota,
      cantidad_habitaciones, tipo, estado, ideal_para, ambientes_y_adicionales, tiene_bodega, videos_url, imagenes, descripcion, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *
  `
  const values = [
    departmentData.edificio_id,
    departmentData.numero,
    departmentData.nombre,
    departmentData.piso,
    departmentData.area_total,
    departmentData.area_cubierta || null,
    departmentData.area_descubierta || null,
    departmentData.cantidad_banos || 1,
    departmentData.valor_arriendo || 0,
    departmentData.valor_venta || 0,
    departmentData.alicuota || 0,
    departmentData.incluye_alicuota || false,
    departmentData.cantidad_habitaciones,
    departmentData.tipo,
    departmentData.estado,
    departmentData.ideal_para,
    JSON.stringify(departmentData.ambientes_y_adicionales || []),
    departmentData.tiene_bodega || false,
    JSON.stringify(departmentData.videos_url || []),
    JSON.stringify(departmentData.imagenes),
    departmentData.descripcion,
    departmentData.creado_por
  ]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

export async function getDepartmentsByBuilding(edificio_id: number) {
  const query = `
    SELECT 
      id, edificio_id, numero, nombre, piso, area_total, area_cubierta, area_descubierta, cantidad_banos,
      valor_arriendo, valor_venta, alicuota, incluye_alicuota, disponible, cantidad_habitaciones, tipo, estado, ideal_para, 
      ambientes_y_adicionales, tiene_bodega, videos_url, imagenes,
      fecha_creacion, fecha_actualizacion
    FROM departamentos 
    WHERE edificio_id = $1 
    ORDER BY piso ASC, numero ASC
  `
  const result = await executeQuery(query, [edificio_id])
  return result.rows.map(row => ({
    ...row,
    imagenes: safeJsonParse(row.imagenes, []),
    ambientes_y_adicionales: safeJsonParse(row.ambientes_y_adicionales, []),
    videos_url: safeJsonParse(row.videos_url, [])
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
    imagenes: safeJsonParse(department.imagenes, []),
    ambientes_y_adicionales: safeJsonParse(department.ambientes_y_adicionales, []),
    videos_url: safeJsonParse(department.videos_url, [])
  }
}

export async function updateDepartment(id: number, updates: {
  numero?: string
  nombre?: string
  piso?: number
  area_total?: number
  area_cubierta?: number
  area_descubierta?: number
  cantidad_banos?: number
  valor_arriendo?: number
  valor_venta?: number
  alicuota?: number
  incluye_alicuota?: boolean
  disponible?: boolean
  cantidad_habitaciones?: string
  tipo?: string
  estado?: string
  ideal_para?: string
  ambientes_y_adicionales?: string[]
  tiene_bodega?: boolean
  videos_url?: string[]
  imagenes?: string[]
  descripcion?: string
}) {
  const setClauses: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Iterar sobre las actualizaciones y construir la query dinámicamente
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'imagenes' || key === 'ambientes_y_adicionales' || key === 'videos_url') {
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
    imagenes: safeJsonParse(department.imagenes, []),
    ambientes_y_adicionales: safeJsonParse(department.ambientes_y_adicionales, []),
    videos_url: safeJsonParse(department.videos_url, [])
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
    // Validar el permalink
    if (!permalink || typeof permalink !== 'string' || permalink.trim() === '') {
      console.error('Invalid permalink provided:', permalink)
      return null
    }

    // Obtener el edificio
    const buildingQuery = `
      SELECT 
        id, nombre, direccion, permalink, costo_expensas, areas_comunales, 
        seguridad, aparcamiento, url_imagen_principal, imagenes_secundarias, fecha_creacion, descripcion
      FROM edificios 
      WHERE permalink = $1
    `
    const buildingResult = await executeQuery(buildingQuery, [permalink.trim()])
    
    if (buildingResult.rows.length === 0) {
      console.warn('No building found with permalink:', permalink)
      return null
    }
    
    const building = buildingResult.rows[0]
    
    // Validar que el edificio tiene datos esenciales
    if (!building.nombre || !building.id) {
      console.error('Building data is incomplete:', building)
      return null
    }
    
    // Obtener los departamentos del edificio
    const departments = await getDepartmentsByBuilding(building.id)
    
    // Asegurar que departments sea siempre un array
    const validDepartments = Array.isArray(departments) ? departments : []
    
    return {
      building: {
        ...building,
        // Asegurar valores por defecto seguros
        nombre: building.nombre || '',
        direccion: building.direccion || '',
        permalink: building.permalink || '',
        costo_expensas: building.costo_expensas || 0,
        areas_comunales: safeJsonParse(building.areas_comunales, []),
        seguridad: safeJsonParse(building.seguridad, []),
        aparcamiento: safeJsonParse(building.aparcamiento, []),
        url_imagen_principal: building.url_imagen_principal || '',
        imagenes_secundarias: safeJsonParse(building.imagenes_secundarias, []),
        descripcion: building.descripcion || ''
      },
      departments: validDepartments
    }
  } catch (error) {
    console.error('Error fetching building with departments by permalink:', error, { permalink })
    return null
  }
}

// Actualizar contadores de departamentos en edificios
export async function updateBuildingCounters() {
  const query = `
    UPDATE edificios 
    SET 
      departamentos_count = (
        SELECT COALESCE(COUNT(*), 0) FROM departamentos WHERE edificio_id = edificios.id
      ),
      disponibles_count = (
        SELECT COALESCE(COUNT(*), 0) FROM departamentos WHERE edificio_id = edificios.id AND disponible = true
      ),
      fecha_actualizacion = CURRENT_TIMESTAMP
  `
  await executeQuery(query)
}

// Función para refrescar estadísticas de un edificio específico (opcional)
export async function refreshBuildingStats(buildingId: number) {
  const query = `
    UPDATE edificios 
    SET 
      departamentos_count = (
        SELECT COALESCE(COUNT(*), 0) FROM departamentos WHERE edificio_id = $1
      ),
      disponibles_count = (
        SELECT COALESCE(COUNT(*), 0) FROM departamentos WHERE edificio_id = $1 AND disponible = true
      ),
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $1
  `
  await executeQuery(query, [buildingId])
}

// =================== FUNCIONES PARA AGENTES INMOBILIARIOS ===================

// Crear agente inmobiliario (ahora es un administrador con es_agente = true)
export async function createAgent(agentData: {
  firebase_uid: string
  nombre: string
  email: string
  telefono?: string
  cedula?: string
  especialidad: string
  comision_ventas?: number
  comision_arriendos?: number
  foto_perfil?: string
  biografia?: string
  fecha_ingreso?: string
  creado_por: string
}) {
  const query = `
    INSERT INTO administradores (
      firebase_uid, nombre, email, telefono, cedula, especialidad, comision_ventas, 
      comision_arriendos, foto_perfil, biografia, fecha_ingreso, es_agente, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
    RETURNING *
  `
  const values = [
    agentData.firebase_uid,
    agentData.nombre,
    agentData.email,
    agentData.telefono || null,
    agentData.cedula || null,
    agentData.especialidad,
    agentData.comision_ventas || 3.00,
    agentData.comision_arriendos || 10.00,
    agentData.foto_perfil || null,
    agentData.biografia || null,
    agentData.fecha_ingreso || new Date().toISOString().split('T')[0],
    agentData.creado_por
  ]
  const result = await executeQuery(query, values)
  return result.rows[0]
}

// Obtener todos los agentes inmobiliarios (administradores que son agentes)
export async function getAgents() {
  const query = `
    SELECT 
      id, firebase_uid, nombre, email, telefono, cedula, especialidad, 
      comision_ventas, comision_arriendos, activo, foto_perfil, 
      biografia, fecha_ingreso, fecha_creacion, fecha_actualizacion
    FROM administradores 
    WHERE es_agente = true
    ORDER BY fecha_creacion DESC
  `
  const result = await executeQuery(query)
  return result.rows
}

// Obtener agente por ID
export async function getAgentById(id: number) {
  const query = `
    SELECT * FROM administradores WHERE id = $1 AND es_agente = true
  `
  const result = await executeQuery(query, [id])
  return result.rows.length > 0 ? result.rows[0] : null
}

// Actualizar agente inmobiliario (administrador)
export async function updateAgent(id: number, updates: {
  nombre?: string
  email?: string
  telefono?: string
  cedula?: string
  especialidad?: string
  comision_ventas?: number
  comision_arriendos?: number
  activo?: boolean
  foto_perfil?: string
  biografia?: string
  fecha_ingreso?: string
}) {
  const setClauses: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      setClauses.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  if (setClauses.length === 0) {
    throw new Error('No hay campos para actualizar')
  }

  values.push(id)
  const query = `
    UPDATE administradores 
    SET ${setClauses.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex} AND es_agente = true
    RETURNING *
  `

  const result = await executeQuery(query, values)
  return result.rows[0]
}

// Eliminar agente inmobiliario (marcar como inactivo en lugar de eliminar)
export async function deleteAgent(id: number) {
  // En lugar de eliminar, marcamos como inactivo y no agente
  const query = `
    UPDATE administradores 
    SET activo = false, es_agente = false, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $1 AND es_agente = true
    RETURNING *
  `
  const result = await executeQuery(query, [id])
  return result.rows[0]
}

// Crear transacción de departamento
export async function createTransaction(transactionData: {
  departamento_id: number
  agente_id: number
  tipo_transaccion: string
  precio_final: number
  precio_original?: number
  cliente_nombre?: string
  cliente_email?: string
  cliente_telefono?: string
  notas?: string
  creado_por: string
  // Nuevos campos para comisiones
  comision_porcentaje?: number
  comision_valor?: number
  porcentaje_homestate?: number
  porcentaje_bienes_raices?: number
  porcentaje_admin_edificio?: number
  valor_homestate?: number
  valor_bienes_raices?: number
  valor_admin_edificio?: number
}) {
  // Obtener información del agente para calcular comisión
  const agent = await getAgentById(transactionData.agente_id)
  if (!agent) {
    throw new Error('Agente no encontrado')
  }

  let comisionPorcentaje = 0
  let comisionValor = 0

  if (transactionData.tipo_transaccion === 'venta') {
    // Para ventas: usar comisión porcentual
    comisionPorcentaje = transactionData.comision_porcentaje || agent.comision_ventas
    comisionValor = (transactionData.precio_final * comisionPorcentaje) / 100
  } else {
    // Para arriendos: usar comisión en valor
    comisionValor = transactionData.comision_valor || transactionData.precio_final
    comisionPorcentaje = 0 // No se usa para arriendos
  }

  // Calcular distribución de comisiones
  const porcentajeHomestate = transactionData.porcentaje_homestate || 0
  const porcentajeBienesRaices = transactionData.porcentaje_bienes_raices || 0
  const porcentajeAdminEdificio = transactionData.porcentaje_admin_edificio || 0

  const valorHomestate = (comisionValor * porcentajeHomestate) / 100
  const valorBienesRaices = (comisionValor * porcentajeBienesRaices) / 100
  const valorAdminEdificio = (comisionValor * porcentajeAdminEdificio) / 100

  const query = `
    INSERT INTO transacciones_departamentos (
      departamento_id, agente_id, tipo_transaccion, precio_final, precio_original,
      comision_agente, comision_porcentaje, comision_valor,
      porcentaje_homestate, porcentaje_bienes_raices, porcentaje_admin_edificio,
      valor_homestate, valor_bienes_raices, valor_admin_edificio,
      cliente_nombre, cliente_email, cliente_telefono, notas, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *
  `
  const values = [
    transactionData.departamento_id,
    transactionData.agente_id,
    transactionData.tipo_transaccion,
    transactionData.precio_final,
    transactionData.precio_original || null,
    comisionValor, // comision_agente (mantener para compatibilidad)
    comisionPorcentaje,
    comisionValor,
    porcentajeHomestate,
    porcentajeBienesRaices,
    porcentajeAdminEdificio,
    valorHomestate,
    valorBienesRaices,
    valorAdminEdificio,
    transactionData.cliente_nombre || null,
    transactionData.cliente_email || null,
    transactionData.cliente_telefono || null,
    transactionData.notas || null,
    transactionData.creado_por
  ]

  const result = await executeQuery(query, values)
  const transaction = result.rows[0]

  // Actualizar el departamento con la información de la transacción
  const updateDeptQuery = `
    UPDATE departamentos 
    SET 
      ${transactionData.tipo_transaccion === 'venta' ? 'agente_venta_id' : 'agente_arriendo_id'} = $1,
      ${transactionData.tipo_transaccion === 'venta' ? 'fecha_venta' : 'fecha_arriendo'} = CURRENT_TIMESTAMP,
      ${transactionData.tipo_transaccion === 'venta' ? 'precio_venta_final' : 'precio_arriendo_final'} = $2,
      disponible = false,
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $3
  `
  await executeQuery(updateDeptQuery, [transactionData.agente_id, transactionData.precio_final, transactionData.departamento_id])

  return transaction
}

// Obtener transacciones por agente
export async function getTransactionsByAgent(agentId: number) {
  const query = `
    SELECT 
      t.*,
      d.nombre as departamento_nombre,
      d.numero as departamento_numero,
      e.nombre as edificio_nombre
    FROM transacciones_departamentos t
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    WHERE t.agente_id = $1
    ORDER BY t.fecha_transaccion DESC
  `
  const result = await executeQuery(query, [agentId])
  return result.rows
}

// Obtener transacción por ID con todos los detalles
export async function getTransactionById(transactionId: number) {
  const query = `
    SELECT 
      t.*,
      d.nombre as departamento_nombre,
      d.numero as departamento_numero,
      e.nombre as edificio_nombre,
      e.direccion as edificio_direccion,
      a.nombre as agente_nombre,
      a.email as agente_email,
      a.telefono as agente_telefono
    FROM transacciones_departamentos t
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    JOIN administradores a ON t.agente_id = a.id
    WHERE t.id = $1
  `
  const result = await executeQuery(query, [transactionId])
  
  if (result.rows.length === 0) {
    return null
  }
  
  return result.rows[0]
}

// Obtener estadísticas de ventas por agente
export async function getAgentStats(agentId?: number) {
  const whereClause = agentId ? 'WHERE t.agente_id = $1' : ''
  const params = agentId ? [agentId] : []
  
  const query = `
    SELECT 
      a.id,
      a.nombre,
      a.email,
      a.especialidad,
      COUNT(t.id) as total_transacciones,
      COUNT(CASE WHEN t.tipo_transaccion = 'venta' THEN 1 END) as total_ventas,
      COUNT(CASE WHEN t.tipo_transaccion = 'arriendo' THEN 1 END) as total_arriendos,
      COALESCE(SUM(t.precio_final), 0) as volumen_total,
      COALESCE(SUM(t.comision_agente), 0) as comisiones_totales,
      COALESCE(AVG(t.precio_final), 0) as precio_promedio
    FROM administradores a
    LEFT JOIN transacciones_departamentos t ON a.id = t.agente_id ${whereClause}
    WHERE a.activo = true
    GROUP BY a.id, a.nombre, a.email, a.especialidad
    ORDER BY total_transacciones DESC, comisiones_totales DESC
  `
  
  const result = await executeQuery(query, params)
  return result.rows
}

// Obtener reporte de ventas/arriendos por período
export async function getSalesReport(startDate: string, endDate: string, agentId?: number) {
  const agentFilter = agentId ? 'AND t.agente_id = $3' : ''
  const params = agentId ? [startDate, endDate, agentId] : [startDate, endDate]
  
  const query = `
    SELECT 
      t.*,
      a.nombre as agente_nombre,
      d.nombre as departamento_nombre,
      d.numero as departamento_numero,
      e.nombre as edificio_nombre,
      e.direccion as edificio_direccion
    FROM transacciones_departamentos t
    JOIN administradores a ON t.agente_id = a.id
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    WHERE t.fecha_transaccion BETWEEN $1 AND $2
    ${agentFilter}
    ORDER BY t.fecha_transaccion DESC
  `
  
  const result = await executeQuery(query, params)
  return result.rows
} 

// =================== FUNCIONES PARA REPORTES ===================

// Reporte de transacciones por edificio
export async function getBuildingTransactionsReport(buildingId?: number) {
  const whereClause = buildingId ? 'WHERE e.id = $1' : ''
  const params = buildingId ? [buildingId] : []
  
  const query = `
    SELECT 
      e.id as edificio_id,
      e.nombre as edificio_nombre,
      e.direccion as edificio_direccion,
      d.id as departamento_id,
      d.numero as departamento_numero,
      d.nombre as departamento_nombre,
      t.tipo_transaccion,
      t.precio_final,
      t.fecha_transaccion,
      t.cliente_nombre,
      t.cliente_email,
      t.cliente_telefono,
      a.nombre as agente_nombre,
      t.estado_actual,
      t.comision_valor,
      t.porcentaje_homestate,
      t.porcentaje_bienes_raices,
      t.porcentaje_admin_edificio,
      t.valor_homestate,
      t.valor_bienes_raices,
      t.valor_admin_edificio
    FROM transacciones_departamentos t
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    JOIN administradores a ON t.agente_id = a.id
    ${whereClause}
    ORDER BY e.nombre, t.fecha_transaccion DESC
  `
  
  const result = await executeQuery(query, params)
  return result.rows
}

// Reporte de ingresos por edificio
export async function getBuildingIncomeReport(buildingId?: number) {
  const whereClause = buildingId ? 'WHERE e.id = $1' : ''
  const params = buildingId ? [buildingId] : []
  
  const query = `
    SELECT 
      e.id as edificio_id,
      e.nombre as edificio_nombre,
      e.direccion as edificio_direccion,
      COUNT(t.id) as total_transacciones,
      COUNT(CASE WHEN t.tipo_transaccion = 'venta' THEN 1 END) as total_ventas,
      COUNT(CASE WHEN t.tipo_transaccion = 'arriendo' THEN 1 END) as total_arriendos,
      COALESCE(SUM(t.precio_final), 0) as valor_total_transacciones,
      COALESCE(SUM(CASE WHEN t.tipo_transaccion = 'venta' THEN t.precio_final ELSE 0 END), 0) as valor_total_ventas,
      COALESCE(SUM(CASE WHEN t.tipo_transaccion = 'arriendo' THEN t.precio_final ELSE 0 END), 0) as valor_total_arriendos,
      COALESCE(SUM(t.comision_valor), 0) as total_comisiones,
      COALESCE(SUM(t.valor_homestate), 0) as total_homestate,
      COALESCE(SUM(t.valor_bienes_raices), 0) as total_bienes_raices,
      COALESCE(SUM(t.valor_admin_edificio), 0) as total_admin_edificio,
      CAST(COALESCE(AVG(t.porcentaje_homestate), 0) AS NUMERIC(10,2)) as promedio_porcentaje_homestate,
      CAST(COALESCE(AVG(t.porcentaje_bienes_raices), 0) AS NUMERIC(10,2)) as promedio_porcentaje_bienes_raices,
      CAST(COALESCE(AVG(t.porcentaje_admin_edificio), 0) AS NUMERIC(10,2)) as promedio_porcentaje_admin_edificio
    FROM edificios e
    LEFT JOIN departamentos d ON e.id = d.edificio_id
    LEFT JOIN transacciones_departamentos t ON d.id = t.departamento_id
    ${whereClause}
    GROUP BY e.id, e.nombre, e.direccion
    ORDER BY total_comisiones DESC, e.nombre
  `
  
  const result = await executeQuery(query, params)
  return result.rows
}

// Reporte de comisiones distribuidas
export async function getCommissionDistributionReport(startDate?: string, endDate?: string, agentId?: number) {
  let whereConditions = ['1=1']
  let params: any[] = []
  let paramCount = 0
  
  if (startDate) {
    paramCount++
    whereConditions.push(`t.fecha_transaccion >= $${paramCount}`)
    params.push(startDate)
  }
  
  if (endDate) {
    paramCount++
    whereConditions.push(`t.fecha_transaccion <= $${paramCount}`)
    params.push(endDate)
  }
  
  if (agentId) {
    paramCount++
    whereConditions.push(`t.agente_id = $${paramCount}`)
    params.push(agentId)
  }
  
  const query = `
    SELECT 
      t.id as transaccion_id,
      t.tipo_transaccion,
      t.precio_final,
      t.comision_valor,
      t.porcentaje_homestate,
      t.porcentaje_bienes_raices,
      t.porcentaje_admin_edificio,
      t.valor_homestate,
      t.valor_bienes_raices,
      t.valor_admin_edificio,
      t.fecha_transaccion,
      t.cliente_nombre,
      a.nombre as agente_nombre,
      e.nombre as edificio_nombre,
      d.numero as departamento_numero,
      -- Totales por transacción
      (t.valor_homestate + t.valor_bienes_raices + t.valor_admin_edificio) as total_distribuido,
      -- Verificar si la distribución suma 100%
      (t.porcentaje_homestate + t.porcentaje_bienes_raices + t.porcentaje_admin_edificio) as total_porcentajes
    FROM transacciones_departamentos t
    JOIN administradores a ON t.agente_id = a.id
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY t.fecha_transaccion DESC
  `
  
  const result = await executeQuery(query, params)
  return result.rows
}

// Resumen de comisiones distribuidas (totales)
export async function getCommissionDistributionSummary(startDate?: string, endDate?: string, agentId?: number) {
  let whereConditions = ['1=1']
  let params: any[] = []
  let paramCount = 0
  
  if (startDate) {
    paramCount++
    whereConditions.push(`t.fecha_transaccion >= $${paramCount}`)
    params.push(startDate)
  }
  
  if (endDate) {
    paramCount++
    whereConditions.push(`t.fecha_transaccion <= $${paramCount}`)
    params.push(endDate)
  }
  
  if (agentId) {
    paramCount++
    whereConditions.push(`t.agente_id = $${paramCount}`)
    params.push(agentId)
  }
  
  const query = `
    SELECT 
      COUNT(t.id) as total_transacciones,
      COUNT(CASE WHEN t.tipo_transaccion = 'venta' THEN 1 END) as total_ventas,
      COUNT(CASE WHEN t.tipo_transaccion = 'arriendo' THEN 1 END) as total_arriendos,
      COALESCE(SUM(t.comision_valor), 0) as total_comisiones,
      COALESCE(SUM(t.valor_homestate), 0) as total_homestate,
      COALESCE(SUM(t.valor_bienes_raices), 0) as total_bienes_raices,
      COALESCE(SUM(t.valor_admin_edificio), 0) as total_admin_edificio,
      CAST(COALESCE(AVG(t.porcentaje_homestate), 0) AS NUMERIC(10,2)) as promedio_porcentaje_homestate,
      CAST(COALESCE(AVG(t.porcentaje_bienes_raices), 0) AS NUMERIC(10,2)) as promedio_porcentaje_bienes_raices,
      CAST(COALESCE(AVG(t.porcentaje_admin_edificio), 0) AS NUMERIC(10,2)) as promedio_porcentaje_admin_edificio,
      -- Porcentajes de distribución
      CAST(CASE 
        WHEN SUM(t.comision_valor) > 0 
        THEN (SUM(t.valor_homestate) / SUM(t.comision_valor)) * 100 
        ELSE 0 
      END AS NUMERIC(10,2)) as porcentaje_total_homestate,
      CAST(CASE 
        WHEN SUM(t.comision_valor) > 0 
        THEN (SUM(t.valor_bienes_raices) / SUM(t.comision_valor)) * 100 
        ELSE 0 
      END AS NUMERIC(10,2)) as porcentaje_total_bienes_raices,
      CAST(CASE 
        WHEN SUM(t.comision_valor) > 0 
        THEN (SUM(t.valor_admin_edificio) / SUM(t.comision_valor)) * 100 
        ELSE 0 
      END AS NUMERIC(10,2)) as porcentaje_total_admin_edificio
    FROM transacciones_departamentos t
    WHERE ${whereConditions.join(' AND ')}
  `
  
  const result = await executeQuery(query, params)
  return result.rows[0]
} 