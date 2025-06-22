#!/bin/bash

cd /Users/gerardoarroyo/Desktop/Zentry/zentry

# Reemplazar las referencias restantes
sed -i '' 's/_isProcessingDocument = false;/_documentState.setProcessingDocument(false);/g' lib/screens/security/security_scan_screen.dart

echo "Referencias de _isProcessingDocument corregidas" 