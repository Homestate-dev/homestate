-- Migración para implementar el nuevo sistema de estados de transacción
-- Fecha: 2025-01-09
-- Descripción: Eliminar campo estado actual y crear nueva estructura de estados progresivos

-- 1. Crear tabla para estados de transacción
CREATE TABLE IF NOT EXISTS estados_transaccion (
  id SERIAL PRIMARY KEY,
  transaccion_id INTEGER NOT NULL,
  tipo_transaccion VARCHAR(10) NOT NULL CHECK (tipo_transaccion IN ('venta', 'arriendo')),
  estado_actual VARCHAR(50) NOT NULL,
  fecha_estado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  datos_estado JSONB NOT NULL DEFAULT '{}',
  comentarios TEXT,
  creado_por VARCHAR(255),
  FOREIGN KEY (transaccion_id) REFERENCES transacciones_departamentos(id) ON DELETE CASCADE
);

-- 2. Crear tabla para historial de cambios de estado
CREATE TABLE IF NOT EXISTS historial_estados_transaccion (
  id SERIAL PRIMARY KEY,
  transaccion_id INTEGER NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo_cambio VARCHAR(500),
  datos_estado JSONB NOT NULL DEFAULT '{}',
  usuario_responsable VARCHAR(255),
  FOREIGN KEY (transaccion_id) REFERENCES transacciones_departamentos(id) ON DELETE CASCADE
);

-- 3. Agregar columnas necesarias a transacciones_departamentos
ALTER TABLE transacciones_departamentos 
ADD COLUMN IF NOT EXISTS estado_actual VARCHAR(50) DEFAULT 'reservado',
ADD COLUMN IF NOT EXISTS datos_estado JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fecha_ultimo_estado TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_estados_transaccion_id ON estados_transaccion(transaccion_id);
CREATE INDEX IF NOT EXISTS idx_estados_tipo ON estados_transaccion(tipo_transaccion);
CREATE INDEX IF NOT EXISTS idx_estados_actual ON estados_transaccion(estado_actual);
CREATE INDEX IF NOT EXISTS idx_historial_transaccion_id ON historial_estados_transaccion(transaccion_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_estados_transaccion(fecha_cambio);

-- 5. Crear función para registrar cambios de estado
CREATE OR REPLACE FUNCTION registrar_cambio_estado_transaccion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado cambió, registrar en el historial
  IF OLD.estado_actual IS DISTINCT FROM NEW.estado_actual THEN
    INSERT INTO historial_estados_transaccion (
      transaccion_id,
      estado_anterior,
      estado_nuevo,
      datos_estado,
      usuario_responsable
    ) VALUES (
      NEW.id,
      OLD.estado_actual,
      NEW.estado_actual,
      NEW.datos_estado,
      NEW.creado_por
    );
  END IF;
  
  -- Actualizar la fecha del último estado
  NEW.fecha_ultimo_estado = CURRENT_TIMESTAMP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para registrar cambios automáticamente
DROP TRIGGER IF EXISTS trigger_cambio_estado_transaccion ON transacciones_departamentos;
CREATE TRIGGER trigger_cambio_estado_transaccion
  BEFORE UPDATE ON transacciones_departamentos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_cambio_estado_transaccion();

-- 7. Crear función para obtener el estado actual de una transacción
CREATE OR REPLACE FUNCTION obtener_estado_transaccion(p_transaccion_id INTEGER)
RETURNS TABLE (
  estado_actual VARCHAR(50),
  datos_estado JSONB,
  fecha_estado TIMESTAMP,
  comentarios TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.estado_actual,
    t.datos_estado,
    t.fecha_ultimo_estado,
    e.comentarios
  FROM transacciones_departamentos t
  LEFT JOIN estados_transaccion e ON t.id = e.transaccion_id 
    AND e.fecha_estado = (
      SELECT MAX(fecha_estado) 
      FROM estados_transaccion 
      WHERE transaccion_id = t.id
    )
  WHERE t.id = p_transaccion_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear función para avanzar al siguiente estado
CREATE OR REPLACE FUNCTION avanzar_estado_transaccion(
  p_transaccion_id INTEGER,
  p_nuevo_estado VARCHAR(50),
  p_datos_estado JSONB DEFAULT '{}',
  p_comentarios TEXT DEFAULT NULL,
  p_usuario VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tipo_transaccion VARCHAR(10);
  v_estado_actual VARCHAR(50);
  v_estados_validos TEXT[];
BEGIN
  -- Obtener información de la transacción
  SELECT tipo_transaccion, estado_actual 
  INTO v_tipo_transaccion, v_estado_actual
  FROM transacciones_departamentos 
  WHERE id = p_transaccion_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Definir estados válidos según el tipo de transacción
  IF v_tipo_transaccion = 'venta' THEN
    v_estados_validos := ARRAY['reservado', 'promesa_compra_venta', 'firma_escrituras', 'desistimiento'];
  ELSE
    v_estados_validos := ARRAY['reservado', 'firma_y_pago', 'desistimiento'];
  END IF;
  
  -- Verificar que el nuevo estado sea válido
  IF p_nuevo_estado = ANY(v_estados_validos) THEN
    -- Actualizar el estado en la transacción
    UPDATE transacciones_departamentos 
    SET 
      estado_actual = p_nuevo_estado,
      datos_estado = p_datos_estado,
      fecha_ultimo_estado = CURRENT_TIMESTAMP
    WHERE id = p_transaccion_id;
    
    -- Registrar en la tabla de estados
    INSERT INTO estados_transaccion (
      transaccion_id,
      tipo_transaccion,
      estado_actual,
      datos_estado,
      comentarios,
      creado_por
    ) VALUES (
      p_transaccion_id,
      v_tipo_transaccion,
      p_nuevo_estado,
      p_datos_estado,
      p_comentarios,
      p_usuario
    );
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear función para finalizar transacción
CREATE OR REPLACE FUNCTION finalizar_transaccion(p_transaccion_id INTEGER, p_usuario VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
  v_tipo_transaccion VARCHAR(10);
BEGIN
  -- Obtener tipo de transacción
  SELECT tipo_transaccion INTO v_tipo_transaccion
  FROM transacciones_departamentos 
  WHERE id = p_transaccion_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marcar como completada
  UPDATE transacciones_departamentos 
  SET 
    estado_actual = 'completada',
    fecha_ultimo_estado = CURRENT_TIMESTAMP
  WHERE id = p_transaccion_id;
  
  -- Registrar en historial
  INSERT INTO historial_estados_transaccion (
    transaccion_id,
    estado_anterior,
    estado_nuevo,
    datos_estado,
    usuario_responsable
  ) VALUES (
    p_transaccion_id,
    'en_proceso',
    'completada',
    '{"finalizada_por": "' || p_usuario || '"}',
    p_usuario
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Crear función para cancelar transacción
CREATE OR REPLACE FUNCTION cancelar_transaccion(
  p_transaccion_id INTEGER, 
  p_razon_desistimiento TEXT,
  p_valor_amonestacion DECIMAL(15,2),
  p_usuario VARCHAR(255)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Actualizar a estado desistimiento
  UPDATE transacciones_departamentos 
  SET 
    estado_actual = 'desistimiento',
    datos_estado = jsonb_build_object(
      'razon_desistimiento', p_razon_desistimiento,
      'valor_amonestacion', p_valor_amonestacion
    ),
    fecha_ultimo_estado = CURRENT_TIMESTAMP
  WHERE id = p_transaccion_id;
  
  -- Registrar en historial
  INSERT INTO historial_estados_transaccion (
    transaccion_id,
    estado_anterior,
    estado_nuevo,
    datos_estado,
    usuario_responsable
  ) VALUES (
    p_transaccion_id,
    'en_proceso',
    'desistimiento',
    jsonb_build_object(
      'razon_desistimiento', p_razon_desistimiento,
      'valor_amonestacion', p_valor_amonestacion
    ),
    p_usuario
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. Migrar transacciones existentes al nuevo sistema
-- Actualizar transacciones existentes para usar el nuevo sistema de estados
UPDATE transacciones_departamentos 
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

-- 12. Crear vistas para facilitar consultas
CREATE OR REPLACE VIEW vista_estados_transaccion AS
SELECT 
  t.id,
  t.departamento_id,
  t.tipo_transaccion,
  t.estado_actual,
  t.datos_estado,
  t.fecha_ultimo_estado,
  d.numero as departamento_numero,
  e.nombre as edificio_nombre,
  a.nombre as agente_nombre,
  t.cliente_nombre,
  t.precio_final
FROM transacciones_departamentos t
LEFT JOIN departamentos d ON t.departamento_id = d.id
LEFT JOIN edificios e ON d.edificio_id = e.id
LEFT JOIN administradores a ON t.agente_id = a.id;

-- 13. Crear vista para historial completo
CREATE OR REPLACE VIEW vista_historial_transaccion AS
SELECT 
  h.id,
  h.transaccion_id,
  h.estado_anterior,
  h.estado_nuevo,
  h.fecha_cambio,
  h.motivo_cambio,
  h.datos_estado,
  h.usuario_responsable,
  t.tipo_transaccion,
  t.cliente_nombre
FROM historial_estados_transaccion h
JOIN transacciones_departamentos t ON h.transaccion_id = t.id
ORDER BY h.fecha_cambio DESC;

-- Verificar que la migración se ejecutó correctamente
SELECT 'Migración completada exitosamente' as resultado; 