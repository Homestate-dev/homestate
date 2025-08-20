-- Script SQL para limpiar completamente las tablas de administradores y agentes
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los usuarios excepto homestate.dev@gmail.com
-- 
-- OBJETIVO:
-- 1. Mantener SOLO el administrador principal (homestate.dev@gmail.com)
-- 2. Eliminar TODOS los demás administradores
-- 3. Eliminar TODOS los agentes inmobiliarios
-- 4. Limpiar referencias y secuencias

-- Fecha: 2025-01-09
-- Descripción: Limpieza completa del sistema de usuarios

-- =====================================================
-- PASO 1: VERIFICAR QUE EXISTE EL ADMINISTRADOR PRINCIPAL
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM administradores WHERE email = 'homestate.dev@gmail.com') THEN
        RAISE EXCEPTION 'ERROR: No se encontró el administrador principal (homestate.dev@gmail.com). No se puede proceder sin él.';
    END IF;
END $$;

-- =====================================================
-- PASO 2: LIMPIAR TABLA DE AGENTES INMOBILIARIOS
-- =====================================================

-- Eliminar TODOS los agentes inmobiliarios
DELETE FROM agentes_inmobiliarios;

-- Resetear secuencia de agentes
ALTER SEQUENCE IF EXISTS agentes_inmobiliarios_id_seq RESTART WITH 1;

-- =====================================================
-- PASO 3: LIMPIAR TABLA DE ADMINISTRADORES
-- =====================================================

-- Eliminar todos los administradores EXCEPTO el principal
DELETE FROM administradores 
WHERE email != 'homestate.dev@gmail.com';

-- Resetear secuencia de administradores
ALTER SEQUENCE IF EXISTS administradores_id_seq RESTART WITH 1;

-- =====================================================
-- PASO 4: VERIFICAR ESTADO FINAL
-- =====================================================

-- Mostrar estado final de administradores
SELECT 
    'ESTADO FINAL - ADMINISTRADORES' as seccion,
    COUNT(*) as total_administradores
FROM administradores;

-- Mostrar estado final de agentes
SELECT 
    'ESTADO FINAL - AGENTES' as seccion,
    COUNT(*) as total_agentes
FROM agentes_inmobiliarios;

-- Mostrar detalles del administrador principal
SELECT 
    'ADMINISTRADOR PRINCIPAL' as seccion,
    id,
    nombre,
    email,
    activo,
    fecha_creacion
FROM administradores 
WHERE email = 'homestate.dev@gmail.com';

-- =====================================================
-- PASO 5: VERIFICAR SECUENCIAS
-- =====================================================

-- Mostrar estado de las secuencias
SELECT 
    'SECUENCIAS' as seccion,
    sequence_name,
    last_value
FROM information_schema.sequences 
WHERE sequence_name IN (
    'administradores_id_seq',
    'agentes_inmobiliarios_id_seq'
);

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT 'LIMPIEZA COMPLETADA: Solo queda el administrador principal (homestate.dev@gmail.com)' as resultado;
