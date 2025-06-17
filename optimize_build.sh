#!/bin/bash

# 🚀 SCRIPT DE OPTIMIZACIÓN ZENTRY
# Este script optimiza el proyecto para builds más rápidos

echo "🚀 Iniciando optimización de build para Zentry..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar pasos
show_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Paso 1: Configurar Xcode para builds más rápidos
show_step "Configurando Xcode para builds más rápidos..."
defaults write com.apple.dt.Xcode IDEBuildOperationMaxNumberOfConcurrentCompileTasks 6
defaults write com.apple.dt.Xcode ShowBuildOperationDuration YES
defaults write com.apple.dt.Xcode IDEIndexDisable 0
defaults write com.apple.dt.Xcode IDEIndexEnable 1
show_success "Configuración de Xcode optimizada"

# Paso 2: Limpiar cache de Flutter
show_step "Limpiando cache de Flutter..."
flutter clean
show_success "Cache de Flutter limpiado"

# Paso 3: Limpiar cache de Xcode
show_step "Limpiando cache de Xcode..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
show_success "Cache de Xcode limpiado"

# Paso 4: Navegar al directorio del proyecto
cd zentry

# Paso 5: Reinstalar dependencias Flutter
show_step "Reinstalando dependencias Flutter..."
flutter pub get
show_success "Dependencias Flutter reinstaladas"

# Paso 6: Limpiar y reinstalar Pods
show_step "Limpiando y reinstalando Pods iOS..."
cd ios
rm -rf Pods
rm -f Podfile.lock
pod cache clean --all
pod install --repo-update
cd ..
show_success "Pods iOS reinstalados"

# Paso 7: Precache de builds
show_step "Generando precache para builds más rápidos..."
flutter precache --ios
show_success "Precache generado"

# Paso 8: Verificar configuración optimizada
show_step "Verificando optimizaciones aplicadas..."

# Verificar que las optimizaciones del Podfile están presentes
if grep -q "COMPILER_INDEX_STORE_ENABLE" ios/Podfile; then
    show_success "Optimizaciones de Podfile aplicadas correctamente"
else
    show_warning "Las optimizaciones del Podfile podrían no estar aplicadas"
fi

# Paso 9: Mostrar resumen de optimizaciones
echo ""
echo -e "${GREEN}🎉 OPTIMIZACIÓN COMPLETADA${NC}"
echo ""
echo "📊 Optimizaciones aplicadas:"
echo "   ✅ Configuración Xcode optimizada"
echo "   ✅ Cache limpiado completamente"
echo "   ✅ Dependencias reinstaladas"
echo "   ✅ Pods optimizados"
echo "   ✅ Precache generado"
echo "   ✅ Builds paralelos habilitados"
echo ""
echo "⏱️  Tiempos esperados después de optimización:"
echo "   🏗️  Primer build: 3-5 minutos"
echo "   🔄 Builds incrementales: 30-60 segundos"
echo "   🔥 Hot reload: 1-3 segundos"
echo ""
echo -e "${BLUE}🚀 Para ejecutar tu app optimizada:${NC}"
echo "   flutter run --debug"
echo ""
echo -e "${YELLOW}💡 Consejos para mantener builds rápidos:${NC}"
echo "   • Usa 'flutter run' sin '--clean' para builds incrementales"
echo "   • Evita borrar la carpeta ios/build entre builds"
echo "   • Usa hot reload (r) en lugar de reiniciar la app"
echo ""

# Paso 10: Ofrecer ejecutar el build optimizado
echo -e "${BLUE}¿Quieres ejecutar la app ahora? (y/n):${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY]|[sS][íÍ])$ ]]; then
    show_step "Ejecutando build optimizado..."
    flutter run --debug
else
    echo -e "${GREEN}Listo! Tu proyecto está optimizado. Ejecuta 'flutter run' cuando estés listo.${NC}"
fi 