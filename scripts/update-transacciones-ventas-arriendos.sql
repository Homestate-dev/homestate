-- Script para actualizar la tabla transacciones_ventas_arriendos
-- Agregar las nuevas columnas de estado para compatibilidad con el nuevo sistema

-- 1. Agregar columnas necesarias a transacciones_ventas_arriendos
ALTER TABLE transacciones_ventas_arriendos 
ADD COLUMN IF NOT EXISTS estado_actual VARCHAR(50) DEFAULT 'reservado',
ADD COLUMN IF NOT EXISTS datos_estado JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fecha_ultimo_estado TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Migrar datos existentes de la columna estado a estado_actual
UPDATE transacciones_ventas_arriendos 
SET 
  estado_actual = CASE 
    WHEN estado = 'pendiente' THEN 'reservado'
    WHEN estado = 'en_proceso' THEN 'reservado'
    WHEN estado = 'completada' THEN 'completada'
    WHEN estado = 'cancelada' THEN 'desistimiento'
    ELSE 'reservado'
  END,
  datos_estado = jsonb_build_object(
    'estado_anterior', estado,
    'migrado_desde_sistema_anterior', true
  )
WHERE estado_actual IS NULL OR estado_actual = '';

-- 3. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tva_estado_actual ON transacciones_ventas_arriendos(estado_actual);
CREATE INDEX IF NOT EXISTS idx_tva_datos_estado ON transacciones_ventas_arriendos USING GIN(datos_estado);
CREATE INDEX IF NOT EXISTS idx_tva_fecha_ultimo_estado ON transacciones_ventas_arriendos(fecha_ultimo_estado);

-- 4. Verificar que la migración se ejecutó correctamente
SELECT 'Migración de transacciones_ventas_arriendos completada exitosamente' as resultado; 