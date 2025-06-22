#!/bin/bash

cd /Users/gerardoarroyo/Desktop/Zentry/zentry

# Reemplazar asignaciones directas por llamadas a métodos
sed -i '' 's/_brandSearchText = /_setBrandSearchText(/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_selectedBrand = /_setSelectedBrand(/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_selectedModel = /_setSelectedModel(/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_selectedColor = /_setSelectedColor(/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_modelSearchText = /_setModelSearchText(/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_selectedDriver = /_setSelectedDriver(/g' lib/screens/security/security_scan_screen.dart

# Agregar paréntesis de cierre para las asignaciones
sed -i '' 's/_setBrandSearchText(value;/_setBrandSearchText(value);/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_setSelectedBrand(value;/_setSelectedBrand(value);/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_setSelectedModel(value;/_setSelectedModel(value);/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_setSelectedColor(value;/_setSelectedColor(value);/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_setModelSearchText(value;/_setModelSearchText(value);/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_setSelectedDriver(value;/_setSelectedDriver(value);/g' lib/screens/security/security_scan_screen.dart

echo "Asignaciones de vehículos corregidas" 