# 🔥 Índices requeridos para Firestore - ACTUALIZADO

El dashboard necesita los siguientes índices compuestos para funcionar correctamente. 
Haz clic en cada enlace para crear el índice automáticamente:

## 📊 Índices del Dashboard (Basados en tu estructura real)

### ✅ **YA EXISTENTE** - `ingresos` 
**Campos**: `status` (ASC) + `timestamp` (DESC)
👍 **Este índice ya existe en tu Firebase** - No necesitas crear nada

### ✅ **YA EXISTENTE** - `eventos_residenciales`  
**Campos**: `residencialId` (ASC) + `dateTime` (ASC)
👍 **Este índice ya existe en tu Firebase** - No necesitas crear nada

### 🔴 **FALTA CREAR** - `alertas`
**Campos**: `status` (ASC) + `fechaAlerta` (DESC)
👆 **[CREAR ÍNDICE ALERTAS - HAZ CLIC AQUÍ](https://console.firebase.google.com/v1/r/project/zentryapp-949f4/firestore/indexes?create_composite=ClJwcm9qZWN0cy96ZW50cnlhcHAtOTQ5ZjQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FsZXJ0YXMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaDQoLZmVjaGFBbGVydGEQAhoMCghfX25hbWVfXxAC)**

### 🔴 **FALTA CREAR** - `eventos_residenciales` para hoy
**Campos**: `dateTime` (ASC) + `dateTime` (ASC) (rango para filtrar por día)
👆 **[CREAR ÍNDICE EVENTOS HOY - HAZ CLIC AQUÍ](https://console.firebase.google.com/v1/r/project/zentryapp-949f4/firestore/indexes?create_composite=ClZ3cm9qZWN0cy96ZW50cnlhcHAtOTQ5ZjQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2V2ZW50b3NfcmVzaWRlbmNpYWxlcy9pbmRleGVzL18QARoKCghkYXRlVGltZRABGgoKCGRhdGVUaW1lEAEaDAoIX19uYW1lX18QAg)**

## ⚡ Instrucciones

1. **SOLO necesitas crear los 2 índices marcados en rojo** ⬆️
2. **Haz clic en cada enlace rojo** - Te llevará directamente a la consola de Firebase
3. **Confirma la creación** - Firebase pre-configurará el índice automáticamente
4. **Espera 2-3 minutos** - Los índices pueden tardar en activarse
5. **Recarga el dashboard** - Una vez que estén listos, el dashboard funcionará sin errores

## 🔍 **Análisis de tu estructura actual:**

**Colecciones encontradas:**
- ✅ `ingresos` - Para visitantes activos (campo `timestamp`)
- ✅ `alertas` - Para alertas de pánico (campo `fechaAlerta`) 
- ✅ `eventos_residenciales` - Para eventos (campo `dateTime`)
- ✅ `usuarios` - Para usuarios del sistema
- ✅ `residenciales` - Para residenciales
- ❌ `security_rounds` - NO existe (rondas deshabilitadas en dashboard)

**Campos importantes detectados:**
- `ingresos.status` - Para filtrar visitantes activos
- `ingresos.timestamp` - Para ordenar por tiempo de entrada
- `alertas.status` - Para filtrar alertas activas  
- `alertas.fechaAlerta` - Para ordenar alertas por fecha
- `eventos_residenciales.dateTime` - Para filtrar eventos de hoy

## ✅ Verificación

Una vez creados los 2 índices faltantes, deberías ver en el dashboard:
- ✅ Alertas de pánico sin errores
- ✅ Visitantes activos cargando correctamente  
- ✅ Eventos de hoy funcionando
- ✅ Estadísticas en tiempo real
- ⚠️ Rondas de seguridad = 0 (normal, no tienes esa colección)

---
**Nota**: Tu estructura de Firebase está bien organizada. Solo faltan 2 índices para queries compuestas que requiere el dashboard. 