"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TrendingUp, Users, Calendar, Building, Car, Download, FileSpreadsheet } from "lucide-react";
import { 
  Residencial, 
  getResidenciales,
  suscribirseAIngresos
} from "@/lib/firebase/firestore";
import { Ingreso, Timestamp as IngresoTimestamp } from "@/types/ingresos";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useIngresosFilters } from "@/hooks/useIngresosFilters";
import AdvancedFiltersBar from "@/components/dashboard/ingresos/AdvancedFiltersBar";
import PaginationControls from "@/components/dashboard/ingresos/PaginationControls";
import { exportToCSV, getExportStats } from "@/lib/utils/exportUtils";

// Importar dinámicamente TablaIngresos y DetallesIngresoDialogContent
const TablaIngresos = dynamic(() => import("@/components/dashboard/ingresos/TablaIngresos"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});

const DetallesIngresoDialogContent = dynamic(() => import("@/components/dashboard/ingresos/DetallesIngresoDialogContent"), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});

// Función para convertir timestamp de Firestore a Date
const convertFirestoreTimestampToDate = (timestamp: IngresoTimestamp | Date | string): Date => {
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(); 
};

// Función para capitalizar nombres
const capitalizeName = (name: string): string => {
  return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export default function IngresosPage() {
  const router = useRouter();
  const { user, userClaims, loading: authLoading } = useAuth();

  // Estados principales
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [mapeoResidenciales, setMapeoResidenciales] = useState<{[key: string]: string}>({});
  const [residencialFilter, setResidencialFilter] = useState<string>("todos");

  // Debug logs
  const [logs, setLogs] = useState<string[]>([]);
  
  // Hook de filtros avanzados - DEBE estar antes de cualquier return condicional
  const {
    filters,
    filteredIngresos,
    paginatedIngresos,
    updateFilters,
    resetFilters,
    setQuickFilter,
    filterOptions,
    totalPages,
    hasActiveFilters,
    totalResults,
    currentResults
  } = useIngresosFilters(ingresos);

  // Todos los demás hooks y memos
  const addLog = useCallback((message: string) => { 
    const timestampLog = new Date().toLocaleTimeString();
    const logMessage = `[${timestampLog}] ${message}`;
    setLogs(prevLogs => [logMessage, ...prevLogs.slice(0, 199)]);
  }, []);

  // Verificar permisos de usuario
  const esAdminDeResidencial = useMemo(() => 
    userClaims?.isResidencialAdmin && !userClaims?.isGlobalAdmin, 
    [userClaims]
  );
  
  const residencialCodigoDelAdmin = useMemo(() => 
    esAdminDeResidencial ? userClaims?.managedResidencialId : null, 
    [esAdminDeResidencial, userClaims]
  );
  
  const residencialIdDocDelAdmin = useMemo(() => {
    if (!esAdminDeResidencial || !residencialCodigoDelAdmin || Object.keys(mapeoResidenciales).length === 0) return null;
    const idDoc = Object.keys(mapeoResidenciales).find(
      key => residenciales.find(r => r.id === key)?.residencialID === residencialCodigoDelAdmin
    );
    return idDoc || null;
  }, [esAdminDeResidencial, residencialCodigoDelAdmin, mapeoResidenciales, residenciales]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = ingresos.length;
    const activos = ingresos.filter(i => i.status === 'active').length;
    const completados = ingresos.filter(i => i.status === 'completed').length;
    const conVehiculo = ingresos.filter(i => i.vehicleInfo).length;
    
    return { total, activos, completados, conVehiculo };
  }, [ingresos]);
    
  // Función para obtener nombre del residencial
  const getResidencialNombre = useCallback((docId: string | undefined): string => {
    if (!docId) return "Desconocido";
    return mapeoResidenciales[docId] || 
           residenciales.find(r => r.id === docId)?.nombre || 
           "Desconocido";
  }, [mapeoResidenciales, residenciales]);
    
  // Función para abrir detalles
  const handleOpenDetails = useCallback((ingreso: Ingreso) => {
    setSelectedIngreso(ingreso);
    setDetailsOpen(true);
  }, []);

  // Función para exportar datos
  const handleExport = useCallback(() => {
    const dataToExport = hasActiveFilters ? filteredIngresos : ingresos;
    exportToCSV(dataToExport, getResidencialNombre);
    toast.success(`Exportados ${dataToExport.length} registros a CSV`);
  }, [filteredIngresos, ingresos, hasActiveFilters, getResidencialNombre]);
      
  // Función para formatear fechas
  const formatDateToRelative = useCallback((timestamp: IngresoTimestamp | Date | string) => {
    try {
      const date = convertFirestoreTimestampToDate(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
        } catch (error) {
      return "Fecha inválida";
        }
  }, []);

  const formatDateToFull = useCallback((timestamp: IngresoTimestamp | Date | string) => {
    try {
      const date = convertFirestoreTimestampToDate(timestamp);
      return format(date, "dd/MM/yyyy, h:mm:ss a", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  }, []);

  // Cargar residenciales
  useEffect(() => {
    const fetchResidenciales = async () => {
      try {
        addLog("🏢 Cargando residenciales...");
        const residencialesData = await getResidenciales();
        setResidenciales(residencialesData);
        
        const mapeo = residencialesData.reduce<{[key: string]: string}>((acc, r) => {
          if (r.id && r.nombre) acc[r.id] = r.nombre;
          return acc;
        }, {});
        setMapeoResidenciales(mapeo);
        addLog(`✅ ${residencialesData.length} residenciales cargados`);

        // Configurar filtro para admin de residencial
        if (esAdminDeResidencial && residencialCodigoDelAdmin) {
           const idDocAdmin = residencialesData.find(r => r.residencialID === residencialCodigoDelAdmin)?.id;
          if (idDocAdmin) {
            setResidencialFilter(idDocAdmin);
            updateFilters({ residencialId: idDocAdmin });
            addLog(`👤 Admin de Residencial detectado: ${residencialCodigoDelAdmin}`);
          }
        }
      } catch (error) {
        addLog(`❌ Error al cargar residenciales: ${error}`);
        toast.error("Error al cargar residenciales");
      }
    };

    if (userClaims?.isGlobalAdmin || esAdminDeResidencial) {
        fetchResidenciales();
    }
  }, [userClaims, esAdminDeResidencial, residencialCodigoDelAdmin, addLog, updateFilters]);

  // Configurar suscripciones a ingresos
  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const setupSubscriptions = async () => {
      if (authLoading) {
        addLog("⏳ Autenticación en curso...");
        return;
      }
      
      if (!userClaims?.isGlobalAdmin && !esAdminDeResidencial) {
        addLog("🚫 Usuario no autorizado");
        setLoading(false);
        return;
      }

      if (Object.keys(mapeoResidenciales).length === 0 && !esAdminDeResidencial && residencialFilter !== "todos") {
        addLog("⏳ Esperando carga de residenciales...");
         return;
      }

      if (esAdminDeResidencial && !residencialIdDocDelAdmin) {
        addLog("⏳ Esperando configuración de admin...");
        return;
      }

      setLoading(true);
      addLog(`🔔 Configurando suscripciones. Filtro: ${residencialFilter}`);

      // Limpiar suscripciones anteriores
      unsubscribes.forEach(unsub => unsub());
      unsubscribes = [];
      setIngresos([]);

      const handleNewIngresos = (nuevosIngresos: Ingreso[], residencialDocId: string, nombreResidencial?: string) => {
        const ingresosConMetadata = nuevosIngresos.map(ing => ({
          ...ing,
          _residencialDocId: residencialDocId,
          _residencialNombre: nombreResidencial || mapeoResidenciales[residencialDocId] || "Desconocido"
        }));

        setIngresos(prevIngresos => {
          const otrosIngresos = prevIngresos.filter(i => i._residencialDocId !== residencialDocId);
          const todos = [...otrosIngresos, ...ingresosConMetadata];
          todos.sort((a, b) => {
            const dateA = convertFirestoreTimestampToDate(a.timestamp).getTime();
            const dateB = convertFirestoreTimestampToDate(b.timestamp).getTime();
            return dateB - dateA;
          });
          return todos;
        });
        setLoading(false);
      };
      
      if (residencialFilter === "todos" && userClaims?.isGlobalAdmin) {
        addLog("🌎 Admin Global: Suscribiéndose a todos los residenciales");
        if (residenciales.length === 0) {
          addLog("⏳ No hay residenciales cargados");
          setLoading(false);
            return;
        }
        
        residenciales.forEach(residencial => {
          if (residencial.id) {
            addLog(`🔔 Suscripción a: ${residencial.nombre}`);
            const unsubscribe = suscribirseAIngresos(residencial.id, (nuevosIngresos) => {
              handleNewIngresos(nuevosIngresos, residencial.id!, residencial.nombre);
            });
            unsubscribes.push(unsubscribe);
          }
        });
      } else if (residencialFilter !== "todos") {
        const targetResidencialId = esAdminDeResidencial ? residencialIdDocDelAdmin : residencialFilter;
        if (targetResidencialId) {
          const nombreRes = getResidencialNombre(targetResidencialId);
          addLog(`🔔 Suscripción específica a: ${nombreRes}`);
          const unsubscribe = suscribirseAIngresos(targetResidencialId, (nuevosIngresos) => {
            handleNewIngresos(nuevosIngresos, targetResidencialId, nombreRes);
          });
          unsubscribes.push(unsubscribe);
        } else {
          addLog("⚠️ No se pudo determinar el residencial");
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      addLog(`🛑 Cancelando ${unsubscribes.length} suscripciones`);
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [residencialFilter, residenciales, authLoading, userClaims, esAdminDeResidencial, 
      residencialIdDocDelAdmin, mapeoResidenciales, addLog, getResidencialNombre]);

  // Mostrar loading durante autenticación
  if (authLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
        </div>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
            </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar permisos
  if (!userClaims?.isGlobalAdmin && !esAdminDeResidencial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Building className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Acceso Denegado</h2>
        <p className="text-muted-foreground text-center max-w-md">
          No tienes permisos para ver los ingresos. Contacta al administrador si crees que esto es un error.
        </p>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
          <p className="text-muted-foreground">
          Monitorea y gestiona todos los ingresos del sistema en tiempo real
        </p>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {currentResults} filtrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activos}</div>
            <p className="text-xs text-muted-foreground">
              En el residencial
            </p>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completados}</div>
            <p className="text-xs text-muted-foreground">
              Han salido
            </p>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Vehículo</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conVehiculo}</div>
            <p className="text-xs text-muted-foreground">
              Registraron vehículo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Avanzados */}
      <AdvancedFiltersBar
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        setQuickFilter={setQuickFilter}
        filterOptions={filterOptions}
        hasActiveFilters={hasActiveFilters}
        totalResults={totalResults}
        currentResults={currentResults}
        onExport={handleExport}
        getResidencialNombre={getResidencialNombre}
      />

      {/* Tabla de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Ingresos</span>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Actualizando...
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Gestiona los ingresos con filtros avanzados y búsqueda en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <TablaIngresos 
              ingresos={paginatedIngresos}
              onOpenDetails={handleOpenDetails}
              loading={loading}
              formatDateToRelative={formatDateToRelative}
              formatDateToFull={formatDateToFull}
              getResidencialNombre={getResidencialNombre}
            />
          </Suspense>
        </CardContent>
      </Card>
      
      {/* Paginación */}
      <PaginationControls
        currentPage={filters.currentPage}
        totalPages={totalPages}
        pageSize={filters.pageSize}
        totalResults={totalResults}
        currentResults={currentResults}
        onPageChange={(page) => updateFilters({ currentPage: page })}
        onPageSizeChange={(pageSize) => updateFilters({ pageSize })}
      />

      {/* Dialog de Detalles */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Ingreso</DialogTitle>
            <DialogDescription>
              Información completa del registro de ingreso
            </DialogDescription>
          </DialogHeader>
          {selectedIngreso && (
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <DetallesIngresoDialogContent 
              selectedIngreso={selectedIngreso}
              formatDateToFull={formatDateToFull}
            />
          </Suspense>
        )}
        </DialogContent>
      </Dialog>

      {/* Debug Logs (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && logs.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1">
              {logs.slice(0, 10).map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 