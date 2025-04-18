import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../../services/logger_service.dart';

/// Clase que maneja el procesamiento de documentos oficiales para extraer información
class DocumentProcessor {
  /// Procesa el texto reconocido de un documento para extraer información
  /// 
  /// Recibe un texto reconocido y extrae información como:
  /// - Nombre
  /// - CURP
  /// - Número de documento
  /// - Tipo de documento (INE, Pasaporte, etc.)
  /// 
  /// Devuelve un Map con la información extraída y un campo 'success' que indica
  /// si se pudo extraer información útil
  static Future<Map<String, dynamic>> processRecognizedText(dynamic recognizedText) async {
    try {
      // Extraer el texto completo
      String fullText = '';
      
      // Si es un objeto que contiene texto
      if (recognizedText is! String) {
        fullText = recognizedText.text;
      } else {
        fullText = recognizedText;
      }
      
      LoggerService.debug('Texto extraído: $fullText');
      
      // Procesar el texto para extraer información
      final Map<String, dynamic> extractedData = await _extractDocumentData(fullText);
      
      // Verificar si se extrajo información útil
      if (extractedData.containsKey('nombre') && extractedData['nombre'].isNotEmpty) {
        extractedData['success'] = true;
        LoggerService.info('Datos extraídos exitosamente: ${extractedData.toString()}');
        return extractedData;
      } else {
        LoggerService.warning('No se pudo extraer información útil del documento');
        return {'success': false, 'error': 'No se encontraron datos válidos en el documento'};
      }
    } catch (e) {
      LoggerService.error('Error al procesar texto reconocido: $e');
      return {'success': false, 'error': e.toString()};
    }
  }
  
  /// Extrae información de un texto de documento
  static Future<Map<String, dynamic>> _extractDocumentData(String text) async {
    final Map<String, dynamic> data = {};
    
    try {
      // Normalizar texto (quitar acentos, convertir a mayúsculas)
      final String normalizedText = _normalizeText(text);
      
      // Detectar tipo de documento
      data['tipoDocumento'] = _detectDocumentType(normalizedText);
      
      // Extraer CURP si existe
      data['curp'] = _extractCURP(normalizedText);
      
      // Extraer nombre
      data['nombre'] = _extractName(normalizedText);
      
      // Extraer número de documento
      data['numeroDocumento'] = _extractDocumentNumber(normalizedText, data['tipoDocumento']);
      
      LoggerService.debug('Datos extraídos: ${data.toString()}');
      return data;
    } catch (e) {
      LoggerService.error('Error al extraer datos del documento: $e');
      return {'error': e.toString()};
    }
  }
  
  /// Normaliza un texto para facilitar la extracción (elimina acentos, convierte a mayúsculas)
  static String _normalizeText(String text) {
    // Convertir a mayúsculas
    String normalized = text.toUpperCase();
    
    // Reemplazar acentos
    normalized = normalized
        .replaceAll('Á', 'A')
        .replaceAll('É', 'E')
        .replaceAll('Í', 'I')
        .replaceAll('Ó', 'O')
        .replaceAll('Ú', 'U')
        .replaceAll('Ñ', 'N');
    
    return normalized;
  }
  
  /// Detecta el tipo de documento basado en el texto
  static String _detectDocumentType(String text) {
    if (text.contains('INSTITUTO NACIONAL ELECTORAL') || 
        text.contains('CREDENCIAL PARA VOTAR') ||
        text.contains('IFE') ||
        text.contains('INE')) {
      return 'INE';
    } else if (text.contains('PASAPORTE') || text.contains('PASSPORT')) {
      return 'Pasaporte';
    } else {
      return 'Desconocido';
    }
  }
  
  /// Extrae el CURP del texto si existe
  static String _extractCURP(String text) {
    // Patrón CURP (4 letras, 6 números, 6 letras, 2 números)
    final RegExp curpRegex = RegExp(r'[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}');
    
    final match = curpRegex.firstMatch(text);
    if (match != null) {
      return match.group(0) ?? '';
    }
    
    return '';
  }
  
  /// Extrae el nombre del documento
  static String _extractName(String text) {
    try {
      // Estrategia 1: Buscar después de "NOMBRE"
      final List<String> lines = text.split('\n');
      
      for (int i = 0; i < lines.length; i++) {
        final String line = lines[i].trim();
        
        if (line.contains('NOMBRE')) {
          // Si la línea contiene "NOMBRE" pero hay más texto, extraer después de "NOMBRE"
          if (line.length > 7) {
            return line.substring(line.indexOf('NOMBRE') + 7).trim();
          } 
          // Si "NOMBRE" está solo en la línea, el nombre podría estar en la siguiente línea
          else if (i + 1 < lines.length) {
            return lines[i + 1].trim();
          }
        }
      }
      
      // Estrategia 2: Para INE, buscar entre "MEXICO" y "DOMICILIO" o "CLAVE"
      if (text.contains('MEXICO') && (text.contains('DOMICILIO') || text.contains('CLAVE'))) {
        final int startIndex = text.indexOf('MEXICO') + 'MEXICO'.length;
        int endIndex = text.length;
        
        if (text.contains('DOMICILIO')) {
          endIndex = text.indexOf('DOMICILIO');
        } else if (text.contains('CLAVE')) {
          endIndex = text.indexOf('CLAVE');
        }
        
        if (startIndex < endIndex) {
          return text.substring(startIndex, endIndex).trim().split('\n')[0];
        }
      }
      
      // Si no se encuentra un patrón claro, retornar la línea más larga
      // (muchas veces el nombre es la línea más larga en documentos)
      String longestLine = '';
      for (final String line in lines) {
        if (line.length > longestLine.length && 
            line.length > 10 && 
            !line.contains('INSTITUTO') && 
            !line.contains('MEXICO') &&
            !line.contains('CREDENCIAL')) {
          longestLine = line;
        }
      }
      
      return longestLine.trim();
    } catch (e) {
      LoggerService.error('Error al extraer nombre: $e');
      return '';
    }
  }
  
  /// Extrae el número de documento basado en el tipo
  static String _extractDocumentNumber(String text, String documentType) {
    if (documentType == 'INE') {
      // Para INE, buscar patrón de clave de elector (18 caracteres alfanuméricos)
      final RegExp claveElectorRegex = RegExp(r'[A-Z]{6}[0-9]{8}[A-Z0-9]{4}');
      
      final match = claveElectorRegex.firstMatch(text);
      if (match != null) {
        return match.group(0) ?? '';
      }
    } else if (documentType == 'Pasaporte') {
      // Para pasaporte, buscar después de "PASSPORT NO" o "PASAPORTE NO"
      final List<String> lines = text.split('\n');
      
      for (final String line in lines) {
        if (line.contains('PASSPORT NO') || line.contains('PASAPORTE NO')) {
          final String lineAfterNo = line.split('NO').last.trim();
          if (lineAfterNo.isNotEmpty) {
            return lineAfterNo;
          }
        }
      }
      
      // Alternativamente, buscar un patrón de pasaporte mexicano (una letra seguida de 8 dígitos)
      final RegExp passportRegex = RegExp(r'[A-Z][0-9]{8}');
      
      final match = passportRegex.firstMatch(text);
      if (match != null) {
        return match.group(0) ?? '';
      }
    }
    
    return '';
  }

  /// Versión mejorada del procesador de texto reconocido para extraer información relevante
  /// como CURP, nombre, número de documento, etc.
  static Map<String, String> enhancedProcessRecognizedText(dynamic recognizedText) {
    final String fullText = recognizedText is String ? recognizedText : recognizedText.text;
    if (kDebugMode) {
      print('Texto reconocido completo: $fullText');
    }
    
    final Map<String, String> extractedData = {};
    
    // Extraer CURP - formato típico: ABCD123456ABCDEF12
    final RegExp curpRegex = RegExp(r'[A-Z]{4}[0-9]{6}[A-Z]{6}[0-9]{2}');
    final curpMatch = curpRegex.firstMatch(fullText);
    if (curpMatch != null) {
      extractedData['curp'] = curpMatch.group(0)!;
      if (kDebugMode) {
        print('CURP encontrado: ${extractedData['curp']}');
      }
    }
    
    // Extraer nombre - buscar después de la palabra "NOMBRE"
    final RegExp nameRegex = RegExp(r'NOMBRE[:\s]+([A-ZÁÉÍÓÚÑ\s]+)(?=\b)', caseSensitive: false);
    final nameMatch = nameRegex.firstMatch(fullText);
    if (nameMatch != null && nameMatch.groupCount >= 1) {
      String name = nameMatch.group(1)?.trim() ?? '';
      // Limpiar el nombre de caracteres no deseados
      name = name.replaceAll(RegExp(r'[^A-ZÁÉÍÓÚÑ\s]'), '').trim();
      if (name.isNotEmpty) {
        extractedData['nombre'] = name;
        if (kDebugMode) {
          print('Nombre encontrado: ${extractedData['nombre']}');
        }
      } else {
        // Intento alternativo para encontrar el nombre
        final String? alternativeName = _extractNameAlternative(fullText);
        if (alternativeName != null) {
          extractedData['nombre'] = alternativeName;
          if (kDebugMode) {
            print('Nombre alternativo encontrado: ${extractedData['nombre']}');
          }
        }
      }
    } else {
      // Intento alternativo para encontrar el nombre
      final String? alternativeName = _extractNameAlternative(fullText);
      if (alternativeName != null) {
        extractedData['nombre'] = alternativeName;
        if (kDebugMode) {
          print('Nombre alternativo encontrado: ${extractedData['nombre']}');
        }
      }
    }
    
    // Extraer clave electoral - formato típico: ABCDEF123456ABC123
    final RegExp electoralKeyRegex = RegExp(r'[A-Z]{6}[0-9]{8}[A-Z][0-9]{3}');
    final electoralKeyMatch = electoralKeyRegex.firstMatch(fullText);
    if (electoralKeyMatch != null) {
      extractedData['claveElectoral'] = electoralKeyMatch.group(0)!;
      if (kDebugMode) {
        print('Clave electoral encontrada: ${extractedData['claveElectoral']}');
      }
    }
    
    // Extraer número de documento - secuencia de 8-13 dígitos
    final RegExp docNumberRegex = RegExp(r'\b[0-9]{8,13}\b');
    final docNumberMatch = docNumberRegex.firstMatch(fullText);
    if (docNumberMatch != null) {
      extractedData['numeroDocumento'] = docNumberMatch.group(0)!;
      if (kDebugMode) {
        print('Número de documento encontrado: ${extractedData['numeroDocumento']}');
      }
    }
    
    // Extraer fecha de nacimiento - formato típico: DD/MM/YYYY
    final RegExp dobRegex = RegExp(r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}\b');
    final dobMatch = dobRegex.firstMatch(fullText);
    if (dobMatch != null) {
      extractedData['fechaNacimiento'] = dobMatch.group(0)!;
      if (kDebugMode) {
        print('Fecha de nacimiento encontrada: ${extractedData['fechaNacimiento']}');
      }
    }
    
    return extractedData;
  }
  
  /// Método alternativo para encontrar nombres cuando el patrón principal falla
  static String? _extractNameAlternative(String text) {
    // Buscar patrones comunes que podrían preceder/seguir al nombre
    final List<RegExp> patterns = [
      RegExp(r'NOMBRE[:\s]+([A-ZÁÉÍÓÚÑ\s]{10,50})', caseSensitive: false),
      RegExp(r'(?:NOMBRE|APELLIDO)[:\s]+([A-ZÁÉÍÓÚÑ\s]{5,30})', caseSensitive: false),
      RegExp(r'(?<=\n|\r)([A-ZÁÉÍÓÚÑ]{2,25}\s[A-ZÁÉÍÓÚÑ]{2,25}(?:\s[A-ZÁÉÍÓÚÑ]{2,25}){0,2})(?=\n|\r|$)'),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(text);
      if (match != null && match.groupCount >= 1) {
        String name = match.group(1)?.trim() ?? '';
        // Limpiar el nombre de caracteres no deseados
        name = name.replaceAll(RegExp(r'[^A-ZÁÉÍÓÚÑ\s]'), '').trim();
        if (name.isNotEmpty && name.split(' ').length >= 2) {
          return name;
        }
      }
    }
    
    return null;
  }
} 