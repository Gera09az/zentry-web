'use client';

import { ArrowLeft, Shield, FileText, Users, CreditCard, Home, AlertTriangle, Clock, Gavel, Building, Smartphone, Lock, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/register">
              <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al registro
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gavel className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
                <p className="text-gray-600 font-medium">ZENTRY TECH GROUP S. DE R.L. DE C.V.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Información inicial */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-blue-900">Términos y Condiciones de Uso para Residentes</h2>
                <p className="text-blue-700 font-medium">ZENTRY TECH GROUP S. DE R.L. DE C.V.</p>
                <p className="text-sm text-blue-600">
                  <strong>Última actualización:</strong> 11 de junio de 2025
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 1: ¿Qué es Zentry? */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900">1. ¿Qué es Zentry?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Zentry es una aplicación móvil que facilita la comunicación entre residentes de fraccionamientos.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-3">Con Zentry puedes:</p>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Generar códigos QR para acceso de visitantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Realizar pagos de mantenimiento mediante Stripe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reservar áreas comunes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Usar el botón de pánico para emergencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comunicarte con la administración y otros residentes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sección 2: Bienvenido a Zentry */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-900">2. Bienvenido a Zentry</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Gracias por formar parte de tu comunidad a través de Zentry. Esta app está pensada para que, como residente, tengas el control y la tranquilidad de lo que pasa en tu fraccionamiento. Estos Términos explican de forma sencilla cómo usar la app y qué se espera de ti.
              </p>
            </CardContent>
          </Card>

          {/* Sección 3: ¿Qué puedes hacer como residente? */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-900">3. ¿Qué puedes hacer como residente?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-3">Con tu cuenta de residente puedes:</p>
                <ul className="space-y-2 text-purple-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Autorizar visitas (esporádicas, frecuentes o para eventos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Hacer tus pagos de mantenimiento de forma fácil y segura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Conocer el estado de tu cuenta y descargar comprobantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reservar áreas comunes como salón de fiestas, cancha deportiva, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Estar al tanto de avisos importantes sobre tu fraccionamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reportar situaciones de emergencia mediante el botón de pánico</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sección 4: Tu cuenta y tus datos */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-orange-900">4. Tu cuenta y tus datos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Para registrarte necesitas ser mayor de edad y contar con la aprobación del administrador del fraccionamiento.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Al registrarte, deberás subir documentos que comprueben que eres residente (INE, contrato de arrendamiento, etc.).
              </p>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 leading-relaxed">
                  Tu información está protegida y solo se usa para el funcionamiento de la app. Puedes consultar nuestro Aviso de Privacidad deslizando hacia la izquierda en la sección de Política de Privacidad.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Nos regimos por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, reformada y vigente desde el 21 de marzo de 2025.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed">
                  Si deseas ejercer tus Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición), puedes enviar un correo a: <strong>zentry.app.mx@gmail.com</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 5: Uso adecuado */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-yellow-900">5. Uso adecuado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-900 mb-3">Te pedimos usar la app de forma responsable:</p>
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>No compartas códigos QR con personas no autorizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Los pagos fuera de la plataforma son directamente con el administrador del fraccionamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>No subas contenido ofensivo o falso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Si notas un error o falla, repórtalo por el chat o al correo zentry.app.mx@gmail.com</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mantén actualizada tu información de contacto</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sección 6: Pagos y comprobantes */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900">6. Pagos y comprobantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Podrás pagar tus cuotas directamente desde la app mediante Stripe.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed mb-2">
                  <strong>Zentry no almacena ni procesa directamente los datos de tu tarjeta.</strong> Somos solo un intermediario para facilitar el pago.
                </p>
                <p className="text-blue-800 leading-relaxed">
                  Stripe es quien maneja de forma segura tus datos financieros bajo estándares internacionales.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Podrás descargar tus comprobantes desde la app.
              </p>
            </CardContent>
          </Card>

          {/* Sección 7: Reservas y áreas comunes */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-900">7. Reservas y áreas comunes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Podrás ver disponibilidad y reservar desde tu celular.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Las reglas de uso de cada área son definidas por el administrador.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Respetar los horarios y condiciones de uso es responsabilidad de cada residente.
              </p>
            </CardContent>
          </Card>

          {/* Sección 8: Emergencias y seguridad */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-900">8. Emergencias y seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                El botón de pánico envía una alerta de comunicación a caseta y al administrador en caso de emergencia.
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-bold text-red-900 mb-3">IMPORTANTE:</p>
                <p className="text-red-800 leading-relaxed mb-3">
                  Esta función NO garantiza respuesta inmediata ni intervención física de seguridad.
                </p>
                <p className="text-red-800 leading-relaxed mb-2">Es una herramienta de comunicación que depende de:</p>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Disponibilidad del personal de caseta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Conectividad a internet en el momento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Que alguien esté monitoreando las alertas</span>
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 leading-relaxed">
                  <strong>En emergencias reales, siempre contacta directamente al 911 o autoridades competentes.</strong>
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                No uses esta función sin motivo real; el mal uso puede resultar en suspensión de tu cuenta.
              </p>
            </CardContent>
          </Card>

          {/* Sección 9: Cancelación o baja de la app */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-900">9. Cancelación o baja de la app</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Puedes darte de baja en cualquier momento solicitándolo al administrador.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Al salir del fraccionamiento, deberás cerrar tu cuenta.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  <strong>Al cerrar tu cuenta, se eliminarán todos tus datos personales de la plataforma.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 10: Notificaciones y cambios en el servicio */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-indigo-900">10. Notificaciones y cambios en el servicio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                La app podrá enviarte notificaciones push relacionadas con accesos, pagos, reservas y temas de seguridad.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Algunas funcionalidades podrían agregarse o retirarse conforme evolucione la plataforma, siempre buscando mejorar la experiencia del usuario.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-indigo-800 leading-relaxed">
                  <strong>Los cambios importantes en estos términos se notificarán con al menos 15 días de anticipación.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 11: Soporte y ayuda */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-teal-900">11. Soporte y ayuda</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Si tienes dudas o necesitas ayuda, escríbenos a <strong>zentry.app.mx@gmail.com</strong>.
              </p>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-teal-800 leading-relaxed">
                  <strong>El horario de atención es de lunes a viernes de 9 a.m. a 6 p.m.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 12: Legal */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-900">12. Legal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Estos términos se rigen por las leyes mexicanas.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Usar Zentry implica que aceptas estas condiciones.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-purple-800 leading-relaxed">
                  <strong>Cualquier controversia se atenderá ante tribunales del estado de Baja California.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 13: Limitación de responsabilidad */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-900">13. Limitación de responsabilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Zentry facilita la comunicación y gestión entre residentes, pero no se hace responsable por:
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Daños o pérdidas derivados del mal uso de códigos QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fallas en el internet o servicios de terceros</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Decisiones del administrador o comité de tu fraccionamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accidentes o incidentes en áreas comunes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pérdida temporal de datos por mantenimientos</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  <strong>El servicio se proporciona "tal como está" y buscamos la mejor experiencia posible dentro de nuestras capacidades.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 14: Propiedad intelectual */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-900">14. Propiedad intelectual</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Zentry, su logotipo, diseño y funcionalidades son propiedad de ZENTRY TECH GROUP S. DE R.L. DE C.V.
              </p>
              <p className="text-gray-700 leading-relaxed">
                No puedes copiar, modificar o distribuir ningún elemento de la aplicación sin autorización escrita.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 leading-relaxed">
                  <strong>Al usar la app, te otorgamos una licencia limitada y revocable solo para el uso personal dentro de tu fraccionamiento.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 15: Transferencia de cuenta */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-yellow-900">15. Transferencia de cuenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Si vendes tu propiedad o te mudas:
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <ul className="space-y-2 text-yellow-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Debes notificar al administrador inmediatamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tu cuenta será desactivada al confirmar el cambio de propietario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Los nuevos propietarios deberán crear una cuenta nueva</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>No se pueden transferir datos de pagos o historial entre cuentas</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-bold text-red-900 mb-2">IMPORTANTE:</p>
                <p className="text-red-800 leading-relaxed mb-2">
                  Si dejaste de vivir en el fraccionamiento y no cerraste tu cuenta, por seguridad tu acceso será revocado por el administrador.
                </p>
                <p className="text-red-800 leading-relaxed">
                  <strong>Siempre solicita el cierre formal si cambias de domicilio, esto protege tanto tu información como la seguridad del fraccionamiento.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sección 16: Actualizaciones y compatibilidad */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-green-900">16. Actualizaciones y compatibilidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Para garantizar la seguridad y funcionamiento óptimo:
              </p>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong>Es obligatorio mantener la app actualizada a la última versión</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Zentry requiere Android 8 o iOS 13 como mínimo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Algunas funciones pueden no estar disponibles en versiones antiguas del sistema operativo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Zentry se reserva el derecho de discontinuar soporte para versiones muy antiguas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Las actualizaciones se notificarán a través de las tiendas de aplicaciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Por seguridad, algunas funciones críticas pueden requerir versiones específicas</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje final */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center p-6">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-xl font-semibold text-blue-900 leading-relaxed">
                  Gracias por hacer comunidad con Zentry. Estamos para ayudarte a vivir tranquilo, conectado y seguro.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-900">Información de Contacto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> zentry.app.mx@gmail.com</p>
                  <p className="text-gray-700"><strong>Horario de atención:</strong> Lunes a viernes de 9 a.m. a 6 p.m.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Empresa:</strong> ZENTRY TECH GROUP S. DE R.L. DE C.V.</p>
                  <p className="text-gray-700"><strong>Versión:</strong> 1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 