# 🚨 SOLUCIÓN URGENTE: Error "Email ya registrado"

## 🎯 **PROBLEMA IDENTIFICADO:**
Firebase Authentication tiene **sesiones persistentes** que interfieren con el registro.

## 🔥 **SOLUCIÓN INMEDIATA:**

### **Opción 1: Herramienta automática (RECOMENDADO)**
1. **Accede directamente a:** `http://localhost:3000/clear-sessions`
2. **La herramienta se ejecutará automáticamente**
3. **Cuando termine, haz clic en "Continuar al Registro"**

### **Opción 2: Herramienta HTML (Si la opción 1 falla)**
1. **Abre:** `Zentry WEB/clear_firebase_sessions.html` en tu navegador
2. **Haz clic en "🗑️ LIMPIAR TODO"**
3. **Sigue las instrucciones que aparecen**

### **Opción 3: Manual (Último recurso)**
1. **Presiona F12** (Developer Tools)
2. **Ve a la pestaña "Application"**
3. **En el panel izquierdo:**
   - **Local Storage** → `http://localhost:3000` → Elimina TODO
   - **Session Storage** → `http://localhost:3000` → Elimina TODO
   - **IndexedDB** → Elimina `firebase-heartbeat-database` y `firebaseLocalStorageDb`
   - **Cookies** → Elimina todas las cookies
4. **Cierra TODAS las pestañas del navegador**
5. **Reinicia el navegador completamente**

## ⚡ **DESPUÉS DE LA LIMPIEZA:**

### **1. Reinicia el servidor:**
```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### **2. Usa ventana de incógnito:**
- **Chrome/Edge:** `Ctrl+Shift+N` (Windows) / `Cmd+Shift+N` (Mac)
- **Firefox:** `Ctrl+Shift+P` (Windows) / `Cmd+Shift+P` (Mac)

### **3. Prueba el registro:**
- Ve a `http://localhost:3000/register`
- Intenta registrar: `r.elizabethgu61@gmail.com`
- **¡Debería funcionar sin errores!**

## 🎉 **VERIFICACIÓN:**
- ✅ No aparece "El correo electrónico ya está registrado"
- ✅ El registro se completa exitosamente
- ✅ Se crea el usuario en Firebase Auth y Firestore

## 📞 **Si el problema persiste:**
1. Verifica que seguiste TODOS los pasos de limpieza
2. Reinicia el navegador por completo
3. Usa modo incógnito/privado
4. Contacta al administrador si el problema continúa

---

**⏰ PRIORIDAD ALTA:** Este problema bloquea el registro de usuarios. Resuelve inmediatamente siguiendo la **Opción 1**. 