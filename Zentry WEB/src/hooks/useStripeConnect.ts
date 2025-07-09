import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFunctions, httpsCallable, Functions, FunctionsError } from "firebase/functions";
import { app } from '@/lib/firebase/config';

interface StripeConnectState {
  hasStripeAccount: boolean;
  stripeStatus: 'no_configurado' | 'pendiente' | 'verificado';
  loading: boolean;
  error: string | null;
}

interface StripeAccountDetails {
  stripeAccountId?: string;
  onboardingCompleted?: boolean;
  accountDetails?: {
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
  };
}

let functionsInstance: Functions;
let obtenerEstadoCuentaStripeCallable: any;
let crearCuentaStripeResidencialCallable: any;

try {
  functionsInstance = getFunctions(app, 'us-central1');
  console.log('[useStripeConnect MODULE] functionsInstance (fuera del hook, región explícita):', functionsInstance);

  // Volver a usar httpsCallable por nombre para evitar problemas de CORS
  obtenerEstadoCuentaStripeCallable = httpsCallable(functionsInstance, 'obtenerEstadoCuentaStripe');
  console.log('[useStripeConnect MODULE] obtenerEstadoCuentaStripeCallable (POR NOMBRE, fuera del hook):', obtenerEstadoCuentaStripeCallable);
  
  crearCuentaStripeResidencialCallable = httpsCallable(functionsInstance, 'crearCuentaStripeResidencial');
  console.log('[useStripeConnect MODULE] crearCuentaStripeResidencialCallable (POR NOMBRE, fuera del hook):', crearCuentaStripeResidencialCallable);

} catch (error) {
  console.error('[useStripeConnect MODULE] Error inicializando Functions o HttpsCallable:', error);
}

export const useStripeConnect = (residencialId: string | null) => {
  console.log('[useStripeConnect HOOK] Hook inicializado con residencialId:', residencialId);
  const { user } = useAuth();
  const [stripeConnectState, setStripeConnectState] = useState<StripeConnectState>({
    hasStripeAccount: false,
    stripeStatus: 'no_configurado',
    loading: true,
    error: null,
  });
  const [accountDetails, setAccountDetails] = useState<StripeAccountDetails>({});

  const fetchStripeStatus = async () => {
    if (!residencialId || !user) {
      console.log('[useStripeConnect fetchStripeStatus] residencialId o user no disponibles. residencialId:', residencialId, 'User:', user);
      setStripeConnectState({
        hasStripeAccount: false,
        stripeStatus: 'no_configurado',
        loading: false,
        error: "Residencial ID o usuario no disponible."
      });
      return;
    }

    if (!obtenerEstadoCuentaStripeCallable) {
      console.error('[useStripeConnect fetchStripeStatus] obtenerEstadoCuentaStripeCallable no está inicializada.');
      setStripeConnectState({
        hasStripeAccount: false,
        stripeStatus: 'no_configurado',
        loading: false,
        error: new Error('Error de configuración de funciones.').message
      });
      return;
    }

    setStripeConnectState(prevState => ({ ...prevState, loading: true, error: null }));
    console.log('[useStripeConnect fetchStripeStatus] Llamando a obtenerEstadoCuentaStripeCallable con residencialId:', residencialId);

    try {
      const result = await obtenerEstadoCuentaStripeCallable({ residencialId });
      console.log('[useStripeConnect fetchStripeStatus] Resultado de obtenerEstadoCuentaStripeCallable:', result);
      const data = result.data as StripeAccountDetails;
      
      if (data && data.stripeAccountId) {
        const status =
          data.accountDetails?.details_submitted && data.accountDetails?.charges_enabled
            ? 'verificado'
            : 'pendiente';
        setStripeConnectState({
          hasStripeAccount: true,
          stripeStatus: status,
          loading: false,
          error: null,
        });
      } else {
        setStripeConnectState({
          hasStripeAccount: false,
          stripeStatus: 'no_configurado',
          loading: false,
          error: null, // O un mensaje como "No se encontró cuenta de Stripe"
        });
      }

      setAccountDetails({
        stripeAccountId: data.stripeAccountId,
        onboardingCompleted: data.onboardingCompleted,
        accountDetails: data.accountDetails,
      });

    } catch (err: any) {
      console.error('[useStripeConnect fetchStripeStatus] Error al llamar a obtenerEstadoCuentaStripeCallable:', err);
      let errorMessage = "Error desconocido al obtener estado de Stripe.";
      if (err instanceof FunctionsError) {
        errorMessage = `Error de Functions (${err.code}): ${err.message}`;
      }
      setStripeConnectState({
        hasStripeAccount: false,
        stripeStatus: 'no_configurado',
        loading: false,
        error: errorMessage,
      });
    }
  };

  useEffect(() => {
    console.log('[useStripeConnect useEffect] Ejecutando. residencialId:', residencialId, 'User ID:', user?.uid);
    if (residencialId && user) {
      fetchStripeStatus();
    }
  }, [residencialId, user]);

  const iniciarOnboarding = async (adminEmail: string) => {
    if (!residencialId || !user) {
      console.log('[useStripeConnect iniciarOnboarding] residencialId o user no disponibles. residencialId:', residencialId, 'User:', user);
      setStripeConnectState(prevState => ({ ...prevState, error: "ID de residencial o usuario no disponible para iniciar onboarding." }));
      return null;
    }

    if (!crearCuentaStripeResidencialCallable) {
      console.error('[useStripeConnect iniciarOnboarding] crearCuentaStripeResidencialCallable no está inicializada.');
      setStripeConnectState(prevState => ({ 
        ...prevState, 
        loading: false,
        error: new Error('Error de configuración de funciones.').message 
      }));
      return null;
    }

    setStripeConnectState(prevState => ({ ...prevState, loading: true, error: null }));
    console.log('[useStripeConnect iniciarOnboarding] Llamando a crearCuentaStripeResidencialCallable con residencialId:', residencialId);

    try {
      const result = await crearCuentaStripeResidencialCallable({ residencialId, adminEmail });
      console.log('[useStripeConnect iniciarOnboarding] Resultado de crearCuentaStripeResidencialCallable:', result);
      const data = result.data as { onboardingUrl?: string; error?: string };

      if (data && data.onboardingUrl) {
        setStripeConnectState(prevState => ({ ...prevState, loading: false }));
        return data.onboardingUrl;
      } else {
        const errorMsg = data?.error || "No se recibió URL de onboarding.";
        console.error('[useStripeConnect iniciarOnboarding] Error en datos de respuesta:', errorMsg);
        setStripeConnectState(prevState => ({ ...prevState, loading: false, error: errorMsg }));
        return null;
      }
    } catch (err: any) {
      console.error('[useStripeConnect iniciarOnboarding] Error al llamar a crearCuentaStripeResidencialCallable:', err);
      let errorMessage = "Error desconocido al iniciar onboarding.";
      if (err instanceof FunctionsError) {
        errorMessage = `Error de Functions (${err.code}): ${err.message}`;
      }
      setStripeConnectState(prevState => ({ ...prevState, loading: false, error: errorMessage }));
      return null;
    }
  };

  return {
    ...stripeConnectState,
    accountDetails,
    fetchStripeStatus,
    iniciarOnboarding,
    refetch: fetchStripeStatus,
  };
}; 