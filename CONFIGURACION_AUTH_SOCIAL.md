# Configuración de Autenticación Social - Zentry Web

## Estado Actual
❌ **Google OAuth**: Cliente OAuth eliminado o no configurado  
❌ **Apple Sign-In**: Operación no permitida en Firebase  
✅ **Email/Password**: Funcionando correctamente  

## Pasos para Configurar Autenticación Social

### 1. Configurar Google OAuth

#### En Firebase Console:
1. Ir a **Authentication** > **Sign-in method**
2. Habilitar **Google**
3. Configurar con estos datos:
   - **Web SDK configuration**: Automático
   - **Web client ID**: Se genera automáticamente
   - **Web client secret**: Se genera automáticamente

#### En Google Cloud Console:
1. Ir a **APIs & Services** > **Credentials**
2. Crear **OAuth 2.0 Client ID** para Web
3. Configurar:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/__/auth/handler` (desarrollo)
     - `https://tu-dominio.com/__/auth/handler` (producción)

### 2. Configurar Apple Sign-In

#### En Firebase Console:
1. Ir a **Authentication** > **Sign-in method**
2. Habilitar **Apple**
3. Configurar con estos datos:
   - **Services ID**: `com.gerardo.zentry.web`
   - **Apple Team ID**: (Obtener de Apple Developer)
   - **Key ID**: (Obtener de Apple Developer)
   - **Private Key**: (Obtener de Apple Developer)

#### En Apple Developer Console:
1. Crear **App ID** para la aplicación web
2. Habilitar **Sign In with Apple**
3. Crear **Services ID**:
   - **Identifier**: `com.gerardo.zentry.web`
   - **Return URLs**: 
     - `https://zentryapp-949f4.firebaseapp.com/__/auth/handler`
4. Crear **Key** para Sign In with Apple
5. Descargar el archivo `.p8` con la clave privada

### 3. Configurar Variables de Entorno

Agregar a `.env.local`:
```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu-client-id-aqui

# Apple Sign-In
NEXT_PUBLIC_APPLE_CLIENT_ID=com.gerardo.zentry.web
```

### 4. Actualizar Configuración de Firebase

En `firebase-config.ts`, verificar que esté configurado correctamente:
```typescript
// Configuración actual
const firebaseConfig = {
  apiKey: "AIzaSyAPKpz9Twt_n8Zgkk8mh4cFNuo4SipwG5c",
  authDomain: "zentryapp-949f4.firebaseapp.com",
  projectId: "zentryapp-949f4",
  // ... resto de configuración
};
```

### 5. Habilitar Autenticación Social en el Código

Una vez configurado en Firebase Console, actualizar `AuthMethodStep.tsx`:

```typescript
// Cambiar de:
const handleGoogleSignIn = async () => {
  toast({
    title: "Función no disponible",
    description: "La autenticación con Google está siendo configurada.",
    variant: "default"
  });
};

// A:
const handleGoogleSignIn = async () => {
  try {
    await loginWithGoogle();
    toast({
      title: "Autenticación exitosa",
      description: "Cuenta de Google vinculada correctamente",
      variant: "default"
    });
  } catch (error) {
    console.error('Error con Google Sign-In:', error);
    toast({
      title: "Error",
      description: "No se pudo autenticar con Google",
      variant: "destructive"
    });
  }
};
```

### 6. Actualizar UI

Cambiar las cards de Google y Apple de deshabilitadas a habilitadas:

```typescript
// Cambiar de:
<Card className="cursor-not-allowed transition-all opacity-50 bg-gray-100">

// A:
<Card 
  className={`cursor-pointer transition-all duration-200 ${
    method === 'google' 
      ? 'ring-2 ring-red-500 bg-red-50' 
      : 'hover:shadow-md'
  }`}
  onClick={() => handleMethodChange('google')}
>
```

## Errores Comunes y Soluciones

### Error: "OAuth client was deleted"
- **Causa**: El cliente OAuth de Google fue eliminado o no existe
- **Solución**: Crear nuevo cliente OAuth en Google Cloud Console

### Error: "Firebase: Error (auth/operation-not-allowed)"
- **Causa**: El proveedor no está habilitado en Firebase Console
- **Solución**: Habilitar el proveedor en Authentication > Sign-in method

### Error: "Invalid redirect URI"
- **Causa**: Las URIs de redirección no están configuradas correctamente
- **Solución**: Agregar las URIs correctas en la configuración OAuth

## Pruebas

### Desarrollo Local
1. Configurar `http://localhost:3000` como origen autorizado
2. Probar autenticación en `http://localhost:3000/register`

### Producción
1. Configurar dominio de producción como origen autorizado
2. Probar en el dominio real

## Notas Importantes

1. **Dominio Personalizado**: Si usas un dominio personalizado, actualizar todas las configuraciones
2. **HTTPS**: Apple Sign-In requiere HTTPS en producción
3. **Cookies**: Verificar configuración de cookies para autenticación
4. **CORS**: Asegurar que los orígenes estén correctamente configurados

## Estado de Replicación con App Móvil

La app móvil Flutter usa:
- **Google Sign-In**: ✅ Configurado y funcionando
- **Apple Sign-In**: ✅ Configurado y funcionando (iOS)
- **Bundle ID**: `com.gerardo.zentry`
- **Project ID**: `zentryapp-949f4`

La versión web debe usar:
- **Web Client ID**: Diferente al móvil
- **Services ID**: `com.gerardo.zentry.web` (diferente al móvil)
- **Same Project**: `zentryapp-949f4` (mismo proyecto)

## Checklist de Configuración

- [ ] Habilitar Google en Firebase Console
- [ ] Crear OAuth Client ID en Google Cloud Console
- [ ] Configurar JavaScript origins y redirect URIs
- [ ] Habilitar Apple Sign-In en Firebase Console
- [ ] Crear Services ID en Apple Developer Console
- [ ] Generar y configurar clave privada de Apple
- [ ] Actualizar variables de entorno
- [ ] Actualizar código para habilitar autenticación social
- [ ] Probar en desarrollo
- [ ] Probar en producción

---

**Última actualización**: Diciembre 2024  
**Estado**: Pendiente de configuración en Firebase Console 