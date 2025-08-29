'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Bell, Scale, FileText, CreditCard, Building, Smartphone, Globe, AlertTriangle, Gavel } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 hover:bg-green-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Regresar
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
                <p className="text-gray-600 font-medium">ZENTRY TECH GROUP S. DE R.L. DE C.V.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Información inicial */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h2 className="text-xl font-semibold text-green-900">Política de Privacidad</h2>
                <p className="text-green-700 font-medium">ZENTRY TECH GROUP S. DE R.L. DE C.V.</p>
                <p className="text-sm text-green-600">
                  <strong>Última actualización:</strong> 11 de junio de 2025
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Introducción */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-900">Introducción</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                En cumplimiento con lo establecido por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su reforma de 2025, ZENTRY TECH GROUP S. DE R.L. DE C.V. (en adelante "ZENTRY"), pone a su disposición la presente Política de Privacidad.
              </p>
            </CardContent>
          </Card>

          {/* Sección 1: Identidad y domicilio del responsable */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900">1. Identidad y domicilio del responsable</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                ZENTRY TECH GROUP S. DE R.L. DE C.V. es responsable del tratamiento de sus datos personales.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Para cualquier duda relacionada con este aviso o para ejercer sus derechos de protección de datos, puede comunicarse al correo electrónico: zentry.app.mx@gmail.com</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 2: Datos personales que se recaban */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-900">2. Datos personales que se recaban</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Los datos personales que recabamos varían según su rol en la plataforma (administrador, subadministrador, residente o personal de caseta) e incluyen:
              </p>
              
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3">2.1 Datos de identificación y contacto:</h4>
                  <ul className="space-y-2 text-purple-800">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Nombre completo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Dirección completa del fraccionamiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Correo electrónico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Número telefónico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Identificación oficial (para validación de identidad)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">2.2 Datos vehiculares:</h4>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Marca y modelo del vehículo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Color del vehículo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Número de placas</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">2.3 Datos de acceso y seguridad:</h4>
                  <ul className="space-y-2 text-green-800">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Registros de entrada y salida</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Datos de visitantes autorizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Códigos QR generados para acceso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Historial de accesos al fraccionamiento</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-3">2.4 Datos de pago:</h4>
                  <ul className="space-y-2 text-yellow-800">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Información de facturación para cuotas de mantenimiento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Historial de pagos y transacciones</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-yellow-900 font-semibold">
                      <strong>IMPORTANTE:</strong> Zentry no almacena ni tiene acceso directo a los datos de las tarjetas bancarias. Todos los pagos son procesados mediante Stripe, una plataforma certificada conforme a los estándares de seguridad PCI-DSS.
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-3">2.5 Datos de uso de la plataforma:</h4>
                  <ul className="space-y-2 text-indigo-800">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Registros de actividad en la aplicación móvil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Preferencias de configuración</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Dispositivos utilizados para acceder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Reservas de áreas comunes</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed">
                    <strong>No recabamos datos personales sensibles para las finalidades establecidas en el presente aviso.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sección 3: Finalidades del tratamiento */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-orange-900">3. Finalidades del tratamiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-3">3.1 Finalidades primarias (necesarias):</h4>
                <ul className="space-y-2 text-orange-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Controlar y gestionar el acceso a fraccionamientos mediante códigos QR y validación manual desde caseta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Permitir la creación y gestión de cuentas de residentes según su rol asignado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Registrar y gestionar visitantes (esporádicos, frecuentes y para eventos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Emitir notificaciones en tiempo real al residente al momento del ingreso de visitantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Facilitar la reserva y gestión de áreas comunes del fraccionamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Procesar pagos en línea de cuotas de mantenimiento mediante Stripe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proporcionar acceso al panel administrativo para gestión de residentes y comunicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mantener un historial de accesos, visitas, pagos y eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Habilitar funcionalidades de seguridad como botón de pánico para emergencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cumplir con obligaciones legales aplicables</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">3.2 Finalidades secundarias (no necesarias):</h4>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Envío de encuestas de satisfacción y realización de análisis estadísticos para mejorar nuestros servicios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Promoción de funcionalidades nuevas o servicios relacionados con la plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Desarrollo y mejora de nuestros servicios y experiencia de usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Elaboración de perfiles de uso para personalizar la experiencia</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Si no desea que sus datos personales sean tratados para las finalidades secundarias, puede negarse enviando un correo electrónico a zentry.app.mx@gmail.com indicando su negativa, sin que ello afecte el uso de las funcionalidades primarias de la plataforma.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 4: Transferencias de datos personales */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-900">4. Transferencias de datos personales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <p className="text-gray-700 leading-relaxed">
                ZENTRY podrá transferir sus datos personales a las siguientes entidades sin requerir su consentimiento conforme a la LFPDPPP:
              </p>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-3">4.1 Transferencias nacionales:</h4>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Empresas del mismo grupo corporativo de ZENTRY para fines de gestión interna y prestación de servicios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proveedores de servicios tecnológicos (Firebase, Cloud Functions) que nos apoyan en la operación de la plataforma</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proveedores de servicios de pago (Stripe) para el procesamiento de transacciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Autoridades competentes cuando exista requerimiento legal</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">4.2 Transferencias internacionales:</h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proveedores de servicios en la nube (Firebase/Google Cloud) para el almacenamiento seguro de información y para garantizar la operación de la aplicación móvil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proveedores de servicios tecnológicos para el funcionamiento de la aplicación móvil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Stripe para procesamiento seguro de pagos</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  <strong>Estas transferencias se realizan adoptando las medidas necesarias para proteger sus datos personales, incluyendo la firma de convenios y cláusulas de confidencialidad.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 5: Derechos ARCO */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-teal-900">5. Derechos ARCO</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
              </p>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-teal-800 leading-relaxed mb-3">
                  <strong>Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del siguiente medio:</strong>
                </p>
                <p className="text-teal-800 leading-relaxed">
                  <strong>Correo electrónico:</strong> zentry.app.mx@gmail.com
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                ZENTRY dará trámite a las solicitudes que cumplan con los requisitos establecidos en la LFPDPPP y su Reglamento, dentro de un plazo máximo de 20 días hábiles contados desde la fecha en que se reciba la solicitud.
              </p>
            </CardContent>
          </Card>

          {/* Sección 6: Revocación del consentimiento */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-yellow-900">6. Revocación del consentimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Usted puede revocar el consentimiento que nos haya otorgado para el tratamiento de sus datos personales en cualquier momento, mediante el envío de una solicitud a <strong>zentry.app.mx@gmail.com</strong>
              </p>

              <p className="text-gray-700 leading-relaxed">
                La revocación del consentimiento no tendrá efectos retroactivos y ZENTRY atenderá su solicitud en un plazo máximo de 20 días hábiles.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 leading-relaxed">
                  <strong>La revocación del consentimiento para el tratamiento de datos necesarios para las finalidades primarias podría implicar la imposibilidad de seguir prestando el servicio.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 7: Uso de cookies y tecnologías similares */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-indigo-900">7. Uso de cookies y tecnologías similares</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                ZENTRY utiliza cookies y otras tecnologías de rastreo en su aplicación móvil (iOS y Android). Estas tecnologías permiten:
              </p>

              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reconocer al usuario cuando regresa a nuestra aplicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Almacenar información sobre las preferencias del usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Analizar el uso de los servicios y mejorar la experiencia del usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalizar el contenido que se muestra al usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mantener la sesión activa del usuario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Recopilar estadísticas anónimas sobre el uso de la plataforma</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  <strong>Usted puede deshabilitar el uso de cookies desde la configuración de su dispositivo móvil, aunque esto podría afectar la funcionalidad de algunos servicios.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 8: Medidas de seguridad */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-900">8. Medidas de seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                ZENTRY ha implementado y mantiene medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado.
              </p>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3">Estas medidas incluyen:</h4>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Políticas y procedimientos de seguridad de la información</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Controles de acceso físico y lógico a los datos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cifrado de datos en transmisión y almacenamiento mediante protocolos seguros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alojamiento en servidores de alta disponibilidad (Firebase + Cloud Functions) con garantía de disponibilidad del 99.9%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sistemas de respaldo y recuperación de información</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Capacitación regular del personal en materia de protección de datos y seguridad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Contratos con cláusulas de confidencialidad con empleados y proveedores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Actualización periódica de software y sistemas de seguridad</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 leading-relaxed">
                  <strong>En caso de vulneraciones de seguridad que afecten de forma significativa sus derechos patrimoniales o morales, ZENTRY le notificará inmediatamente.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 9: Cambios a la política de privacidad */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-900">9. Cambios a la política de privacidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                ZENTRY se reserva el derecho de realizar modificaciones o actualizaciones a la presente política de privacidad cuando sea necesario para atender novedades legislativas, políticas internas o nuevos requerimientos para la prestación de servicios.
              </p>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3">Estas modificaciones estarán disponibles a través de:</h4>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Nuestra aplicación móvil (iOS y Android)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Correo electrónico proporcionado por el titular</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Notificaciones push en la aplicación</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-700 leading-relaxed">
                La fecha de última actualización aparecerá al inicio de este aviso.
              </p>
            </CardContent>
          </Card>

          {/* Sección 10: Consentimiento */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Gavel className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900">10. Consentimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Al proporcionar sus datos personales a ZENTRY, ya sea a través de nuestra aplicación móvil (iOS o Android) o cualquier otro medio, usted reconoce haber leído y entendido los términos de la presente Política de Privacidad y otorga su consentimiento libre, específico e informado para el tratamiento de sus datos personales conforme a lo aquí establecido.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Al hacer uso de nuestra app, usted acepta los términos aquí descritos. Si no está de acuerdo, deberá abstenerse de utilizar nuestros servicios y puede contactarnos para resolver cualquier inquietud.</strong>
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Para usuarios de la aplicación móvil, el consentimiento se recabará mediante la aceptación electrónica de esta Política de Privacidad al momento del registro.
              </p>
            </CardContent>
          </Card>

          {/* Sección 11: Autoridad competente */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-900">11. Autoridad competente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 leading-relaxed">
                  <strong>En caso de considerar que su derecho a la protección de datos personales ha sido vulnerado, puede acudir ante la Secretaría Anticorrupción y Buen Gobierno, autoridad competente en materia de protección de datos personales conforme a la reforma 2025 de la LFPDPPP.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 12: Datos de contacto */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-teal-900">12. Datos de contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Para cualquier duda, aclaración o solicitud relacionada con esta Política de Privacidad o el tratamiento de sus datos personales, puede contactarnos:
              </p>

              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <div className="space-y-2">
                  <p className="text-teal-800"><strong>ZENTRY TECH GROUP S. DE R.L. DE C.V.</strong></p>
                  <p className="text-teal-800"><strong>Correo electrónico:</strong> zentry.app.mx@gmail.com</p>
                  <p className="text-teal-800"><strong>Horario de atención:</strong> Lunes a viernes de 9:00 a.m. a 6:00 p.m.</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 leading-relaxed text-center font-semibold">
                  Gracias por confiar en Zentry para la gestión de tu fraccionamiento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 