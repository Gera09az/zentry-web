#!/bin/bash

echo "🔧 Corrigiendo errores de sintaxis en archivos responsive..."

# Lista de archivos con errores
FILES=(
    "zentry/lib/layouts/base_layout.dart"
    "zentry/lib/screens/resident/notifications_screen.dart"
    "zentry/lib/screens/resident/panic_screen.dart"
    "zentry/lib/screens/resident/payments_screen.dart"
    "zentry/lib/screens/resident/reservations_screen.dart"
    "zentry/lib/screens/resident/surveys_screen.dart"
)

# Función para corregir uso incorrecto de ResponsiveHelper
fix_responsive_helper_usage() {
    local file=$1
    echo "🔧 Corrigiendo uso de ResponsiveHelper en $file"
    
    # Corregir ResponsiveHelper.getAdaptivePadding(context, mobile: X, tablet: Y)
    sed -i '' 's/ResponsiveHelper\.getAdaptivePadding(context, mobile: 12, tablet: 16)/ResponsiveHelper.getAdaptivePadding(context, mobile: 12.0, tablet: 16.0)/g' "$file"
    sed -i '' 's/ResponsiveHelper\.getAdaptivePadding(context, mobile: 16, tablet: 20)/ResponsiveHelper.getAdaptivePadding(context, mobile: 16.0, tablet: 20.0)/g' "$file"
    sed -i '' 's/ResponsiveHelper\.getAdaptivePadding(context, mobile: 18, tablet: 24)/ResponsiveHelper.getAdaptivePadding(context, mobile: 18.0, tablet: 24.0)/g' "$file"
    
    # Corregir patrones incorrectos donde se usa como constructor
    sed -i '' 's/EdgeInsets\.all(ResponsiveHelper\.getAdaptivePadding(/ResponsiveHelper.getAdaptivePadding(/g' "$file"
    sed -i '' 's/padding: ResponsiveHelper\.getAdaptivePadding(/padding: ResponsiveHelper.getAdaptivePadding(/g' "$file"
    sed -i '' 's/const ResponsiveHelper\.getAdaptivePadding(/ResponsiveHelper.getAdaptivePadding(/g' "$file"
}

# Función para eliminar maxLines duplicados
fix_duplicate_maxlines() {
    local file=$1
    echo "📝 Corrigiendo maxLines duplicados en $file"
    
    # Buscar y corregir patrones de maxLines duplicados
    sed -i '' '/maxLines: [0-9],/,/maxLines: [0-9],/ {
        /maxLines: [0-9],.*maxLines: [0-9],/ {
            s/maxLines: [0-9],\n.*maxLines: [0-9],/maxLines: 2,/
        }
    }' "$file" 2>/dev/null || true
}

# Función para restaurar EdgeInsets.all correctos
fix_edgeinsets() {
    local file=$1
    echo "📏 Corrigiendo EdgeInsets en $file"
    
    # Restaurar EdgeInsets.all(16) donde se cambió incorrectamente
    sed -i '' 's/padding: ResponsiveHelper\.getAdaptivePadding(context, mobile: 12, tablet: 16)/padding: const EdgeInsets.all(16)/g' "$file"
    sed -i '' 's/padding: ResponsiveHelper\.getAdaptivePadding(context, mobile: 16, tablet: 20)/padding: const EdgeInsets.all(20)/g' "$file"
    sed -i '' 's/padding: ResponsiveHelper\.getAdaptivePadding(context, mobile: 18, tablet: 24)/padding: const EdgeInsets.all(24)/g' "$file"
}

# Procesar cada archivo
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🔍 Corrigiendo $file..."
        
        # Crear backup
        cp "$file" "$file.error_backup"
        
        # Aplicar correcciones
        fix_responsive_helper_usage "$file"
        fix_duplicate_maxlines "$file"
        fix_edgeinsets "$file"
        
        echo "✅ $file corregido"
    else
        echo "❌ Archivo no encontrado: $file"
    fi
done

echo "✨ Errores de sintaxis corregidos!" 