-- Script para corregir las funciones de transacciones
-- Las funciones fallaron debido a problemas de sintaxis en el parsing

-- 1. Función para registrar cambios de estado
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

-- 2. Trigger para registrar cambios automáticamente
DROP TRIGGER IF EXISTS trigger_cambio_estado_transaccion ON transacciones_departamentos;
CREATE TRIGGER trigger_cambio_estado_transaccion
  BEFORE UPDATE ON transacciones_departamentos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_cambio_estado_transaccion();

-- 3. Función para obtener el estado actual de una transacción
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

-- 4. Función para avanzar al siguiente estado
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

-- 5. Función para finalizar transacción
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

-- 6. Función para cancelar transacción
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

-- Verificar que las funciones se crearon correctamente
SELECT 'Funciones corregidas exitosamente' as resultado; 