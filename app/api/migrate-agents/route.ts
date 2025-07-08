import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea el administrador principal
    const body = await request.json()
    const { currentUserEmail } = body

    if (currentUserEmail !== 'homestate.dev@gmail.com') {
      return NextResponse.json(
        { success: false, error: 'Solo el administrador principal puede ejecutar migraciones' },
        { status: 403 }
      )
    }

    console.log('Iniciando migración de unificación administradores-agentes...')

    // Paso 1: Agregar columnas de agente a administradores
    await executeQuery(`
      ALTER TABLE administradores 
      ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
      ADD COLUMN IF NOT EXISTS cedula VARCHAR(50),
      ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100) DEFAULT 'ambas',
      ADD COLUMN IF NOT EXISTS comision_ventas DECIMAL(5,2) DEFAULT 3.00,
      ADD COLUMN IF NOT EXISTS comision_arriendos DECIMAL(5,2) DEFAULT 10.00,
      ADD COLUMN IF NOT EXISTS foto_perfil TEXT,
      ADD COLUMN IF NOT EXISTS biografia TEXT,
      ADD COLUMN IF NOT EXISTS fecha_ingreso DATE DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS es_agente BOOLEAN DEFAULT true
    `)

    // Paso 2: Marcar admin principal como NO agente
    await executeQuery(`
      UPDATE administradores 
      SET es_agente = false 
      WHERE email = 'homestate.dev@gmail.com'
    `)

    // Paso 3: Verificar si existe la tabla agentes_inmobiliarios
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'agentes_inmobiliarios'
      )
    `
    const tableExists = await executeQuery(checkTableQuery)
    
    if (tableExists.rows[0].exists) {
      console.log('Tabla agentes_inmobiliarios existe, migrando datos...')

      // Crear tabla de mapeo temporal
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS mapeo_agente_admin (
          agente_id INTEGER,
          admin_firebase_uid VARCHAR(255),
          admin_id INTEGER
        )
      `)

      // Migrar agentes que no sean administradores
      await executeQuery(`
        INSERT INTO administradores (
          firebase_uid, 
          nombre, 
          email, 
          telefono, 
          cedula, 
          especialidad, 
          comision_ventas, 
          comision_arriendos, 
          foto_perfil, 
          biografia, 
          fecha_ingreso, 
          activo, 
          es_agente,
          creado_por
        )
        SELECT 
          'agent_' || id || '_' || extract(epoch from now())::text as firebase_uid,
          nombre,
          email,
          telefono,
          cedula,
          especialidad,
          comision_ventas,
          comision_arriendos,
          foto_perfil,
          biografia,
          fecha_ingreso,
          activo,
          true as es_agente,
          creado_por
        FROM agentes_inmobiliarios ai
        WHERE NOT EXISTS (
          SELECT 1 FROM administradores a WHERE a.email = ai.email
        )
      `)

      // Poblar tabla de mapeo
      await executeQuery(`
        INSERT INTO mapeo_agente_admin (agente_id, admin_firebase_uid, admin_id)
        SELECT 
          ai.id,
          a.firebase_uid,
          a.id as admin_id
        FROM agentes_inmobiliarios ai
        JOIN administradores a ON a.email = ai.email
        WHERE a.es_agente = true
      `)

      // Actualizar referencias en departamentos si existen
      try {
        await executeQuery(`
          UPDATE departamentos 
          SET agente_venta_id = (
            SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = departamentos.agente_venta_id
          )
          WHERE agente_venta_id IS NOT NULL
        `)

        await executeQuery(`
          UPDATE departamentos 
          SET agente_arriendo_id = (
            SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = departamentos.agente_arriendo_id
          )
          WHERE agente_arriendo_id IS NOT NULL
        `)
      } catch (error) {
        console.log('Columnas de agente en departamentos no existen aún')
      }

      // Actualizar referencias en transacciones si existen
      try {
        await executeQuery(`
          UPDATE transacciones_departamentos 
          SET agente_id = (
            SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = transacciones_departamentos.agente_id
          )
          WHERE agente_id IS NOT NULL
        `)
      } catch (error) {
        console.log('Tabla transacciones_departamentos no existe aún')
      }

      // Renombrar tabla original
      await executeQuery(`
        ALTER TABLE agentes_inmobiliarios RENAME TO agentes_inmobiliarios_backup
      `)

      // Limpiar tabla temporal
      await executeQuery(`
        DROP TABLE IF EXISTS mapeo_agente_admin
      `)

      // Actualizar constraints para apuntar a administradores
      try {
        // Departamentos
        await executeQuery(`
          ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS departamentos_agente_venta_id_fkey
        `)
        await executeQuery(`
          ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS departamentos_agente_arriendo_id_fkey
        `)
        await executeQuery(`
          ALTER TABLE departamentos ADD CONSTRAINT departamentos_agente_venta_id_fkey 
          FOREIGN KEY (agente_venta_id) REFERENCES administradores(id)
        `)
        await executeQuery(`
          ALTER TABLE departamentos ADD CONSTRAINT departamentos_agente_arriendo_id_fkey 
          FOREIGN KEY (agente_arriendo_id) REFERENCES administradores(id)
        `)

        // Transacciones departamentos
        await executeQuery(`
          ALTER TABLE transacciones_departamentos DROP CONSTRAINT IF EXISTS transacciones_departamentos_agente_id_fkey
        `)
        await executeQuery(`
          ALTER TABLE transacciones_departamentos ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
          FOREIGN KEY (agente_id) REFERENCES administradores(id)
        `)
      } catch (error) {
        console.log('Algunas constraints no pudieron ser actualizadas:', error)
      }
    }

    // Crear índices para los nuevos campos
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_administradores_es_agente ON administradores(es_agente)
    `)
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_administradores_especialidad ON administradores(especialidad)
    `)
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_administradores_cedula ON administradores(cedula)
    `)

    // Crear vista de compatibilidad
    await executeQuery(`
      CREATE OR REPLACE VIEW agentes_inmobiliarios_view AS
      SELECT 
        id,
        firebase_uid,
        nombre,
        email,
        telefono,
        cedula,
        especialidad,
        comision_ventas,
        comision_arriendos,
        activo,
        foto_perfil,
        biografia,
        fecha_ingreso,
        fecha_creacion,
        fecha_actualizacion
      FROM administradores 
      WHERE es_agente = true
    `)

    // Crear trigger para nuevos administradores
    await executeQuery(`
      CREATE OR REPLACE FUNCTION trigger_admin_como_agente()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' AND NEW.email != 'homestate.dev@gmail.com' THEN
          NEW.es_agente = true;
          IF NEW.especialidad IS NULL THEN
            NEW.especialidad = 'ambas';
          END IF;
          IF NEW.comision_ventas IS NULL THEN
            NEW.comision_ventas = 3.00;
          END IF;
          IF NEW.comision_arriendos IS NULL THEN
            NEW.comision_arriendos = 10.00;
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await executeQuery(`
      DROP TRIGGER IF EXISTS trigger_admin_agente_setup ON administradores
    `)

    await executeQuery(`
      CREATE TRIGGER trigger_admin_agente_setup
        BEFORE INSERT ON administradores
        FOR EACH ROW
        EXECUTE FUNCTION trigger_admin_como_agente()
    `)

    console.log('Migración completada exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Migración de unificación administradores-agentes completada exitosamente',
      data: {
        table_structure_updated: true,
        data_migrated: tableExists.rows[0].exists,
        indexes_created: true,
        triggers_created: true
      }
    })

  } catch (error: any) {
    console.error('Error durante la migración:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error durante la migración', 
        details: error.message 
      },
      { status: 500 }
    )
  }
} 