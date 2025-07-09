# 📧 Configuración del Sistema de Envío de Emails

## Estado Actual

✅ **EmailService implementado** - Servicio completo con plantillas HTML responsivas  
✅ **API `/api/send-email` creada** - Endpoint para envío real de emails  
✅ **Múltiples proveedores soportados** - Resend, SendGrid, SMTP  
⚠️ **Configuración pendiente** - Necesitas configurar las variables de entorno  

## Proveedores Soportados

### 1. Resend (Recomendado)
**Ventajas:**
- Diseñado específicamente para Next.js
- Fácil configuración
- Excelente deliverability
- Precios competitivos

**Configuración:**
```bash
# En tu archivo .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@tudominio.com
```

**Pasos:**
1. Registrarse en [resend.com](https://resend.com)
2. Verificar tu dominio
3. Obtener API key
4. Configurar variables de entorno

### 2. SendGrid
**Ventajas:**
- Muy confiable
- Excelente para volúmenes altos
- Análiticas detalladas

**Configuración:**
```bash
# En tu archivo .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@tudominio.com
```

### 3. SMTP (Gmail, Outlook, etc.)
**Ventajas:**
- Funciona con cualquier proveedor SMTP
- Ideal para testing

**Configuración:**
```bash
# En tu archivo .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
FROM_EMAIL=tu_email@gmail.com
```

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Elige UNA opción)

# Opción 1: Resend (Recomendado)
# RESEND_API_KEY=tu_resend_api_key
# FROM_EMAIL=noreply@tudominio.com

# Opción 2: SendGrid
# SENDGRID_API_KEY=tu_sendgrid_api_key
# FROM_EMAIL=noreply@tudominio.com

# Opción 3: Gmail SMTP (Mismas credenciales que la app móvil)
GMAIL_USER=zentry.app.mx@gmail.com
GMAIL_APP_PASSWORD=kzhx ppym ooel izjz
FROM_EMAIL=zentry.app.mx@gmail.com
```

## Tipos de Emails Implementados

### 1. Email de Confirmación de Registro
- **Cuándo se envía:** Inmediatamente después del registro
- **Contenido:** Bienvenida + pasos siguientes
- **Plantilla:** HTML responsiva con branding de Zentry

### 2. Email de Aprobación de Cuenta
- **Cuándo se envía:** Cuando un admin aprueba la cuenta
- **Contenido:** Confirmación de aprobación + enlace de login
- **Plantilla:** HTML responsiva con botón de acción

## Características Implementadas

✅ **Plantillas HTML responsivas** - Se ven bien en móvil y desktop  
✅ **Fallback a texto plano** - Para clientes que no soportan HTML  
✅ **Múltiples proveedores** - Sistema de fallback automático  
✅ **Validación de emails** - Formato y seguridad  
✅ **Logging completo** - Para debugging y monitoreo  
✅ **Manejo de errores** - Reintentos y notificaciones  

## Cómo Probar el Sistema

### 1. Verificar Estado del Servicio
```bash
curl http://localhost:3000/api/send-email
```

### 2. Enviar Email de Prueba
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu_email@ejemplo.com",
    "subject": "Prueba de Email",
    "html": "<h1>¡Funciona!</h1><p>El sistema de emails está configurado correctamente.</p>"
  }'
```

### 3. Probar Registro Completo
1. Ir a `/register`
2. Completar el formulario
3. Verificar que llegue el email de confirmación

## Modo de Desarrollo

Sin configurar variables de entorno, el sistema funciona en **modo simulación**:
- Los emails se muestran en la consola
- No se envían emails reales
- Perfecto para desarrollo y testing

## Modo de Producción

Con las variables configuradas:
- Los emails se envían realmente
- Se usan los proveedores configurados
- Sistema de fallback automático

## Próximos Pasos

1. **Configurar proveedor de email** (Resend recomendado)
2. **Verificar dominio** en el proveedor elegido
3. **Configurar variables de entorno**
4. **Probar envío real**
5. **Monitorear logs** para asegurar funcionamiento

## Troubleshooting

### Email no llega
- Verificar variables de entorno
- Revisar carpeta de spam
- Verificar dominio en proveedor
- Revisar logs de la aplicación

### Error de API
- Verificar API key válida
- Verificar dominio verificado
- Revisar límites de envío
- Verificar formato de email

### Error de SMTP
- Verificar credenciales
- Usar App Password para Gmail
- Verificar puerto y host
- Revisar configuración de seguridad

## Contacto

Si tienes problemas con la configuración, revisa los logs de la aplicación o contacta al equipo de desarrollo. 