import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST() {
  try {
    // Crear tabla de administradores
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS administradores (
          id SERIAL PRIMARY KEY,
          firebase_uid VARCHAR(255) UNIQUE NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          activo BOOLEAN DEFAULT true,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          creado_por VARCHAR(255)
      )
    `)

    // Crear tabla de acciones/actividades
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_acciones (
          id SERIAL PRIMARY KEY,
          admin_firebase_uid VARCHAR(255) NOT NULL,
          accion TEXT NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          metadata JSONB,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de edificios
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS edificios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          direccion TEXT NOT NULL,
          permalink VARCHAR(255) UNIQUE NOT NULL,
          costo_expensas DECIMAL(10,2) DEFAULT 0,
          areas_comunales JSONB DEFAULT '[]',
          seguridad JSONB DEFAULT '[]',
          aparcamiento JSONB DEFAULT '[]',
          url_imagen_principal TEXT NOT NULL,
          imagenes_secundarias JSONB DEFAULT '[]',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          creado_por VARCHAR(255)
      )
    `)

    // Crear tabla de departamentos
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS departamentos (
          id SERIAL PRIMARY KEY,
          edificio_id INTEGER REFERENCES edificios(id) ON DELETE CASCADE,
          numero VARCHAR(50) NOT NULL,
          piso INTEGER,
          habitaciones INTEGER,
          banos INTEGER,
          area_m2 DECIMAL(10,2),
          precio_alquiler DECIMAL(10,2),
          disponible BOOLEAN DEFAULT true,
          descripcion TEXT,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear índices para mejorar rendimiento
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_administradores_activo ON administradores(activo)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_admin_acciones_uid ON admin_acciones(admin_firebase_uid)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_admin_acciones_fecha ON admin_acciones(fecha)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_admin_acciones_tipo ON admin_acciones(tipo)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_edificios_permalink ON edificios(permalink)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_departamentos_edificio ON departamentos(edificio_id)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_departamentos_disponible ON departamentos(disponible)`)

    // Crear función para actualizar fecha_actualizacion
    await executeQuery(`
      CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    // Crear triggers
    await executeQuery(`
      DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion ON administradores
    `)
    
    await executeQuery(`
      CREATE TRIGGER trigger_update_fecha_actualizacion
          BEFORE UPDATE ON administradores
          FOR EACH ROW
          EXECUTE FUNCTION update_fecha_actualizacion()
    `)

    await executeQuery(`
      DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion_edificios ON edificios
    `)
    
    await executeQuery(`
      CREATE TRIGGER trigger_update_fecha_actualizacion_edificios
          BEFORE UPDATE ON edificios
          FOR EACH ROW
          EXECUTE FUNCTION update_fecha_actualizacion()
    `)

    await executeQuery(`
      DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion_departamentos ON departamentos
    `)
    
    await executeQuery(`
      CREATE TRIGGER trigger_update_fecha_actualizacion_departamentos
          BEFORE UPDATE ON departamentos
          FOR EACH ROW
          EXECUTE FUNCTION update_fecha_actualizacion()
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Tablas creadas exitosamente' 
    })

  } catch (error) {
    console.error('Error al crear tablas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear tablas en la base de datos' },
      { status: 500 }
    )
  }
} 