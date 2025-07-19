-- Script para agregar nuevos campos a la tabla departamentos
-- Ejecutar en Heroku PostgreSQL

-- Agregar campo para cantidad de baños
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS cantidad_banos INTEGER DEFAULT 1;

-- Agregar campos para áreas
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS area_cubierta DECIMAL(10,2);
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS area_descubierta DECIMAL(10,2);

-- Agregar campo para bodega
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS tiene_bodega BOOLEAN DEFAULT false;

-- Agregar campo para videos de YouTube
ALTER TABLE departamentos ADD COLUMN IF NOT EXISTS videos_url JSONB DEFAULT '[]'::jsonb;

-- Actualizar la columna area existente para que sea area_total
-- Primero renombramos la columna actual
ALTER TABLE departamentos RENAME COLUMN area TO area_total;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'departamentos' 
AND column_name IN ('cantidad_banos', 'area_cubierta', 'area_descubierta', 'area_total', 'tiene_bodega', 'videos_url')
ORDER BY ordinal_position; 