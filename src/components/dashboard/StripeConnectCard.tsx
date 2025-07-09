import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Building2, 
  Loader2,
  ExternalLink,
  DollarSign
} from "lucide-react";

interface StripeConnectCardProps {
  residencialId: string | null;
  className?: string;
}

const StripeConnectCard: React.FC<StripeConnectCardProps> = ({ 
  residencialId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { 
    hasStripeAccount, 
    stripeStatus, 
    loading, 
    error, 
    accountDetails,
    iniciarOnboarding, 
    refetch 
  } = useStripeConnect(residencialId);

  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false);

  const handleIniciarOnboarding = async () => {
    if (!user?.email) {
      alert('No se pudo obtener el email del usuario');
      return;
    }

    setIsStartingOnboarding(true);
    try {
      await iniciarOnboarding(user.email);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al iniciar onboarding: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsStartingOnboarding(false);
    }
  };

  const getStatusInfo = () => {
    switch (stripeStatus) {
      case 'verificado':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: '¡Cuenta Bancaria Activada!',
          description: 'Tu residencial puede recibir pagos directamente en su cuenta bancaria.',
          actionLabel: null,
        };
      case 'pendiente':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Configuración Pendiente',
          description: 'La cuenta de Stripe ha sido creada pero necesitas completar la verificación.',
          actionLabel: 'Completar verificación',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Cuenta Bancaria No Activada',
          description: 'Este residencial aún no ha conectado una cuenta bancaria para recibir pagos.',
          actionLabel: 'Activar cuenta bancaria',
        };
    }
  };

  if (loading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={refetch} 
            className="mt-3"
            size="sm"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={`${className} ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Estado de Cuenta Bancaria
        </CardTitle>
        <CardDescription>
          Configuración de pagos para tu residencial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado Principal */}
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-sm text-gray-600">
              {statusInfo.description}
            </p>
          </div>
          <Badge variant={stripeStatus === 'verificado' ? 'default' : 'secondary'}>
            {stripeStatus === 'verificado' ? '✅ Activa' : 
             stripeStatus === 'pendiente' ? '⏳ Pendiente' : '❌ No configurada'}
          </Badge>
        </div>

        {/* Detalles de la cuenta si existe */}
        {hasStripeAccount && accountDetails.accountDetails && (
          <div className="bg-white/60 p-3 rounded-lg border">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Detalles de la Cuenta
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded ${accountDetails.accountDetails.charges_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Pagos: {accountDetails.accountDetails.charges_enabled ? '✅' : '❌'}
              </div>
              <div className={`p-2 rounded ${accountDetails.accountDetails.payouts_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Retiros: {accountDetails.accountDetails.payouts_enabled ? '✅' : '❌'}
              </div>
              <div className={`p-2 rounded ${accountDetails.accountDetails.details_submitted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Datos: {accountDetails.accountDetails.details_submitted ? '✅' : '❌'}
              </div>
            </div>
            {accountDetails.stripeAccountId && (
              <p className="text-xs text-gray-500 mt-2">
                ID: {accountDetails.stripeAccountId}
              </p>
            )}
          </div>
        )}

        {/* Botón de acción */}
        {statusInfo.actionLabel && (
          <Button 
            onClick={handleIniciarOnboarding}
            disabled={isStartingOnboarding}
            className="w-full"
            variant={stripeStatus === 'verificado' ? 'outline' : 'default'}
          >
            {isStartingOnboarding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirigiendo a Stripe...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                {statusInfo.actionLabel}
              </>
            )}
          </Button>
        )}

        {/* Beneficios si está verificado */}
        {stripeStatus === 'verificado' && (
          <div className="bg-white/80 p-3 rounded-lg border border-green-200">
            <h4 className="font-medium text-sm text-green-800 mb-2 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Beneficios Activos
            </h4>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Recibe pagos directamente en tu cuenta bancaria</li>
              <li>• Transferencias automáticas según tu configuración</li>
              <li>• Reportes detallados de ingresos</li>
              <li>• Cumplimiento automático con regulaciones fiscales</li>
            </ul>
          </div>
        )}

        {/* Información adicional para estados no verificados */}
        {stripeStatus !== 'verificado' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {stripeStatus === 'pendiente' 
                ? 'Completa la verificación de tu cuenta para empezar a recibir pagos.'
                : 'Una vez configurada, los residentes podrán realizar pagos que se transferirán directamente a tu cuenta bancaria.'
              }
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeConnectCard; 