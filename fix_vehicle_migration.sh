#!/bin/bash

cd /Users/gerardoarroyo/Desktop/Zentry/zentry

# Reemplazar asignaciones de variables de vehículo
sed -i '' 's/_isEventPlateFlow = true/_setEventPlateFlow(true)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isEventPlateFlow = false/_setEventPlateFlow(false)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isAnalyzingVehicle = true/_setAnalyzingVehicle(true)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isAnalyzingVehicle = false/_setAnalyzingVehicle(false)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_scannedPlate = plate/_setScannedPlate(plate)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_vehicleFlowDecision = decision/_setVehicleFlowDecision(decision)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isInIntelligentFlow = true/_setInIntelligentFlow(true)/g' lib/screens/security/security_scan_screen.dart
sed -i '' 's/_isInIntelligentFlow = false/_setInIntelligentFlow(false)/g' lib/screens/security/security_scan_screen.dart

echo "Migración de vehículos completada" 