-- Script para agregar campos adicionales a transacciones_departamentos
-- Para los campos: Canal de Captación, Fecha de Primer Contacto, Notas de Transacción y Observaciones Generales

-- Agregar campos adicionales si no existen
ALTER TABLE transacciones_departamentos 
ADD COLUMN IF NOT EXISTS referido_por VARCHAR(200),
ADD COLUMN IF NOT EXISTS canal_captacion VARCHAR(100),
ADD COLUMN IF NOT EXISTS fecha_primer_contacto DATE,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transacciones_departamentos' 
AND column_name IN ('referido_por', 'canal_captacion', 'fecha_primer_contacto', 'observaciones')
ORDER BY column_name;

-- Mostrar algunos registros para verificar
SELECT 
    id,
    tipo_transaccion,
    cliente_nombre,
    referido_por,
    canal_captacion,
    fecha_primer_contacto,
    notas,
    observaciones
FROM transacciones_departamentos 
ORDER BY id DESC 
LIMIT 5;
