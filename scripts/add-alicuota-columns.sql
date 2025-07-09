-- Migración: Agregar columnas alicuota e incluye_alicuota a la tabla departamentos
-- Fecha: 2025-01-09

-- Agregar las columnas solo si no existen
ALTER TABLE departamentos 
ADD COLUMN IF NOT EXISTS alicuota INTEGER DEFAULT 0;

ALTER TABLE departamentos 
ADD COLUMN IF NOT EXISTS incluye_alicuota BOOLEAN DEFAULT false;

-- Crear índice para mejorar consultas por alicuota si es necesario
CREATE INDEX IF NOT EXISTS idx_departamentos_alicuota ON departamentos(alicuota);

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND column_name IN ('alicuota', 'incluye_alicuota'); 