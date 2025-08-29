# Variables de Entorno para Vercel

## 🔧 Variables Necesarias

### Firebase Config
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=zentryapp-949f4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=zentryapp-949f4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=zentryapp-949f4.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### Firebase Admin (para API routes)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Stripe (si usas pagos)
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Email (si usas envío de emails)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

## 📝 Instrucciones

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente
4. Marca como "Production" y "Preview"
5. Redeploy el proyecto

## 🔒 Notas de Seguridad

- Nunca subas estas variables a GitHub
- Usa valores de producción para el deploy final
- Las variables con `NEXT_PUBLIC_` son visibles en el cliente
- Las demás son solo para el servidor
