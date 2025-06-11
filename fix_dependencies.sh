#!/bin/bash

echo "🔧 Optimizando dependencias de Zentry..."

# Backup del pubspec.yaml original
cp pubspec.yaml pubspec.yaml.backup
echo "✅ Backup creado: pubspec.yaml.backup"

echo "📦 Identificando dependencias problemáticas..."

echo "🔍 Análisis de google_ml_kit:"
echo "  - Tamaño actual: ~20MB (todos los modelos)"
echo "  - Solo necesitas: text_recognition (~5MB)"
echo "  - Ahorro potencial: 15MB"

echo ""
echo "🔍 Análisis de image_gallery_saver:"
echo "  - Error actual: android:attr/lStar not found"
echo "  - Causa: Incompatibilidad con compileSdk 35"

echo ""
echo "💡 RECOMENDACIONES:"
echo "================================"

echo "1. Para optimizar ML Kit, en pubspec.yaml:"
echo "   REMOVER:"
echo "   - google_ml_kit: ^0.20.0"
echo ""
echo "   MANTENER:"
echo "   - google_mlkit_text_recognition: ^0.15.0 ✅ (ya lo tienes)"
echo ""

echo "2. Para image_gallery_saver, probar:"
echo "   - Actualizar a versión más reciente"
echo "   - O usar alternativa como gal package"

echo ""
echo "3. Después de cambios, ejecutar:"
echo "   flutter clean"
echo "   flutter pub get"
echo "   flutter build apk --release --target-platform android-arm64"

echo ""
echo "🎯 IMPACTO ESTIMADO:"
echo "- ML Kit optimizado: -15MB"
echo "- Dependencia fija: build release funcional"
echo "- Total optimización adicional: -15-20MB"

echo ""
echo "📋 ¿Quieres que aplique los cambios automáticamente?"
echo "   (Crear pubspec optimizado)"
echo ""
echo "Ejecuta: ./apply_ml_kit_optimization.sh" 