# 🔧 Solución para "Email ya registrado"

## Problema
El error "El correo electrónico ya está registrado" ocurre cuando Firebase Authentication conserva el usuario aunque se haya eliminado de Firestore.

## Soluciones

### 1. 🌐 Herramienta Web (Recomendado)
```bash
# Accede a la herramienta de limpieza
http://localhost:3000/admin/cleanup-user

# Pasos:
1. Ingresa el email problemático
2. Haz clic en "Diagnosticar"
3. Si encuentra datos, haz clic en "Limpiar Usuario Completamente"
4. Confirma la eliminación
```

### 2. 📱 API directa con curl
```bash
# Diagnosticar
curl -X POST http://localhost:3000/api/admin/cleanup-user \
  -H "Content-Type: application/json" \
  -d '{"email": "r.elizabethgu61@gmail.com", "action": "diagnose"}'

# Limpiar (solo si el diagnóstico encuentra datos)
curl -X POST http://localhost:3000/api/admin/cleanup-user \
  -H "Content-Type: application/json" \
  -d '{"email": "r.elizabethgu61@gmail.com", "action": "cleanup"}'
```

### 3. 🔥 Firebase Console (Manual)
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. **Authentication > Users** → Elimina el usuario
4. **Firestore Database** → Elimina documentos relacionados
5. **Storage** → Elimina archivos relacionados

## Después de la limpieza

### 🧹 Limpiar caché del navegador:
```bash
# Chrome/Edge (Windows/Linux)
Ctrl + Shift + R

# Chrome/Edge (Mac)
Cmd + Shift + R

# Firefox
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 🕵️ Verificar en modo incógnito:
1. Abre ventana de incógnito/privada
2. Ve a la página de registro
3. Intenta registrarte nuevamente
4. Debería funcionar sin problemas

### 🔍 Verificar resolución:
1. El usuario debe poder registrarse sin errores
2. No debe aparecer el mensaje "El correo electrónico ya está registrado"
3. El proceso de registro debe completarse exitosamente

## Prevención futura

1. **Eliminar usuarios correctamente**: Usar la herramienta de limpieza
2. **Verificar en todas las fuentes**: Auth, Firestore, Storage
3. **Limpiar caché regularmente**: Especialmente durante desarrollo
4. **Usar modo incógnito**: Para pruebas sin caché

## Contacto
Si el problema persiste después de seguir estos pasos, contacta al administrador del sistema. 