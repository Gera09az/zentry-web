#!/bin/bash

# Script para reiniciar TypeScript y limpiar caché
echo "🔄 Reiniciando servidor de TypeScript..."

# Limpiar caché de npm
echo "🧹 Limpiando caché de npm..."
npm cache clean --force

# Limpiar node_modules y reinstalar
echo "📦 Reinstalando dependencias..."
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Next.js
echo "🗑️ Limpiando caché de Next.js..."
rm -rf .next

# Verificar build
echo "✅ Verificando build..."
npm run build

echo "🎉 ¡Listo! El servidor de TypeScript debería estar funcionando correctamente."
echo "💡 Si usas VS Code, puedes reiniciar el servidor de TypeScript con:"
echo "   Cmd+Shift+P -> 'TypeScript: Restart TS Server'" 