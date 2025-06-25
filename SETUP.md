# 🚀 HomEstate - Setup de Administradores

## 📋 Pasos para configurar el sistema

### 1. 🗄️ **Crear Tablas en PostgreSQL**

Ejecuta una de estas opciones para crear las tablas necesarias:

#### Opción A: Usar la API (Recomendado)
1. Inicia el servidor: `npm run dev`
2. Abre tu navegador y ve a: `http://localhost:3000`
3. Abre las herramientas de desarrollador (F12)
4. En la consola, ejecuta:
```javascript
fetch('/api/setup-db', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data))
```

#### Opción B: Ejecutar SQL directamente
Conéctate a tu base de datos PostgreSQL y ejecuta el archivo `scripts/create-tables.sql`

### 2. 🔥 **Crear Administrador Principal en Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `homestate-web`
3. Ve a **Authentication** > **Users**
4. Haz clic en **Add user**
5. Crea el usuario principal:
   - **Email**: `homestate.dev@gmail.com`
   - **Password**: [Tu contraseña deseada]

### 3. ✅ **Verificar Setup**

1. Accede a `http://localhost:3000`
2. Inicia sesión con `homestate.dev@gmail.com`
3. Ve a la pestaña **Administradores**
4. Debería mostrar la lista vacía (sin administradores hardcodeados)
5. Crea tu primer administrador desde la interfaz

### 4. 🎯 **Funcionalidades Implementadas**

#### ✅ **Sistema de Autenticación**
- Login con Firebase Authentication
- Persistencia de sesión
- Logout seguro

#### ✅ **Gestión de Administradores**
- Crear administradores (se guardan en PostgreSQL + Firebase)
- Editar información de administradores
- Solo `homestate.dev@gmail.com` puede activar/desactivar/eliminar
- Historial de acciones por administrador

#### ✅ **Base de Datos**
- Indicador "Base de Datos ON" en el header con titileo verde
- Almacenamiento en PostgreSQL de administradores y acciones
- Sincronización con Firebase Authentication

#### ✅ **Permisos**
- Usuario principal: `homestate.dev@gmail.com` (control total)
- Otros administradores: Solo edición de información básica

### 5. 🔧 **Estructura de Base de Datos**

#### Tabla `administradores`
```sql
- id (SERIAL PRIMARY KEY)
- firebase_uid (VARCHAR UNIQUE) -- UID de Firebase
- nombre (VARCHAR)
- email (VARCHAR UNIQUE)
- activo (BOOLEAN)
- fecha_creacion (TIMESTAMP)
- fecha_actualizacion (TIMESTAMP)
- creado_por (VARCHAR) -- UID de quien lo creó
```

#### Tabla `admin_acciones`
```sql
- id (SERIAL PRIMARY KEY)
- admin_firebase_uid (VARCHAR) -- Referencia al admin
- accion (TEXT) -- Descripción de la acción
- tipo (VARCHAR) -- 'creación', 'edición', 'eliminación', etc.
- metadata (JSONB) -- Información adicional
- fecha (TIMESTAMP)
```

### 6. 🚨 **Solución de Problemas**

#### Si no funciona la base de datos:
1. Verifica las credenciales en `lib/database.ts`
2. Asegúrate que PostgreSQL esté accesible
3. Revisa el indicador en el header

#### Si no funciona Firebase:
1. Verifica las credenciales en `lib/firebase.ts`
2. Asegúrate que Authentication esté habilitado en Firebase
3. Crea el usuario principal manualmente

#### Si no se muestran administradores:
1. Ejecuta el setup de BD primero
2. Verifica que las tablas se crearon
3. Revisa la consola del navegador por errores

### 7. 🎉 **¡Listo!**

Tu sistema ahora tiene:
- ✅ Firebase Authentication integrado
- ✅ Base de datos PostgreSQL funcionando
- ✅ Gestión completa de administradores
- ✅ Sistema de permisos implementado
- ✅ Indicador de BD en tiempo real
- ✅ Sin datos hardcodeados 