# 🏦 Configuración de Stripe Connect Express para Zentry WEB

## 📋 Resumen
Este sistema permite que cada administrador de residencial conecte su propia cuenta bancaria mediante Stripe Connect Express, sin que tengas que gestionar manualmente datos bancarios.

## ⚙️ Configuración Inicial

### 1. Configurar Stripe en Firebase Functions

```bash
# Navegar a la carpeta de functions
cd functions

# Configurar las claves de Stripe en Firebase Functions
firebase functions:config:set stripe.secret_key="sk_test_tu_clave_secreta_de_stripe"
firebase functions:config:set stripe.webhook_secret="whsec_tu_secreto_del_webhook"
firebase functions:config:set app.base_url="https://tu-dominio.com"
```

### 2. Desplegar las Firebase Functions

```bash
# Construir las funciones
npm run build

# Desplegar las funciones
firebase deploy --only functions
```

### 3. Configurar Webhook en Stripe Dashboard

1. Ve a tu [Dashboard de Stripe](https://dashboard.stripe.com/webhooks)
2. Crea un nuevo endpoint webhook
3. URL del endpoint: `https://tu-region-tu-proyecto.cloudfunctions.net/stripeWebhookHandler`
4. Eventos a escuchar:
   - `account.updated`
5. Copia el secreto del webhook y configúralo:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_tu_secreto_copiado"
   ```

## 🚀 Funciones Implementadas

### 1. `crearCuentaStripeResidencial`
- **Método**: POST
- **URL**: `https://tu-region-tu-proyecto.cloudfunctions.net/crearCuentaStripeResidencial`
- **Autenticación**: Bearer token (Firebase Auth)
- **Body**:
  ```json
  {
    "residencialId": "abc123",
    "adminEmail": "admin@residencial.com"
  }
  ```
- **Respuesta**:
  ```json
  {
    "message": "Stripe account created successfully.",
    "onboardingUrl": "https://connect.stripe.com/setup/...",
    "stripeAccountId": "acct_..."
  }
  ```

### 2. `stripeWebhookHandler`
- **Método**: POST
- **URL**: `https://tu-region-tu-proyecto.cloudfunctions.net/stripeWebhookHandler`
- **Función**: Escucha eventos de Stripe y actualiza el estado en Firestore

### 3. `obtenerEstadoCuentaStripe`
- **Método**: GET
- **URL**: `https://tu-region-tu-proyecto.cloudfunctions.net/obtenerEstadoCuentaStripe?residencialId=abc123`
- **Autenticación**: Bearer token (Firebase Auth)
- **Respuesta**:
  ```json
  {
    "hasStripeAccount": true,
    "stripeStatus": "verificado",
    "onboardingCompleted": true,
    "accountDetails": {
      "charges_enabled": true,
      "payouts_enabled": true,
      "details_submitted": true
    }
  }
  ```

## 📊 Campos en Firestore

### Colección `residenciales`
Cada documento de residencial tendrá estos campos adicionales:

```javascript
{
  // ... campos existentes ...
  "stripeAccountId": "acct_1234567890",
  "stripeStatus": "pendiente" | "verificado" | "no_configurado",
  "stripeCreatedAt": Timestamp,
  "onboardingCompletedAt": Timestamp,
  "lastModified": Timestamp
}
```

## 🎯 Componentes de UI Implementados

### 1. `StripeConnectCard` (Dashboard Principal)
- Tarjeta prominente para administradores de residencial
- Muestra estado actual de la cuenta bancaria
- Botón para iniciar/completar onboarding
- Detalles de capacidades de la cuenta

### 2. `StripeConnectAlert` (Página de Pagos)
- Alerta discreta en la sección de pagos
- Solo se muestra si la cuenta no está verificada
- Botón rápido para configurar/completar

### 3. `useStripeConnect` Hook
- Hook personalizado para manejar estado de Stripe Connect
- Funciones para obtener estado y iniciar onboarding
- Manejo de errores y estados de carga

## 🔄 Flujo de Usuario

### Para Administradores de Residencial:

1. **Dashboard Principal**: Ve tarjeta "Cuenta Bancaria No Activada"
2. **Clic en "Activar cuenta bancaria"**: Se crea cuenta Stripe Express
3. **Redirección a Stripe**: Completa verificación de identidad y datos bancarios
4. **Webhook automático**: Actualiza estado en Firestore cuando se completa
5. **Dashboard actualizado**: Muestra "Cuenta Bancaria Activada" con beneficios

### Estados de la Cuenta:
- **`no_configurado`**: Sin cuenta de Stripe
- **`pendiente`**: Cuenta creada, onboarding incompleto
- **`verificado`**: Cuenta completamente verificada y activa

## 🛡️ Seguridad

- ✅ Autenticación requerida para todas las funciones
- ✅ Validación de firmas de webhook de Stripe
- ✅ Verificación de permisos de administrador
- ✅ Logs detallados para auditoría
- ✅ Manejo seguro de errores

## 🌟 Beneficios

### Para Administradores:
- ✅ Configuración autónoma sin intervención manual
- ✅ Recepción directa de pagos en cuenta bancaria
- ✅ Transferencias automáticas según configuración
- ✅ Cumplimiento automático con regulaciones fiscales
- ✅ Reportes detallados de ingresos

### Para Desarrolladores:
- ✅ Sin manejo manual de datos bancarios sensibles
- ✅ Cumplimiento automático con PCI DSS
- ✅ Escalabilidad automática
- ✅ Integración transparente con sistema existente

## 🚨 Configuración de Producción

### Variables de Entorno Requeridas:
```bash
# Firebase Functions Config
firebase functions:config:set stripe.secret_key="sk_live_tu_clave_de_produccion"
firebase functions:config:set stripe.webhook_secret="whsec_tu_secreto_de_produccion"
firebase functions:config:set app.base_url="https://zentry.mx"
```

### URLs de Producción:
- **Webhook**: `https://tu-region-tu-proyecto.cloudfunctions.net/stripeWebhookHandler`
- **Return URL**: `https://zentry.mx/dashboard?stripe_success=true`
- **Refresh URL**: `https://zentry.mx/dashboard?stripe_refresh=true`

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica que las Firebase Functions estén desplegadas
2. Confirma que el webhook esté configurado en Stripe
3. Revisa los logs de Firebase Functions
4. Verifica que las variables de configuración estén establecidas

```bash
# Ver configuración actual
firebase functions:config:get

# Ver logs de funciones
firebase functions:log
``` 