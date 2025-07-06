<!-- TODO: Implementar el sistema de alertas en la app móvil siguiendo este plan. -->

# 📋 PLAN DE IMPLEMENTACIÓN: SISTEMA DE ALERTAS (APP MÓVIL)

Este documento detalla el plan de implementación del sistema de alertas de seguridad para la aplicación móvil Zentry (Flutter).

---

## 🎯 **Objetivo**

Integrar un sistema inteligente que analice las salidas de visitantes y vehículos, genere alertas en tiempo real sobre situaciones anómalas y notifique a las partes correspondientes (residentes, administradores, guardias).

---

## 🏗️ **FASE 1: Fundación y Modelos de Datos**

**Descripción:** Establecer las bases del sistema creando los modelos de datos y definiendo la estructura en Firebase.

### **Acciones:**

1.  **Crear Modelo de Identidad de Visitante:**
    *   **Archivo:** `zentry/lib/models/visitor_identity.dart`
    *   **Propósito:** Crear una "huella digital" única para cada visitante, permitiendo el seguimiento de su historial a través de diferentes visitas, incluso si su nombre se escribe de forma ligeramente diferente.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F1-1] Crear el archivo y la clase VisitorIdentity
        import 'package:flutter/foundation.dart';

        class VisitorIdentity {
          final String visitorId;          // UUID único generado para cada identidad
          final String primaryName;        // El nombre más comúnmente usado
          final String? idNumber;          // Número de identificación (CURP, etc.)
          final String? phone;             // Teléfono
          final DateTime firstVisit;       // Primera visita registrada en el sistema
          final DateTime lastVisit;        // Última visita registrada
          final int totalVisits;           // Contador total de visitas
          final List<String> aliases;      // Otros nombres con los que ha sido registrado
          final List<Map<String, dynamic>> lostPasses; // Historial de pases perdidos
          final double riskScore;          // Puntuación de riesgo (0-100)

          VisitorIdentity({
            required this.visitorId,
            required this.primaryName,
            this.idNumber,
            this.phone,
            required this.firstVisit,
            required this.lastVisit,
            required this.totalVisits,
            required this.aliases,
            required this.lostPasses,
            this.riskScore = 0.0,
          });

          // Genera una huella única para buscar duplicados
          String get fingerprint {
            final namePart = primaryName.toLowerCase().replaceAll(RegExp(r'\s+'), '');
            final idPart = idNumber ?? '';
            return '$namePart-$idPart';
          }
        }
        ```

2.  **Crear Modelo de Alerta:**
    *   **Archivo:** `zentry/lib/models/exit_alert.dart`
    *   **Propósito:** Definir la estructura de una alerta, incluyendo su tipo, severidad, datos asociados y acciones sugeridas.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F1-2] Crear el archivo y la clase ExitAlert con sus enums
        class ExitAlert {
          final String id;
          final AlertType type;
          final AlertCategory category;
          final String title;
          final String message;
          final DateTime timestamp;
          final String residencialId;
          final String ingresoId;
          final Map<String, dynamic> metadata;
          final List<String> suggestedActions;
          final bool notifyResident;
          final bool notifyAdmin;
          final AlertStatus status;

          ExitAlert({
            required this.id,
            required this.type,
            required this.category,
            required this.title,
            required this.message,
            required this.timestamp,
            required this.residencialId,
            required this.ingresoId,
            required this.metadata,
            required this.suggestedActions,
            required this.notifyResident,
            required this.notifyAdmin,
            this.status = AlertStatus.ACTIVE,
          });
        }

        enum AlertType { CRITICAL, MODERATE, INFO }
        enum AlertCategory {
          VEHICLE_CHANGE,
          MISSING_VEHICLE,
          FREQUENT_LOST_PASS,
          SUSPICIOUS_EXIT_TIME,
          EXCESSIVE_STAY,
          OUT_OF_HOURS,
          FORCED_EXIT,
          INVALID_QR,
          COMPROMISED_GUARD
        }
        enum AlertStatus { ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED }
        ```

3.  **Actualizar Modelo de Usuario:**
    *   **Archivo:** `zentry/lib/models/user_model.dart` (o donde se defina el usuario)
    *   **Propósito:** Añadir preferencias para que los usuarios puedan activar/desactivar ciertos tipos de alertas.
    *   **Código a añadir en la clase `User`:**
        ```dart
        // TODO: [ALERTAS-M-F1-3] Añadir campo de preferencias de alertas al modelo de usuario
        final Map<String, bool>? alertPreferences;

        // Ejemplo de estructura de alertPreferences:
        // {
        //   "VEHICLE_CHANGE": true,
        //   "EXCESSIVE_STAY": false,
        //   "SUSPICIOUS_EXIT_TIME": true
        // }
        ```

### **Estructura en Firebase (Nuevas Colecciones):**

*   `visitor_identities`: Almacenará los perfiles únicos de los visitantes. El ID del documento será el `visitorId`.
*   `exit_alerts`: Guardará un registro de todas las alertas generadas. El ID del documento será el `alertId`.

---

## 🏗️ **FASE 2: Servicios Core**

**Descripción:** Crear la lógica de negocio que analizará las salidas y gestionará las identidades de los visitantes.

### **Acciones:**

1.  **Crear Servicio de Identidad de Visitantes:**
    *   **Archivo:** `zentry/lib/services/visitor_identity_service.dart`
    *   **Propósito:** Centralizar la lógica para encontrar, crear y actualizar los perfiles de los visitantes.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F2-1] Crear el servicio VisitorIdentityService
        import 'package:cloud_firestore/cloud_firestore.dart';
        import '../models/visitor_identity.dart';

        class VisitorIdentityService {
          static final _firestore = FirebaseFirestore.instance;
          static final _collection = _firestore.collection('visitor_identities');

          // Encuentra una identidad existente o crea una nueva.
          static Future<VisitorIdentity> getOrCreateIdentity({
            required String name,
            String? idNumber,
            String? phone,
          }) async {
            // Lógica para generar fingerprint y buscar.
            // Si no encuentra, crea un nuevo documento y devuelve el modelo.
            // ...
            // Placeholder, se necesita implementar la lógica completa.
            throw UnimplementedError();
          }

          // Actualiza el historial de pases perdidos de un visitante.
          static Future<void> recordLostPass({
            required String visitorId,
            required String residencialId,
            required String reason,
          }) async {
            // Lógica para añadir un nuevo mapa al array 'lostPasses' del visitante.
            // ...
          }
        }
        ```

2.  **Crear Servicio de Análisis de Alertas:**
    *   **Archivo:** `zentry/lib/services/exit_alert_service.dart`
    *   **Propósito:** Será el cerebro del sistema. Orquestará el análisis de cada salida.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F2-2] Crear el servicio ExitAlertService y sus métodos de análisis
        import 'package:cloud_firestore/cloud_firestore.dart';
        import '../models/exit_alert.dart';
        import 'alert_notification_service.dart'; // Se creará en la FASE 4

        class ExitAlertService {
          static final _firestore = FirebaseFirestore.instance;

          static Future<List<ExitAlert>> analyzeExit({
            required String residencialId,
            required String ingresoId,
            required Map<String, dynamic> ingresoData,
            required Map<String, dynamic> exitDetails,
          }) async {
            List<ExitAlert> alerts = [];

            // Aquí se llamarán a los métodos de análisis específicos.
            // Ejemplo:
            // final vehicleAlert = _analyzeVehicleChange(ingresoData, exitDetails);
            // if (vehicleAlert != null) alerts.add(vehicleAlert);

            if (alerts.isNotEmpty) {
              await _saveAlertsToFirebase(alerts, residencialId);
              // La notificación se moverá a un procesador en la nube (cloud function) para mayor robustez.
              // await AlertNotificationService.processAlerts(alerts, ingresoData);
            }
            return alerts;
          }

          static Future<void> _saveAlertsToFirebase(List<ExitAlert> alerts, String residencialId) {
            // Lógica para guardar las alertas en la colección 'exit_alerts'.
          }

          // Implementar métodos privados para cada tipo de alerta:
          // _analyzeVehicleChange, _analyzeMissingVehicle, _analyzeLostPass, etc.
        }
        ```

---

## 🏗️ **FASE 3: Integración con el Flujo de Salida**

**Descripción:** Conectar el nuevo servicio de análisis al flujo de UI existente donde los guardias registran las salidas.

### **Acciones:**

1.  **Modificar `security_exits_screen.dart`:**
    *   **Archivo:** `zentry/lib/screens/security/security_exits_screen.dart`
    *   **Propósito:** Invocar el `ExitAlertService` después de que una salida se complete exitosamente y mostrar un diálogo al guardia si se generan alertas críticas.
    *   **Ubicación:** Dentro del método `_completeExit`.
    *   **Código a añadir:**
        ```dart
        // TODO: [ALERTAS-M-F3-1] Integrar el llamado al ExitAlertService en _completeExit
        // Dentro del bloque `try` de `_completeExit`, después de `_ingresoService.registrarSalida`
        
        final exitDetailsForAnalysis = {
          'exitTimestamp': DateTime.now(),
          'passReturned': _passReturned ?? true,
          'passReturnReason': _passReturnReason,
          'samePersonExit': _samePersonExit ?? true,
          'differentPersonName': _differentPersonName,
          'vehiclePresent': _vehiclePresent,
          'exitInSameVehicle': _exitInSameVehicle,
          'exitMode': _exitMode,
          'exitVehicleInfo': _exitVehicleInfo,
          'exitVehiclePlate': _exitVehicleInfo?['plate'],
        };

        final List<ExitAlert> generatedAlerts = await ExitAlertService.analyzeExit(
          residencialId: _residencialID!,
          ingresoId: _selectedVisitor!['id'],
          ingresoData: _selectedVisitor!,
          exitDetails: exitDetailsForAnalysis,
        );

        if (mounted && generatedAlerts.isNotEmpty) {
          _showExitAlertsDialog(generatedAlerts);
        }

        // ... resto del método
        ```

2.  **Crear el Diálogo de Alertas para el Guardia:**
    *   **Archivo:** `zentry/lib/screens/security/security_exits_screen.dart`
    *   **Propósito:** Mostrar un resumen visual e inmediato de las alertas al guardia.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F3-2] Implementar el método _showExitAlertsDialog
        void _showExitAlertsDialog(List<ExitAlert> alerts) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('⚠️ Alertas Detectadas'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: alerts.map((alert) => ListTile(
                    leading: Icon(
                      alert.type == AlertType.CRITICAL ? Icons.error : Icons.warning,
                      color: alert.type == AlertType.CRITICAL ? Colors.red : Colors.orange,
                    ),
                    title: Text(alert.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text(alert.message),
                  )).toList(),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Entendido'),
                ),
              ],
            ),
          );
        }
        ```

---

## 🏗️ **FASE 4: Gestión de Preferencias de Alertas**

**Descripción:** Permitir que los residentes y administradores controlen qué notificaciones de alerta desean recibir.

### **Acciones:**

1.  **Crear UI para Preferencias de Alertas:**
    *   **Archivo:** `zentry/lib/widgets/settings/alert_preferences_sheet.dart`
    *   **Propósito:** Un BottomSheet o página donde el usuario puede ver una lista de tipos de alerta y activar/desactivar cada una.
    *   **Componentes:** Usará `SwitchListTile` para cada preferencia.
    *   **Código de ejemplo:**
        ```dart
        // TODO: [ALERTAS-M-F4-1] Crear el widget AlertPreferencesSheet
        class AlertPreferencesSheet extends StatefulWidget {
          @override
          _AlertPreferencesSheetState createState() => _AlertPreferencesSheetState();
        }

        class _AlertPreferencesSheetState extends State<AlertPreferencesSheet> {
          Map<String, bool> _preferences = {};
          bool _isLoading = true;

          @override
          void initState() {
            super.initState();
            _loadPreferences();
          }

          void _loadPreferences() {
            // Cargar preferencias del usuario desde el UserService/AuthProvider
          }

          void _updatePreference(String key, bool value) {
            // Actualizar preferencia en el estado y en Firebase
          }

          @override
          Widget build(BuildContext context) {
            return Column(
              children: [
                // Ejemplo de un switch
                SwitchListTile(
                  title: const Text('Cambio de Vehículo'),
                  subtitle: const Text('Recibir alerta si un visitante sale en un vehículo diferente.'),
                  value: _preferences['VEHICLE_CHANGE'] ?? true,
                  onChanged: (val) => _updatePreference('VEHICLE_CHANGE', val),
                ),
                // ... más SwitchListTiles para otras alertas ...
              ],
            );
          }
        }
        ```

2.  **Integrar en la Pantalla de Ajustes:**
    *   **Archivo:** `zentry/lib/widgets/app_drawer.dart` o la pantalla de perfil/ajustes.
    *   **Propósito:** Añadir un botón o ítem de menú que abra el `AlertPreferencesSheet`.
    *   **Código:**
        ```dart
        // TODO: [ALERTAS-M-F4-2] Añadir punto de entrada para las preferencias de alertas
        ListTile(
          leading: Icon(Icons.notifications_active_outlined),
          title: Text('Preferencias de Alertas'),
          onTap: () {
            // Mostrar el AlertPreferencesSheet
          },
        ),
        ```

3.  **Filtrar Notificaciones Basado en Preferencias:**
    *   **Ubicación:** Esta lógica se ejecutará idealmente en una **Cloud Function** de Firebase para evitar enviar notificaciones innecesarias. Al procesar una alerta, la función leerá las preferencias del usuario destinatario antes de enviar la notificación push.
    *   **Lógica en la Cloud Function (Pseudocódigo):**
        ```javascript
        // TODO: [ALERTAS-CF-1] Implementar lógica de filtrado en Cloud Function
        // function sendAlertNotification(alert, userId) {
        //   const userDoc = await db.collection('users').doc(userId).get();
        //   const preferences = userDoc.data().alertPreferences;
        //
        //   const alertCategory = alert.category; // e.g., 'VEHICLE_CHANGE'
        //   const isEnabled = preferences[alertCategory] ?? true; // Activo por defecto
        //
        //   if (isEnabled) {
        //     // Enviar notificación a través de FCM
        //   }
        // }
        ```

---

Este plan cubre la implementación completa en la app móvil. El siguiente paso es seguir el plan para la aplicación web para construir el dashboard de administración. 