-- Tabla para gestionar todas las transacciones de ventas y arriendos
CREATE TABLE IF NOT EXISTS transacciones_ventas_arriendos (
  id SERIAL PRIMARY KEY,
  departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
  agente_id INTEGER REFERENCES agentes_inmobiliarios(id) ON DELETE SET NULL,
  tipo_transaccion VARCHAR(10) CHECK (tipo_transaccion IN ('venta', 'arriendo')) NOT NULL,
  valor_transaccion DECIMAL(15,2) NOT NULL,
  comision_porcentaje DECIMAL(5,2) DEFAULT 3.0,
  comision_valor DECIMAL(15,2),
  fecha_transaccion DATE NOT NULL,
  fecha_firma_contrato DATE,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Datos del cliente
  cliente_nombre VARCHAR(200) NOT NULL,
  cliente_email VARCHAR(200),
  cliente_telefono VARCHAR(50),
  cliente_cedula VARCHAR(50),
  cliente_tipo_documento VARCHAR(20) DEFAULT 'CC',
  
  -- Detalles específicos por tipo de transacción
  -- Para arriendos
  duracion_contrato_meses INTEGER,
  deposito_garantia DECIMAL(15,2),
  valor_administracion DECIMAL(15,2),
  
  -- Para ventas
  forma_pago VARCHAR(100), -- contado, financiación, mixto, etc.
  entidad_financiera VARCHAR(200),
  valor_credito DECIMAL(15,2),
  valor_inicial DECIMAL(15,2),
  
  -- Estados y seguimiento
  estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_proceso', 'completada', 'cancelada')) DEFAULT 'pendiente',
  notas TEXT,
  documentos_adjuntos TEXT[], -- URLs de documentos
  
  -- Campos adicionales
  referido_por VARCHAR(200),
  canal_captacion VARCHAR(100), -- presencial, online, recomendación, etc.
  fecha_primer_contacto DATE,
  observaciones TEXT,
  
  UNIQUE(departamento_id, tipo_transaccion, fecha_transaccion)
);

-- Tabla para histórico de estados de departamentos
CREATE TABLE IF NOT EXISTS historico_estados_departamentos (
  id SERIAL PRIMARY KEY,
  departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  transaccion_id INTEGER REFERENCES transacciones_ventas_arriendos(id) ON DELETE SET NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_responsable VARCHAR(200),
  motivo_cambio VARCHAR(500),
  observaciones TEXT
);

-- Tabla para comisiones y pagos a agentes
CREATE TABLE IF NOT EXISTS comisiones_agentes (
  id SERIAL PRIMARY KEY,
  transaccion_id INTEGER REFERENCES transacciones_ventas_arriendos(id) ON DELETE CASCADE,
  agente_id INTEGER REFERENCES agentes_inmobiliarios(id) ON DELETE CASCADE,
  valor_comision DECIMAL(15,2) NOT NULL,
  porcentaje_aplicado DECIMAL(5,2) NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_pago DATE,
  estado_pago VARCHAR(20) CHECK (estado_pago IN ('pendiente', 'pagado', 'parcial')) DEFAULT 'pendiente',
  valor_pagado DECIMAL(15,2) DEFAULT 0,
  forma_pago VARCHAR(100),
  referencia_pago VARCHAR(200),
  observaciones_pago TEXT
);

-- Tabla para seguimiento de leads y prospectos
CREATE TABLE IF NOT EXISTS leads_prospectos (
  id SERIAL PRIMARY KEY,
  departamento_id INTEGER REFERENCES departamentos(id) ON DELETE CASCADE,
  agente_id INTEGER REFERENCES agentes_inmobiliarios(id) ON DELETE SET NULL,
  
  -- Datos del prospecto
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  telefono VARCHAR(50),
  presupuesto_min DECIMAL(15,2),
  presupuesto_max DECIMAL(15,2),
  tipo_interes VARCHAR(10) CHECK (tipo_interes IN ('venta', 'arriendo')),
  
  -- Seguimiento
  estado VARCHAR(20) CHECK (estado IN ('nuevo', 'contactado', 'calificado', 'negociacion', 'cerrado', 'perdido')) DEFAULT 'nuevo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_contacto TIMESTAMP,
  fecha_proxima_accion DATE,
  prioridad VARCHAR(10) CHECK (prioridad IN ('baja', 'media', 'alta')) DEFAULT 'media',
  
  -- Origen del lead
  fuente VARCHAR(100), -- web, referido, llamada, etc.
  campaña VARCHAR(200),
  medio VARCHAR(100),
  
  -- Notas y seguimiento
  notas TEXT,
  historial_contactos TEXT,
  motivo_perdida VARCHAR(500),
  fecha_perdida DATE,
  
  -- Conversión
  transaccion_id INTEGER REFERENCES transacciones_ventas_arriendos(id) ON DELETE SET NULL,
  fecha_conversion TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_transacciones_departamento ON transacciones_ventas_arriendos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_agente ON transacciones_ventas_arriendos(agente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_ventas_arriendos(fecha_transaccion);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_ventas_arriendos(tipo_transaccion);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones_ventas_arriendos(estado);

CREATE INDEX IF NOT EXISTS idx_historico_departamento ON historico_estados_departamentos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_fecha ON historico_estados_departamentos(fecha_cambio);

CREATE INDEX IF NOT EXISTS idx_comisiones_transaccion ON comisiones_agentes(transaccion_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_agente ON comisiones_agentes(agente_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_estado ON comisiones_agentes(estado_pago);

CREATE INDEX IF NOT EXISTS idx_leads_departamento ON leads_prospectos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_leads_agente ON leads_prospectos(agente_id);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads_prospectos(estado);
CREATE INDEX IF NOT EXISTS idx_leads_fecha ON leads_prospectos(fecha_registro);

-- Trigger para calcular automáticamente la comisión en transacciones
CREATE OR REPLACE FUNCTION calcular_comision_transaccion()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular comisión automáticamente
  NEW.comision_valor = (NEW.valor_transaccion * NEW.comision_porcentaje / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_comision
  BEFORE INSERT OR UPDATE ON transacciones_ventas_arriendos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_comision_transaccion();

-- Trigger para insertar registro en comisiones_agentes automáticamente
CREATE OR REPLACE FUNCTION crear_registro_comision()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agente_id IS NOT NULL AND NEW.estado = 'completada' THEN
    INSERT INTO comisiones_agentes (
      transaccion_id, 
      agente_id, 
      valor_comision, 
      porcentaje_aplicado
    ) VALUES (
      NEW.id, 
      NEW.agente_id, 
      NEW.comision_valor, 
      NEW.comision_porcentaje
    ) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_crear_comision
  AFTER INSERT OR UPDATE ON transacciones_ventas_arriendos
  FOR EACH ROW
  EXECUTE FUNCTION crear_registro_comision();

-- Trigger para registrar cambios de estado en departamentos
CREATE OR REPLACE FUNCTION registrar_cambio_estado_departamento()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO historico_estados_departamentos (
      departamento_id,
      estado_anterior,
      estado_nuevo,
      motivo_cambio
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      'Cambio automático por transacción'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para cuando se actualiza el estado de un departamento
-- (Este trigger se puede aplicar más adelante si se modifica la tabla departamentos) 