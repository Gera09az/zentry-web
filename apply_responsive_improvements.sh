#!/bin/bash

echo "🔧 Aplicando mejoras de responsive a la aplicación Zentry..."

# Lista de archivos que necesitan mejoras responsive
FILES=(
    "zentry/lib/screens/resident/payments_screen.dart"
    "zentry/lib/screens/resident/panic_screen.dart"
    "zentry/lib/screens/resident/reservations_screen.dart"
    "zentry/lib/screens/resident/surveys_screen.dart"
    "zentry/lib/screens/resident/notifications_screen.dart"
    "zentry/lib/layouts/base_layout.dart"
)

# Función para agregar import del ResponsiveHelper
add_responsive_helper_import() {
    local file=$1
    echo "📦 Agregando import de ResponsiveHelper a $file"
    
    # Verificar si el import ya existe
    if ! grep -q "import.*responsive_helper" "$file"; then
        # Buscar la línea del último import y agregar después
        sed -i '' "/import.*theme_config/a\\
import '../../utils/responsive_helper.dart';" "$file" 2>/dev/null || 
        sed -i '' "/import.*config/a\\
import '../utils/responsive_helper.dart';" "$file" 2>/dev/null ||
        sed -i '' "/import 'package:flutter\/material.dart';/a\\
import 'utils/responsive_helper.dart';" "$file" 2>/dev/null
    fi
}

# Función para reemplazar padding fijo con padding adaptativo
replace_fixed_padding() {
    local file=$1
    echo "📏 Reemplazando padding fijo en $file"
    
    # Reemplazar EdgeInsets.all con padding fijo por ResponsiveHelper
    sed -i '' 's/EdgeInsets\.all(16)/ResponsiveHelper.getAdaptivePadding(context, mobile: 12, tablet: 16)/g' "$file"
    sed -i '' 's/EdgeInsets\.all(20)/ResponsiveHelper.getAdaptivePadding(context, mobile: 16, tablet: 20)/g' "$file"
    sed -i '' 's/EdgeInsets\.all(24)/ResponsiveHelper.getAdaptivePadding(context, mobile: 18, tablet: 24)/g' "$file"
}

# Función para agregar LayoutBuilder a grids problemáticos
improve_grid_layouts() {
    local file=$1
    echo "🎯 Mejorando layouts de grid en $file"
    
    # Buscar patrones de GridView.builder con crossAxisCount fijo
    if grep -q "crossAxisCount: [0-9]" "$file"; then
        echo "  ⚠️  Encontrado GridView con crossAxisCount fijo en $file"
        echo "  💡 Considera usar ResponsiveHelper.createAdaptiveGridDelegate() para hacer el grid responsive"
    fi
}

# Función para mejorar overflows de texto
improve_text_overflow() {
    local file=$1
    echo "📝 Mejorando manejo de overflow de texto en $file"
    
    # Agregar maxLines y overflow a textos largos
    sed -i '' 's/overflow: TextOverflow\.ellipsis,$/maxLines: 2,\
                  overflow: TextOverflow.ellipsis,/g' "$file"
}

# Función para agregar Flexible/Expanded a contenido problemático
add_flexible_widgets() {
    local file=$1
    echo "🔄 Agregando widgets Flexible/Expanded en $file"
    
    # Buscar Column/Row que pueden necesitar Flexible
    if grep -q "Column(" "$file" && grep -q "RenderFlex" "$file"; then
        echo "  ⚠️  Posible overflow de Column encontrado en $file"
        echo "  💡 Considera envolver contenido en Flexible o Expanded"
    fi
}

# Procesar cada archivo
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔍 Procesando $file..."
        
        # Crear backup
        cp "$file" "$file.backup"
        
        # Aplicar mejoras
        add_responsive_helper_import "$file"
        replace_fixed_padding "$file"
        improve_grid_layouts "$file"
        improve_text_overflow "$file"
        add_flexible_widgets "$file"
        
        echo "✅ $file procesado"
    else
        echo "❌ Archivo no encontrado: $file"
    fi
done

# Crear archivo de configuración responsive adicional
echo "📋 Creando configuración responsive adicional..."

cat > zentry/lib/config/responsive_config.dart << 'EOF'
class ResponsiveConfig {
  // Breakpoints específicos para Zentry
  static const double mobileSmall = 320;
  static const double mobileMedium = 375;
  static const double mobileLarge = 414;
  static const double tablet = 768;
  static const double desktop = 1024;
  
  // Configuraciones de grid por pantalla
  static const Map<String, Map<String, dynamic>> gridConfigs = {
    'shortcuts': {
      'mobile': {'columns': 2, 'aspectRatio': 0.85},
      'tablet': {'columns': 3, 'aspectRatio': 0.9},
      'desktop': {'columns': 4, 'aspectRatio': 1.0},
    },
    'payments': {
      'mobile': {'columns': 1, 'aspectRatio': 0.6},
      'tablet': {'columns': 2, 'aspectRatio': 0.7},
      'desktop': {'columns': 3, 'aspectRatio': 0.8},
    },
    'surveys': {
      'mobile': {'columns': 1, 'aspectRatio': 0.8},
      'tablet': {'columns': 2, 'aspectRatio': 0.9},
      'desktop': {'columns': 2, 'aspectRatio': 1.0},
    },
  };
  
  // Espaciados recomendados
  static const Map<String, double> spacing = {
    'mobile': 8.0,
    'tablet': 12.0,
    'desktop': 16.0,
  };
  
  // Tamaños de fuente por dispositivo
  static const Map<String, Map<String, double>> fontSizes = {
    'mobile': {
      'small': 10.0,
      'medium': 12.0,
      'large': 14.0,
      'xlarge': 16.0,
    },
    'tablet': {
      'small': 12.0,
      'medium': 14.0,
      'large': 16.0,
      'xlarge': 18.0,
    },
    'desktop': {
      'small': 14.0,
      'medium': 16.0,
      'large': 18.0,
      'xlarge': 20.0,
    },
  };
}
EOF

echo "✨ Mejoras de responsive aplicadas exitosamente!"
echo ""
echo "📋 Resumen de cambios:"
echo "  - ✅ Agregado ResponsiveHelper a archivos principales"
echo "  - ✅ Reemplazado padding fijo con padding adaptativo"
echo "  - ✅ Mejorado manejo de overflow de texto"
echo "  - ✅ Creado ResponsiveConfig para configuraciones específicas"
echo ""
echo "🔧 Tareas manuales recomendadas:"
echo "  1. Revisar GridView.builder y convertir a ResponsiveHelper.createAdaptiveGridDelegate()"
echo "  2. Envolver contenido problemático en Flexible/Expanded"
echo "  3. Testear en dispositivos con diferentes tamaños de pantalla"
echo "  4. Ajustar valores específicos según necesidades de diseño"
echo ""
echo "🏃‍♂️ Para aplicar cambios, ejecuta: flutter clean && flutter pub get" 