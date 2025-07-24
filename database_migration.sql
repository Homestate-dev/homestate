-- Script de migración para agregar nuevos campos de comisiones
-- Ejecutar este script en la base de datos para actualizar la estructura

-- Agregar nuevos campos a la tabla transacciones_departamentos
ALTER TABLE transacciones_departamentos 
ADD COLUMN IF NOT EXISTS comision_porcentaje DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS comision_valor DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_homestate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_bienes_raices DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_admin_edificio DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_homestate DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_bienes_raices DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_admin_edificio DECIMAL(12,2) DEFAULT 0;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_departamentos(tipo_transaccion);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_departamentos(fecha_transaccion);
CREATE INDEX IF NOT EXISTS idx_transacciones_agente ON transacciones_departamentos(agente_id);

-- Actualizar registros existentes para mantener compatibilidad
-- Para transacciones de venta existentes, establecer comisión porcentual basada en comision_agente
UPDATE transacciones_departamentos 
SET comision_porcentaje = CASE 
    WHEN precio_final > 0 THEN (comision_agente * 100) / precio_final 
    ELSE 0 
END,
comision_valor = comision_agente
WHERE comision_porcentaje = 0 AND tipo_transaccion = 'venta';

-- Para transacciones de arriendo existentes, establecer comisión en valor
UPDATE transacciones_departamentos 
SET comision_valor = comision_agente
WHERE comision_valor = 0 AND tipo_transaccion = 'arriendo';

-- Establecer porcentajes por defecto para registros existentes
UPDATE transacciones_departamentos 
SET 
    porcentaje_homestate = 60,
    porcentaje_bienes_raices = 30,
    porcentaje_admin_edificio = 10,
    valor_homestate = (comision_valor * 60) / 100,
    valor_bienes_raices = (comision_valor * 30) / 100,
    valor_admin_edificio = (comision_valor * 10) / 100
WHERE porcentaje_homestate = 0;

-- Verificar que la migración se completó correctamente
SELECT 
    COUNT(*) as total_transacciones,
    COUNT(CASE WHEN comision_porcentaje IS NOT NULL THEN 1 END) as con_comision_porcentaje,
    COUNT(CASE WHEN comision_valor IS NOT NULL THEN 1 END) as con_comision_valor,
    COUNT(CASE WHEN porcentaje_homestate IS NOT NULL THEN 1 END) as con_porcentaje_homestate
FROM transacciones_departamentos; 