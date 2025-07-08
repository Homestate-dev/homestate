-- Script para unificar Administradores y Agentes Inmobiliarios
-- Los administradores serán también agentes inmobiliarios, excepto el admin principal (homestate.dev@gmail.com)

-- Paso 1: Agregar campos de agente inmobiliario a la tabla administradores
ALTER TABLE administradores 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(50),
ADD COLUMN IF NOT EXISTS cedula VARCHAR(50),
ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100) DEFAULT 'ambas', -- 'ventas', 'arriendos', 'ambas'
ADD COLUMN IF NOT EXISTS comision_ventas DECIMAL(5,2) DEFAULT 3.00,
ADD COLUMN IF NOT EXISTS comision_arriendos DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS foto_perfil TEXT,
ADD COLUMN IF NOT EXISTS biografia TEXT,
ADD COLUMN IF NOT EXISTS fecha_ingreso DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS es_agente BOOLEAN DEFAULT true; -- Para distinguir si actúa como agente

-- Paso 2: Marcar al admin principal como NO agente
UPDATE administradores 
SET es_agente = false 
WHERE email = 'homestate.dev@gmail.com';

-- Paso 3: Migrar datos existentes de agentes_inmobiliarios a administradores
-- Primero, crear administradores para los agentes que no existan
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
    'agent_' || id || '_' || extract(epoch from now())::text as firebase_uid, -- UID temporal para agentes
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
);

-- Paso 4: Crear tabla de mapeo temporal para mantener las referencias
CREATE TABLE IF NOT EXISTS mapeo_agente_admin (
    agente_id INTEGER,
    admin_firebase_uid VARCHAR(255),
    admin_id INTEGER
);

-- Poblar tabla de mapeo
INSERT INTO mapeo_agente_admin (agente_id, admin_firebase_uid, admin_id)
SELECT 
    ai.id,
    a.firebase_uid,
    (SELECT id FROM administradores WHERE firebase_uid = a.firebase_uid) as admin_id
FROM agentes_inmobiliarios ai
JOIN administradores a ON a.email = ai.email;

-- Paso 5: Actualizar todas las referencias a agentes_inmobiliarios

-- Actualizar departamentos
UPDATE departamentos 
SET agente_venta_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = departamentos.agente_venta_id
)
WHERE agente_venta_id IS NOT NULL;

UPDATE departamentos 
SET agente_arriendo_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = departamentos.agente_arriendo_id
)
WHERE agente_arriendo_id IS NOT NULL;

-- Actualizar transacciones_departamentos
UPDATE transacciones_departamentos 
SET agente_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = transacciones_departamentos.agente_id
)
WHERE agente_id IS NOT NULL;

-- Actualizar transacciones_ventas_arriendos si existe
UPDATE transacciones_ventas_arriendos 
SET agente_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = transacciones_ventas_arriendos.agente_id
)
WHERE agente_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transacciones_ventas_arriendos');

-- Actualizar comisiones_agentes si existe
UPDATE comisiones_agentes 
SET agente_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = comisiones_agentes.agente_id
)
WHERE agente_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comisiones_agentes');

-- Actualizar leads_prospectos si existe
UPDATE leads_prospectos 
SET agente_id = (
    SELECT admin_id FROM mapeo_agente_admin WHERE agente_id = leads_prospectos.agente_id
)
WHERE agente_id IS NOT NULL 
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads_prospectos');

-- Paso 6: Modificar constraints para apuntar a administradores en lugar de agentes_inmobiliarios

-- Departamentos
ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS departamentos_agente_venta_id_fkey;
ALTER TABLE departamentos DROP CONSTRAINT IF EXISTS departamentos_agente_arriendo_id_fkey;
ALTER TABLE departamentos ADD CONSTRAINT departamentos_agente_venta_id_fkey 
    FOREIGN KEY (agente_venta_id) REFERENCES administradores(id);
ALTER TABLE departamentos ADD CONSTRAINT departamentos_agente_arriendo_id_fkey 
    FOREIGN KEY (agente_arriendo_id) REFERENCES administradores(id);

-- Transacciones departamentos
ALTER TABLE transacciones_departamentos DROP CONSTRAINT IF EXISTS transacciones_departamentos_agente_id_fkey;
ALTER TABLE transacciones_departamentos ADD CONSTRAINT transacciones_departamentos_agente_id_fkey 
    FOREIGN KEY (agente_id) REFERENCES administradores(id);

-- Otras tablas (solo si existen)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transacciones_ventas_arriendos') THEN
        ALTER TABLE transacciones_ventas_arriendos DROP CONSTRAINT IF EXISTS transacciones_ventas_arriendos_agente_id_fkey;
        ALTER TABLE transacciones_ventas_arriendos ADD CONSTRAINT transacciones_ventas_arriendos_agente_id_fkey 
            FOREIGN KEY (agente_id) REFERENCES administradores(id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comisiones_agentes') THEN
        ALTER TABLE comisiones_agentes DROP CONSTRAINT IF EXISTS comisiones_agentes_agente_id_fkey;
        ALTER TABLE comisiones_agentes ADD CONSTRAINT comisiones_agentes_agente_id_fkey 
            FOREIGN KEY (agente_id) REFERENCES administradores(id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads_prospectos') THEN
        ALTER TABLE leads_prospectos DROP CONSTRAINT IF EXISTS leads_prospectos_agente_id_fkey;
        ALTER TABLE leads_prospectos ADD CONSTRAINT leads_prospectos_agente_id_fkey 
            FOREIGN KEY (agente_id) REFERENCES administradores(id);
    END IF;
END $$;

-- Paso 7: Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_administradores_es_agente ON administradores(es_agente);
CREATE INDEX IF NOT EXISTS idx_administradores_especialidad ON administradores(especialidad);
CREATE INDEX IF NOT EXISTS idx_administradores_cedula ON administradores(cedula);

-- Paso 8: Crear vista para mantener compatibilidad con código existente
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
WHERE es_agente = true;

-- Paso 9: Limpiar tabla temporal de mapeo
DROP TABLE IF EXISTS mapeo_agente_admin;

-- Paso 10: Comentar la tabla antigua (no eliminar por seguridad)
-- Renombrar tabla original para respaldo
ALTER TABLE agentes_inmobiliarios RENAME TO agentes_inmobiliarios_backup;

-- Paso 11: Crear trigger para mantener sincronización
CREATE OR REPLACE FUNCTION trigger_admin_como_agente()
RETURNS TRIGGER AS $$
BEGIN
    -- Cuando se crea un nuevo administrador (excepto el principal), marcarlo como agente
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_agente_setup
    BEFORE INSERT ON administradores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_admin_como_agente(); 