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

// Crear un nuevo agente inmobiliario
export async function createAgent(agentData: {
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
    INSERT INTO agentes_inmobiliarios (
      nombre, email, telefono, cedula, especialidad, comision_ventas, 
      comision_arriendos, foto_perfil, biografia, fecha_ingreso, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `
  const values = [
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

// Obtener todos los agentes inmobiliarios
export async function getAgents() {
  const query = `
    SELECT 
      id, nombre, email, telefono, cedula, especialidad, 
      comision_ventas, comision_arriendos, activo, foto_perfil, 
      biografia, fecha_ingreso, fecha_creacion, fecha_actualizacion
    FROM agentes_inmobiliarios 
    ORDER BY fecha_creacion DESC
  `
  const result = await executeQuery(query)
  return result.rows
}

// Obtener agente por ID
export async function getAgentById(id: number) {
  const query = `
    SELECT * FROM agentes_inmobiliarios WHERE id = $1
  `
  const result = await executeQuery(query, [id])
  return result.rows.length > 0 ? result.rows[0] : null
}

// Actualizar agente inmobiliario
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
    UPDATE agentes_inmobiliarios 
    SET ${setClauses.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `

  const result = await executeQuery(query, values)
  return result.rows[0]
}

// Eliminar agente inmobiliario
export async function deleteAgent(id: number) {
  const query = 'DELETE FROM agentes_inmobiliarios WHERE id = $1 RETURNING *'
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
}) {
  // Obtener información del agente para calcular comisión
  const agent = await getAgentById(transactionData.agente_id)
  if (!agent) {
    throw new Error('Agente no encontrado')
  }

  const comisionPorcentaje = transactionData.tipo_transaccion === 'venta' 
    ? agent.comision_ventas 
    : agent.comision_arriendos
  
  const comision_agente = (transactionData.precio_final * comisionPorcentaje) / 100

  const query = `
    INSERT INTO transacciones_departamentos (
      departamento_id, agente_id, tipo_transaccion, precio_final, precio_original,
      comision_agente, cliente_nombre, cliente_email, cliente_telefono, notas, creado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `
  const values = [
    transactionData.departamento_id,
    transactionData.agente_id,
    transactionData.tipo_transaccion,
    transactionData.precio_final,
    transactionData.precio_original || null,
    comision_agente,
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
    FROM agentes_inmobiliarios a
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
    JOIN agentes_inmobiliarios a ON t.agente_id = a.id
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN edificios e ON d.edificio_id = e.id
    WHERE t.fecha_transaccion BETWEEN $1 AND $2
    ${agentFilter}
    ORDER BY t.fecha_transaccion DESC
  `
  
  const result = await executeQuery(query, params)
  return result.rows
} 