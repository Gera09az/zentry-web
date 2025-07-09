import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, CheckCircle, CreditCard, Loader2, ExternalLink } from "lucide-react";

interface StripeConnectAlertProps {
  residencialId: string | null;
  className?: string;
}

const StripeConnectAlert: React.FC<StripeConnectAlertProps> = ({ 
  residencialId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { 
    hasStripeAccount, 
    stripeStatus, 
    loading, 
    error, 
    iniciarOnboarding 
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

  if (loading) {
    return (
      <div className={`${className} space-y-2`}>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al verificar estado de cuenta bancaria: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No mostrar nada si la cuenta ya está verificada
  if (stripeStatus === 'verificado') {
    return (
      <Alert className={`${className} border-green-200 bg-green-50`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-800">
              ✅ Cuenta bancaria configurada y verificada
            </span>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Activa
            </Badge>
          </div>
          <CreditCard className="h-4 w-4 text-green-600" />
        </AlertDescription>
      </Alert>
    );
  }

  const isWarning = stripeStatus === 'pendiente';
  const alertVariant = isWarning ? 'default' : 'destructive';
  const bgColor = isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const textColor = isWarning ? 'text-yellow-800' : 'text-red-800';
  const icon = isWarning ? CheckCircle : AlertTriangle;
  const IconComponent = icon;

  return (
    <Alert variant={alertVariant} className={`${className} ${bgColor}`}>
      <IconComponent className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`font-medium ${textColor}`}>
            {isWarning 
              ? '⏳ Configuración de cuenta bancaria pendiente' 
              : '⚠️ Cuenta bancaria no configurada'
            }
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {isWarning 
              ? 'Completa la verificación para empezar a recibir pagos automáticamente.'
              : 'Los pagos no se transferirán automáticamente hasta configurar la cuenta bancaria.'
            }
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Badge variant="outline" className={isWarning ? 'border-yellow-300 text-yellow-700' : 'border-red-300 text-red-700'}>
            {isWarning ? 'Pendiente' : 'No configurada'}
          </Badge>
          <Button 
            variant={isWarning ? "outline" : "default"}
            size="sm"
            onClick={handleIniciarOnboarding}
            disabled={isStartingOnboarding}
            className="min-w-fit"
          >
            {isStartingOnboarding ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3 mr-2" />
                {isWarning ? 'Completar' : 'Configurar'}
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StripeConnectAlert; 