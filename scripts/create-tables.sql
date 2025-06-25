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

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);
CREATE INDEX IF NOT EXISTS idx_administradores_activo ON administradores(activo);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_uid ON admin_acciones(admin_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_fecha ON admin_acciones(fecha);
CREATE INDEX IF NOT EXISTS idx_admin_acciones_tipo ON admin_acciones(tipo);

-- Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_update_fecha_actualizacion
    BEFORE UPDATE ON administradores
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion(); 