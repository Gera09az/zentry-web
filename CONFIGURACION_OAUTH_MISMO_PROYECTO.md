# Configuración OAuth - Reutilizar el Mismo Proyecto

## 🎯 **Objetivo**
Usar el **mismo proyecto OAuth** de la app móvil para la versión web, manteniendo consistencia y centralización.

## 📋 **Información Actual del Proyecto**

### **Firebase Project:**
- **Project ID**: `zentryapp-949f4`
- **Messaging Sender ID**: `905646843025`
- **Auth Domain**: `zentryapp-949f4.firebaseapp.com`

### **Client IDs Existentes:**
- **iOS**: `905646843025-jtsq80lrbme636uqj6urqecn1ngb85m7.apps.googleusercontent.com`
- **Android**: `905646843025-u0cf2t2u06thlq8iossbfcj0ki6pv8qc.apps.googleusercontent.com`

## 🔧 **Pasos para Agregar Web al Mismo Proyecto**

### 1. **Ir a Google Cloud Console**
```
https://console.cloud.google.com/apis/credentials?project=zentryapp-949f4
```

### 2. **Crear Web Client ID**
1. Clic en **"+ CREATE CREDENTIALS"**
2. Seleccionar **"OAuth 2.0 Client ID"**
3. Configurar:
   - **Application type**: Web application
   - **Name**: `Zentry Web Client`

### 3. **Configurar JavaScript Origins**
```
Authorized JavaScript origins:
- http://localhost:3000          (desarrollo)
- http://localhost:3001          (desarrollo alternativo)
- https://zentryapp-949f4.web.app    (Firebase Hosting)
- https://zentryapp-949f4.firebaseapp.com    (Firebase Hosting)
- https://tu-dominio-personalizado.com    (si tienes uno)
```

### 4. **Configurar Redirect URIs**
```
Authorized redirect URIs:
- http://localhost:3000/__/auth/handler
- https://zentryapp-949f4.web.app/__/auth/handler
- https://zentryapp-949f4.firebaseapp.com/__/auth/handler
- https://tu-dominio-personalizado.com/__/auth/handler
```

### 5. **Obtener el Web Client ID**
Después de crear, obtendrás algo como:
```
905646843025-XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

## 🔥 **Configurar en Firebase Console**

### 1. **Ir a Firebase Console**
```
https://console.firebase.google.com/project/zentryapp-949f4/authentication/providers
```

### 2. **Habilitar Google Sign-In**
1. Clic en **Google**
2. Habilitar el toggle
3. **Web SDK configuration**:
   - **Web client ID**: Pegar el Web Client ID obtenido
   - **Web client secret**: Se auto-completa

### 3. **Verificar Configuración**
Debe mostrar:
- ✅ **Android**: Configurado
- ✅ **iOS**: Configurado  
- ✅ **Web**: Recién configurado

## 🍎 **Apple Sign-In (Reutilizar Configuración)**

### **Configuración Actual:**
La app móvil ya tiene configurado:
- **Bundle ID**: `com.gerardo.zentry`
- **Team ID**: (Ya configurado)
- **Key ID**: (Ya configurado)

### **Agregar Web:**
1. En **Apple Developer Console**:
   ```
   https://developer.apple.com/account/resources/identifiers/list/serviceId
   ```

2. **Editar el Services ID existente** o crear uno nuevo:
   - **Identifier**: `com.gerardo.zentry.web`
   - **Description**: `Zentry Web Sign In`

3. **Configurar Return URLs**:
   ```
   Return URLs:
   - https://zentryapp-949f4.firebaseapp.com/__/auth/handler
   ```

4. **En Firebase Console**:
   - Usar la **misma configuración** que la app móvil
   - **Services ID**: `com.gerardo.zentry.web`

## ⚙️ **Actualizar Configuración Web**

### 1. **Actualizar Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=905646843025-XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
NEXT_PUBLIC_APPLE_CLIENT_ID=com.gerardo.zentry.web
```

### 2. **Verificar Firebase Config**
El `firebase-config.ts` ya está correcto:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAPKpz9Twt_n8Zgkk8mh4cFNuo4SipwG5c",
  authDomain: "zentryapp-949f4.firebaseapp.com",
  projectId: "zentryapp-949f4",  // ✅ Mismo proyecto
  storageBucket: "zentryapp-949f4.appspot.com",
  messagingSenderId: "905646843025",  // ✅ Mismo sender
  appId: "1:905646843025:web:9b23d5c6d6d6c78f93cb30",
  measurementId: "G-DK611Z8182"
};
```

## 🔄 **Habilitar en el Código**

Una vez configurado, actualizar `AuthMethodStep.tsx`:

```typescript
// Cambiar las cards de deshabilitadas a habilitadas
<Card 
  className={`cursor-pointer transition-all duration-200 ${
    method === 'google' 
      ? 'ring-2 ring-red-500 bg-red-50' 
      : 'hover:shadow-md'
  }`}
  onClick={() => handleMethodChange('google')}
>
  <CardContent className="p-4 text-center">
    <Chrome className="w-8 h-8 mx-auto mb-2 text-red-600" />
    <h4 className="font-medium text-gray-900">Google</h4>
    <p className="text-sm text-gray-600">
      Registrarse con Google
    </p>
  </CardContent>
</Card>
```

Y restaurar las funciones:
```typescript
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

## ✅ **Ventajas de Usar el Mismo OAuth**

### **Consistencia:**
- **Mismo proyecto** Firebase
- **Misma base de usuarios**
- **Mismas configuraciones** de seguridad

### **Gestión Centralizada:**
- **Un solo panel** de administración
- **Métricas unificadas**
- **Configuración centralizada**

### **Experiencia de Usuario:**
- **Misma cuenta** en todas las plataformas
- **Sincronización automática**
- **Transición fluida** entre app y web

## 🧪 **Pruebas**

### **Desarrollo:**
1. Configurar `localhost:3000` como origen autorizado
2. Probar autenticación en desarrollo
3. Verificar que los datos se sincronizan

### **Producción:**
1. Configurar dominio de producción
2. Probar autenticación en producción
3. Verificar métricas en Firebase Console

## 📊 **Estructura Final del Proyecto**

```
zentryapp-949f4 (Firebase Project)
├── 📱 iOS App (com.gerardo.zentry)
├── 🤖 Android App (com.gerardo.zentry)
└── 🌐 Web App (zentryapp-949f4.web.app)
    ├── Google OAuth: ✅ Mismo proyecto
    ├── Apple Sign-In: ✅ Mismo proyecto  
    ├── Firebase Auth: ✅ Misma base de usuarios
    └── Firestore: ✅ Misma base de datos
```

## 🎯 **Checklist de Implementación**

- [ ] Crear Web Client ID en Google Cloud Console
- [ ] Configurar JavaScript origins y redirect URIs
- [ ] Habilitar Google en Firebase Console con Web Client ID
- [ ] Configurar Apple Services ID para web
- [ ] Actualizar variables de entorno
- [ ] Habilitar autenticación social en el código
- [ ] Probar en desarrollo
- [ ] Configurar dominio de producción
- [ ] Probar en producción

---

**Resultado**: Una sola aplicación Firebase con **tres plataformas** (iOS, Android, Web) compartiendo la **misma autenticación y base de datos**. 