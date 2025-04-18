import 'dart:async';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:google_ml_kit/google_ml_kit.dart';
import '../../../services/logger_service.dart';
import '../utils/document_processor.dart';

/// Widget para la visualización y escaneado de documentos
class DocumentScanView extends StatefulWidget {
  final Function(Map<String, String>) onDocumentScanned;
  final Function(String) onInstructionsChanged;
  final Function() onNextStep;
  final Function() onPreviousStep;
  final bool isLoading;

  const DocumentScanView({
    Key? key,
    required this.onDocumentScanned,
    required this.onInstructionsChanged,
    required this.onNextStep,
    required this.onPreviousStep,
    this.isLoading = false,
  }) : super(key: key);

  @override
  State<DocumentScanView> createState() => _DocumentScanViewState();
}

class _DocumentScanViewState extends State<DocumentScanView> {
  final GlobalKey _documentQrKey = GlobalKey(debugLabel: 'DocumentQR');
  QRViewController? _documentQRController;
  final textRecognizer = GoogleMlKit.vision.textDetector();
  
  bool _isDocumentProcessing = false;
  String _documentScanInstructions = 'Coloca tu documento en el marco y presiona el botón de captura';
  Timer? _documentProcessingTimer;
  Timer? _processTimeoutTimer;
  // Desactivamos el procesamiento automático para evitar problemas
  final bool _autoDocumentProcessingEnabled = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _documentQRController?.dispose();
    textRecognizer.close();
    _documentProcessingTimer?.cancel();
    _processTimeoutTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: Stack(
            children: [
              QRView(
                key: _documentQrKey,
                onQRViewCreated: _onDocumentQRViewCreated,
                overlay: QrScannerOverlayShape(
                  borderColor: Theme.of(context).primaryColor,
                  borderRadius: 10,
                  borderLength: 30,
                  borderWidth: 10,
                  cutOutSize: MediaQuery.of(context).size.width * 0.8,
                ),
                onPermissionSet: (ctrl, p) => _onPermissionSet(ctrl, p, 'Documento'),
              ),
              Center(
                child: Container(
                  width: MediaQuery.of(context).size.width * 0.8,
                  height: MediaQuery.of(context).size.width * 0.5,
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.white,
                      width: 2.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),
              Positioned(
                top: 20,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(8.0),
                  color: Colors.black54,
                  child: Text(
                    _documentScanInstructions,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              // Botón grande para captura manual
              Positioned(
                bottom: 90,
                left: 0,
                right: 0,
                child: Center(
                  child: ElevatedButton.icon(
                    onPressed: _isDocumentProcessing ? null : _captureDocumentManually,
                    icon: const Icon(Icons.camera_alt, size: 28),
                    label: const Text(
                      "CAPTURAR DOCUMENTO",
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ),
              if (_isDocumentProcessing || widget.isLoading)
                Container(
                  color: Colors.black54,
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const Text(
                'Posiciona tu INE/IFE dentro del marco',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: widget.onPreviousStep,
                    child: const Text('Cancelar'),
                  ),
                  ElevatedButton(
                    onPressed: widget.onNextStep,
                    child: const Text('Siguiente'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Método para crear y configurar el controlador de la cámara para documentos
  void _onDocumentQRViewCreated(QRViewController controller) {
    if (!mounted) return;
    
    LoggerService.debug("🎥 Controlador de cámara para documentos inicializado");
    _documentQRController = controller;
    
    // Configurar la cámara con parámetros optimizados
    controller.pauseCamera();
    
    // Iniciar la cámara con un pequeño retraso para dar tiempo a la inicialización
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        controller.resumeCamera();
        LoggerService.debug("▶️ Cámara para documentos iniciada");
        _setDocumentScanInstructions('Posiciona tu documento y presiona el botón de captura');
      }
    });
  }

  // Método para manejar permisos de cámara
  void _onPermissionSet(QRViewController controller, bool permission, String type) {
    LoggerService.debug('📷 Permisos de cámara para $type: ${permission ? "CONCEDIDOS" : "DENEGADOS"}');
    if (!permission) {
      _showError('No se otorgaron permisos de cámara para $type');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Método para capturar documento manualmente
  void _captureDocumentManually() async {
    if (_isDocumentProcessing) {
      LoggerService.debug("⚠️ Ya hay un procesamiento en curso, ignorando");
      return;
    }
    
    setState(() {
      _isDocumentProcessing = true;
      _setDocumentScanInstructions('Abriendo cámara para captura...');
    });
    
    LoggerService.debug("📸 Iniciando captura manual de documento");
    
    try {
      // Pausar la cámara antes de abrir el selector de imágenes
      _documentQRController?.pauseCamera();
      
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 90,
        preferredCameraDevice: CameraDevice.rear,
      );
      
      if (image != null) {
        setState(() {
          _setDocumentScanInstructions('Procesando documento...');
        });
        
        LoggerService.debug("📄 Imagen capturada: ${image.path}");
        
        // Procesar la imagen con ML Kit
        final inputImage = InputImage.fromFilePath(image.path);
        final visionText = await textRecognizer.processImage(inputImage);
        
        LoggerService.debug("🔍 Texto reconocido: ${visionText.text.length} caracteres");
        
        // Procesar el documento con el texto reconocido
        await _processDocumentData(visionText);
      } else {
        LoggerService.debug("⚠️ Captura de imagen cancelada por el usuario");
        _setDocumentScanInstructions('Captura cancelada. Intenta nuevamente.');
      }
    } catch (e) {
      LoggerService.error("❌ Error en captura manual: $e");
      _showError('Error al procesar el documento: $e');
      _setDocumentScanInstructions('Error en la captura. Intenta nuevamente.');
    } finally {
      // Solo reanudar la cámara si estamos montados y no hubo un procesamiento exitoso
      if (mounted) {
        _documentQRController?.resumeCamera();
        setState(() {
          _isDocumentProcessing = false;
        });
      }
    }
  }

  // Método para procesar datos de documentos
  Future<void> _processDocumentData(recognizedText) async {
    LoggerService.debug("🔍 Procesando texto reconocido del documento");
    
    try {
      // Extraer datos del documento usando DocumentProcessor
      final extractedData = await DocumentProcessor.processRecognizedText(recognizedText);
      
      // Verificar si encontramos datos suficientes
      if (extractedData.containsKey('success') && extractedData['success'] == true) {
        // Cancelar timer para evitar procesamiento mientras se muestra el diálogo
        _documentProcessingTimer?.cancel();
        
        LoggerService.debug("✅ Datos extraídos con éxito: ${extractedData.length} campos");
        
        // Convertir el mapa dinámico a mapa de strings
        final Map<String, String> stringData = {};
        extractedData.forEach((key, value) {
          if (key != 'success' && value != null) {
            stringData[key] = value.toString();
          }
        });
        
        // Informar a la pantalla principal de los datos extraídos
        widget.onDocumentScanned(stringData);
        
        // Mostrar instrucciones de éxito
        _setDocumentScanInstructions('Documento procesado con éxito');
      } else {
        LoggerService.debug("⚠️ No se detectaron datos en el documento");
        _setDocumentScanInstructions('No se detectaron datos. Intenta nuevamente con una mejor imagen.');
      }
    } catch (e) {
      LoggerService.error("❌ Error procesando el documento: $e");
      _setDocumentScanInstructions('Error al procesar. Intenta con otra captura.');
    }
  }

  // Añadir método para actualizar instrucciones del escáner
  void _setDocumentScanInstructions(String message) {
    if (mounted) {
      setState(() {
        _documentScanInstructions = message;
      });
      widget.onInstructionsChanged(message);
    }
  }
} 