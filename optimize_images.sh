#!/bin/bash

echo "🖼️  Iniciando optimización de imágenes..."

# Función para optimizar una imagen PNG
optimize_png() {
    local file="$1"
    local original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    
    echo "Optimizando: $file"
    
    # Usar pngquant para reducir colores (mantiene calidad visual)
    pngquant --quality=85-95 --force --ext .png "$file"
    
    # Usar optipng para optimizar la compresión
    optipng -o2 "$file"
    
    local new_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    local reduction=$((100 - (new_size * 100 / original_size)))
    
    echo "  ✅ Reducción: ${reduction}% (${original_size} → ${new_size} bytes)"
}

# Optimizar imágenes en la carpeta Card
echo "📁 Optimizando imágenes en Card/"
for file in zentry/assets/Card/*.png; do
    if [ -f "$file" ]; then
        optimize_png "$file"
    fi
done

# Optimizar imágenes en la carpeta icon
echo "📁 Optimizando imágenes en icon/"
for file in zentry/assets/icon/*.png; do
    if [ -f "$file" ]; then
        optimize_png "$file"
    fi
done

echo "🎉 Optimización completada!"

# Mostrar comparación de tamaños
echo "📊 Comparación de tamaños:"
echo "Tamaños originales:"
du -h backup_images/Card/* backup_images/icon/* | sort -hr

echo -e "\nTamaños optimizados:"
du -h zentry/assets/Card/* zentry/assets/icon/* | sort -hr 