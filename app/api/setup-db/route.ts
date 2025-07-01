import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'setup-agents') {
      console.log('Configurando tablas de agentes inmobiliarios...')

      // Crear tabla de agentes inmobiliarios
      const createAgentsTable = `
        CREATE TABLE IF NOT EXISTS agentes_inmobiliarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          telefono VARCHAR(50),
          cedula VARCHAR(50) UNIQUE,
          especialidad VARCHAR(100) NOT NULL,
          comision_ventas DECIMAL(5,2) DEFAULT 3.00,
          comision_arriendos DECIMAL(5,2) DEFAULT 10.00,
          activo BOOLEAN DEFAULT true,
          foto_perfil TEXT,
          biografia TEXT,
          fecha_ingreso DATE,
          creado_por VARCHAR(128) NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Crear tabla de transacciones de departamentos
      const createTransactionsTable = `
        CREATE TABLE IF NOT EXISTS transacciones_departamentos (
          id SERIAL PRIMARY KEY,
          departamento_id INTEGER NOT NULL,
          agente_id INTEGER NOT NULL,
          tipo_transaccion VARCHAR(20) NOT NULL CHECK (tipo_transaccion IN ('venta', 'arriendo')),
          precio_final DECIMAL(15,2) NOT NULL,
          precio_original DECIMAL(15,2),
          comision_agente DECIMAL(15,2) NOT NULL,
          cliente_nombre VARCHAR(255),
          cliente_email VARCHAR(255),
          cliente_telefono VARCHAR(50),
          notas TEXT,
          creado_por VARCHAR(128) NOT NULL,
          fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
          FOREIGN KEY (agente_id) REFERENCES agentes_inmobiliarios(id) ON DELETE CASCADE
        )
      `

      // Crear tabla de acciones de admin si no existe
      const createAdminActionsTable = `
        CREATE TABLE IF NOT EXISTS admin_acciones (
          id SERIAL PRIMARY KEY,
          admin_firebase_uid VARCHAR(128) NOT NULL,
          accion TEXT NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          metadata JSONB,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Agregar columnas de agentes a la tabla departamentos si no existen
      const addAgentColumns = `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='agente_venta_id') THEN
            ALTER TABLE departamentos ADD COLUMN agente_venta_id INTEGER;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='agente_arriendo_id') THEN
            ALTER TABLE departamentos ADD COLUMN agente_arriendo_id INTEGER;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='fecha_venta') THEN
            ALTER TABLE departamentos ADD COLUMN fecha_venta TIMESTAMP;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='fecha_arriendo') THEN
            ALTER TABLE departamentos ADD COLUMN fecha_arriendo TIMESTAMP;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='precio_venta_final') THEN
            ALTER TABLE departamentos ADD COLUMN precio_venta_final DECIMAL(15,2);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departamentos' AND column_name='precio_arriendo_final') THEN
            ALTER TABLE departamentos ADD COLUMN precio_arriendo_final DECIMAL(15,2);
          END IF;
        END $$;
      `

      // Ejecutar todas las consultas
      await executeQuery(createAgentsTable)
      console.log('✅ Tabla agentes_inmobiliarios creada')

      await executeQuery(createTransactionsTable)
      console.log('✅ Tabla transacciones_departamentos creada')

      await executeQuery(createAdminActionsTable)
      console.log('✅ Tabla admin_acciones creada')

      await executeQuery(addAgentColumns)
      console.log('✅ Columnas de agentes agregadas a departamentos')

      // Insertar datos de ejemplo
      const insertSampleAgents = `
        INSERT INTO agentes_inmobiliarios (nombre, email, telefono, cedula, especialidad, comision_ventas, comision_arriendos, biografia, fecha_ingreso, creado_por)
        VALUES 
          ('Ana María González', 'ana.gonzalez@homestate.com', '+57 300 123 4567', '1234567890', 'Ventas Residenciales', 4.5, 12.0, 'Especialista en propiedades residenciales con más de 8 años de experiencia.', '2023-01-15', 'system'),
          ('Carlos Rodríguez', 'carlos.rodriguez@homestate.com', '+57 310 987 6543', '9876543210', 'Arriendos Comerciales', 3.0, 15.0, 'Experto en arriendos comerciales y oficinas ejecutivas.', '2022-06-10', 'system'),
          ('Laura Fernández', 'laura.fernandez@homestate.com', '+57 320 555 7890', '5555777888', 'Propiedades de Lujo', 6.0, 18.0, 'Especializada en propiedades de alto valor y clientes VIP.', '2021-03-20', 'system')
        ON CONFLICT (email) DO NOTHING
      `

      await executeQuery(insertSampleAgents)
      console.log('✅ Agentes de ejemplo insertados')

      return NextResponse.json({
        success: true,
        message: 'Tablas de agentes inmobiliarios configuradas exitosamente',
        details: {
          tables_created: ['agentes_inmobiliarios', 'transacciones_departamentos', 'admin_acciones'],
          columns_added: ['agente_venta_id', 'agente_arriendo_id', 'fecha_venta', 'fecha_arriendo', 'precio_venta_final', 'precio_arriendo_final'],
          sample_agents: 3
        }
      })
    }

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
    console.error('Error en setup-db:', error)
    return NextResponse.json(
      { success: false, error: 'Error al configurar la base de datos', details: error.message },
      { status: 500 }
    )
  }
} 