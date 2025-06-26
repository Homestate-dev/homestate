-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por VARCHAR(255) REFERENCES administradores(firebase_uid)
);

-- Crear tabla de acciones/actividades
CREATE TABLE IF NOT EXISTS admin_acciones (
    id SERIAL PRIMARY KEY,
    admin_firebase_uid VARCHAR(255) NOT NULL REFERENCES administradores(firebase_uid),
    accion TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'creación', 'edición', 'eliminación', 'generación', 'reporte', 'sesión'
    metadata JSONB, -- información adicional sobre la acción
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de edificios
CREATE TABLE IF NOT EXISTS edificios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    permalink VARCHAR(255) UNIQUE NOT NULL,
    costo_expensas INTEGER DEFAULT 0,
    areas_comunales JSONB DEFAULT '[]',
    seguridad JSONB DEFAULT '[]',
    aparcamiento JSONB DEFAULT '[]',
    descripcion TEXT,
    url_imagen_principal TEXT,
    imagenes_secundarias JSONB DEFAULT '[]',
    creado_por VARCHAR(255) NOT NULL REFERENCES administradores(firebase_uid),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    edificio_id INTEGER NOT NULL REFERENCES edificios(id) ON DELETE CASCADE,
    numero VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    piso INTEGER NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    valor_arriendo INTEGER DEFAULT 0,
    valor_venta INTEGER DEFAULT 0,
    disponible BOOLEAN DEFAULT true,
    cantidad_habitaciones VARCHAR(50) NOT NULL,
    tipo VARCHAR(100) NOT NULL, -- 'arriendo', 'venta', 'arriendo y venta'
    estado VARCHAR(100) NOT NULL, -- 'nuevo', 'poco_uso', 'un_ano', 'mas_de_un_ano', 'remodelar'
    ideal_para VARCHAR(100) NOT NULL, -- 'persona_sola', 'pareja', 'profesional', 'familia'
    
    -- Características booleanas
    amueblado BOOLEAN DEFAULT false,
    tiene_living_comedor BOOLEAN DEFAULT false,
    tiene_cocina_separada BOOLEAN DEFAULT false,
    tiene_antebano BOOLEAN DEFAULT false,
    tiene_bano_completo BOOLEAN DEFAULT false,
    tiene_aire_acondicionado BOOLEAN DEFAULT false,
    tiene_placares BOOLEAN DEFAULT false,
    tiene_cocina_con_horno_y_anafe BOOLEAN DEFAULT false,
    tiene_muebles_bajo_mesada BOOLEAN DEFAULT false,
    tiene_desayunador_madera BOOLEAN DEFAULT false,
    
    -- Imágenes y metadatos
    imagenes JSONB DEFAULT '[]',
    creado_por VARCHAR(255) NOT NULL REFERENCES administradores(firebase_uid),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para evitar duplicados de número en el mismo edificio
    UNIQUE(edificio_id, numero)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_activo ON administradores(activo);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_uid ON admin_acciones(admin_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_fecha ON admin_acciones(fecha);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_tipo ON admin_acciones(tipo);
CREATE INDEX IF NOT EXISTS idx_edificios_permalink ON edificios(permalink);
CREATE INDEX IF NOT EXISTS idx_edificios_creado_por ON edificios(creado_por);
CREATE INDEX IF NOT EXISTS idx_departamentos_edificio_id ON departamentos(edificio_id);
CREATE INDEX IF NOT EXISTS idx_departamentos_disponible ON departamentos(disponible);
CREATE INDEX IF NOT EXISTS idx_departamentos_numero ON departamentos(numero);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_update_fecha_actualizacion_administradores
    BEFORE UPDATE ON administradores
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE OR REPLACE TRIGGER trigger_update_fecha_actualizacion_edificios
    BEFORE UPDATE ON edificios
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

CREATE OR REPLACE TRIGGER trigger_update_fecha_actualizacion_departamentos
    BEFORE UPDATE ON departamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion(); 