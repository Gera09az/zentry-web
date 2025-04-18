import 'package:flutter/foundation.dart';

/// Servicio para centralizar el logging en la aplicación
/// Permite control sobre qué logs se muestran y cómo se muestran
class LoggerService {
  /// Nivel de debug para logs informativos detallados
  static void debug(String message) {
    if (kDebugMode) {
      print('DEBUG: $message');
    }
  }

  /// Nivel de info para mensajes informativos generales
  static void info(String message) {
    if (kDebugMode) {
      print('INFO: $message');
    }
  }

  /// Nivel de warning para situaciones potencialmente problemáticas
  static void warning(String message) {
    if (kDebugMode) {
      print('WARN: $message');
    }
  }

  /// Nivel de error para errores que no impiden el funcionamiento
  static void error(String message) {
    if (kDebugMode) {
      print('ERROR: $message');
    }
  }

  /// Nivel de error crítico para situaciones que impiden el funcionamiento
  static void critical(String message) {
    // Siempre se muestran los errores críticos, incluso en producción
    print('CRITICAL: $message');
    
    // Aquí se podría implementar lógica adicional como enviar el error a un servicio
  }
} 