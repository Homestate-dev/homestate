-- Script para agregar campos faltantes del cliente a transacciones_departamentos
-- Fecha: 2025-01-09

-- Agregar campos del cliente que faltan
ALTER TABLE transacciones_departamentos 
ADD COLUMN IF NOT EXISTS cliente_cedula VARCHAR(50),
ADD COLUMN IF NOT EXISTS cliente_tipo_documento VARCHAR(20) DEFAULT 'CC';

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transacciones_departamentos' 
AND column_name IN ('cliente_cedula', 'cliente_tipo_documento')
ORDER BY ordinal_position;

-- Mostrar algunos registros para verificar
SELECT 
    id,
    tipo_transaccion,
    precio_final,
    cliente_nombre,
    cliente_email,
    cliente_telefono,
    cliente_cedula,
    cliente_tipo_documento
FROM transacciones_departamentos 
ORDER BY id DESC 
LIMIT 5; 