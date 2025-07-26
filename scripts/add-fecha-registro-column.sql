-- Script para agregar la columna fecha_registro a transacciones_departamentos
-- Fecha: 2025-01-09

-- 1. Agregar columna fecha_registro a transacciones_departamentos
ALTER TABLE transacciones_departamentos 
ADD COLUMN fecha_registro DATE DEFAULT CURRENT_DATE;

-- 2. Actualizar registros existentes con fecha actual
UPDATE transacciones_departamentos 
SET fecha_registro = CURRENT_DATE 
WHERE fecha_registro IS NULL;

-- 3. Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transacciones_departamentos' 
AND column_name = 'fecha_registro';

-- 4. Mostrar algunos registros para verificar
SELECT 
    id,
    tipo_transaccion,
    precio_final,
    fecha_registro,
    estado_actual,
    cliente_nombre
FROM transacciones_departamentos 
ORDER BY id DESC 
LIMIT 5; 