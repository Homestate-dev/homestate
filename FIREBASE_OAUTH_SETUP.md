# Configuración de Firebase OAuth para Heroku

## Problema
```
Info: The current domain is not authorized for OAuth operations. This will prevent signInWithPopup, signInWithRedirect, linkWithPopup and linkWithRedirect from working. Add your domain (homestate-17ca5a8016cd.herokuapp.com) to the OAuth redirect domains list in the Firebase console -> Authentication -> Settings -> Authorized domains tab.
```

## Solución

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto "homestate"

### Paso 2: Configurar Dominios Autorizados
1. En el menú lateral, ve a **Authentication**
2. Haz clic en la pestaña **Settings** (Configuración)
3. Desplázate hacia abajo hasta encontrar **Authorized domains** (Dominios autorizados)

### Paso 3: Agregar el Dominio de Heroku
1. Haz clic en **Add domain** (Agregar dominio)
2. Agrega: `homestate-17ca5a8016cd.herokuapp.com`
3. Haz clic en **Add** (Agregar)

### Paso 4: Verificar Configuración
Los dominios autorizados deberían incluir:
- `localhost` (para desarrollo)
- `homestate-17ca5a8016cd.herokuapp.com` (para producción)
- Cualquier otro dominio personalizado que uses

### Paso 5: Verificar Variables de Entorno
Asegúrate de que las variables de entorno de Firebase estén correctamente configuradas en Heroku:

```bash
# En Heroku Dashboard > Settings > Config Vars
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Notas Importantes
- Los cambios en Firebase pueden tardar unos minutos en propagarse
- Si el problema persiste, reinicia la aplicación en Heroku
- Verifica que no hay caracteres especiales o espacios en el dominio

### Debugging Adicional
Si el error persiste:
1. Verifica que el dominio esté exactamente como aparece en la URL
2. Revisa la configuración de Firebase en `lib/firebase.ts`
3. Confirma que las variables de entorno están bien definidas

## Resultado
Una vez configurado correctamente, las operaciones OAuth (login con Google, Facebook, etc.) funcionarán sin errores en producción. 