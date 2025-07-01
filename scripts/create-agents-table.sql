-- Crear tabla de agentes inmobiliarios
CREATE TABLE IF NOT EXISTS agentes_inmobiliarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50),
  cedula VARCHAR(50) UNIQUE,
  especialidad VARCHAR(100), -- 'ventas', 'arriendos', 'ambas'
  comision_ventas DECIMAL(5,2) DEFAULT 3.00, -- Porcentaje de comisión en ventas
  comision_arriendos DECIMAL(5,2) DEFAULT 10.00, -- Porcentaje de comisión en arriendos
  activo BOOLEAN DEFAULT true,
  foto_perfil TEXT, -- URL de la foto
  biografia TEXT,
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  creado_por VARCHAR(255), -- Firebase UID del admin que lo creó
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas a la tabla departamentos para tracking de agentes
ALTER TABLE departamentos 
ADD COLUMN IF NOT EXISTS agente_venta_id INTEGER REFERENCES agentes_inmobiliarios(id),
ADD COLUMN IF NOT EXISTS agente_arriendo_id INTEGER REFERENCES agentes_inmobiliarios(id),
ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_arriendo TIMESTAMP,
ADD COLUMN IF NOT EXISTS precio_venta_final DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS precio_arriendo_final DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS notas_transaccion TEXT;

-- Crear tabla de transacciones para historial detallado
CREATE TABLE IF NOT EXISTS transacciones_departamentos (
  id SERIAL PRIMARY KEY,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  agente_id INTEGER NOT NULL REFERENCES agentes_inmobiliarios(id),
  tipo_transaccion VARCHAR(20) NOT NULL CHECK (tipo_transaccion IN ('venta', 'arriendo')),
  precio_final DECIMAL(12,2) NOT NULL,
  precio_original DECIMAL(12,2),
  comision_agente DECIMAL(12,2),
  fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cliente_nombre VARCHAR(255),
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(50),
  notas TEXT,
  estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
  creado_por VARCHAR(255), -- Firebase UID del admin
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_agentes_email ON agentes_inmobiliarios(email);
CREATE INDEX IF NOT EXISTS idx_agentes_activo ON agentes_inmobiliarios(activo);
CREATE INDEX IF NOT EXISTS idx_transacciones_agente ON transacciones_departamentos(agente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_departamento ON transacciones_departamentos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_departamentos(tipo_transaccion);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_departamentos(fecha_transaccion);

-- Datos de ejemplo para agentes inmobiliarios
INSERT INTO agentes_inmobiliarios (nombre, email, telefono, cedula, especialidad, comision_ventas, comision_arriendos, biografia, creado_por) VALUES
('María González', 'maria.gonzalez@homestate.com', '+593987654321', '1234567890', 'ambas', 3.00, 10.00, 'Especialista en propiedades residenciales con 5 años de experiencia.', 'system'),
('Carlos Rodríguez', 'carlos.rodriguez@homestate.com', '+593987654322', '1234567891', 'ventas', 2.50, 8.00, 'Experto en ventas de departamentos de lujo y propiedades comerciales.', 'system'),
('Ana Patricia Morales', 'ana.morales@homestate.com', '+593987654323', '1234567892', 'arriendos', 4.00, 12.00, 'Especializada en arriendos corporativos y gestión de propiedades.', 'system'); 