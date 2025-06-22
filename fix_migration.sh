#!/bin/bash

cd /Users/gerardoarroyo/Desktop/Zentry/zentry

# Reemplazar asignaciones de _isProcessing
sed -i '' 's/_isProcessing = false/_setProcessing(false)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isProcessing = true/_setProcessing(true)/g' lib/screens/security/security_scan_screen.dart

# Reemplazar asignaciones de _lastScannedCode
sed -i '' 's/_lastScannedCode = null/_setLastScannedCode(null)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_lastScannedCode = scannedCode/_setLastScannedCode(scannedCode)/g' lib/screens/security/security_scan_screen.dart

echo "Migración completada" 