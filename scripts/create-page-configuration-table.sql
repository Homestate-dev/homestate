-- Script para crear la tabla de configuración de página
-- Esta tabla almacenará la configuración global de la aplicación

CREATE TABLE IF NOT EXISTS page_configuration (
    id SERIAL PRIMARY KEY,
    whatsapp_number VARCHAR(20) NOT NULL,
    tally_link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto (solo si no existe)
INSERT INTO page_configuration (whatsapp_number, tally_link) 
VALUES ('+56 9 1234 5678', 'https://tally.so/r/example')
ON CONFLICT DO NOTHING;

-- Crear función para limpiar registros antiguos (mantener solo el más reciente)
CREATE OR REPLACE FUNCTION cleanup_old_page_configurations()
RETURNS TRIGGER AS $$
BEGIN
    -- Eliminar registros antiguos, mantener solo el más reciente
    DELETE FROM page_configuration 
    WHERE id NOT IN (
        SELECT id FROM page_configuration 
        ORDER BY updated_at DESC 
        LIMIT 1
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para limpiar automáticamente registros antiguos
CREATE TRIGGER cleanup_page_configuration_after_insert
    AFTER INSERT ON page_configuration
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_old_page_configurations();

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_page_config_created_at ON page_configuration(created_at);

-- Comentarios sobre la tabla
COMMENT ON TABLE page_configuration IS 'Tabla para almacenar la configuración global de la página web';
COMMENT ON COLUMN page_configuration.whatsapp_number IS 'Número de WhatsApp para contacto';
COMMENT ON COLUMN page_configuration.tally_link IS 'Enlace del formulario Tally para capturar leads';
COMMENT ON COLUMN page_configuration.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN page_configuration.updated_at IS 'Fecha de última actualización';

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_page_configuration_updated_at 
    BEFORE UPDATE ON page_configuration 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
