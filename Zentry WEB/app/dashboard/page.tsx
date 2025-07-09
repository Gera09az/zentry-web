"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRequired } from "@/lib/hooks";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building, 
  Bell, 
  ShieldAlert, 
  Home, 
  Settings, 
  UserCheck,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Activity,
  User,
  UserPlus,
  CalendarClock,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { AdminService, DashboardService } from "@/lib/services";
import StripeConnectCard from "@/components/dashboard/StripeConnectCard";
import type { 
  DashboardRealTimeStats, 
  PanicAlert, 
  ActiveVisitor, 
  ActiveRound, 
  RecentActivity, 
  SystemHealth 
} from "@/lib/services/dashboard-service";

// Interfaces para datos básicos del sistema
interface DashboardStats {
  totalUsers: number;
  totalResidenciales: number;
  totalAdmins: number;
  pendingUsers: number;
  activeUsers: number;
}

export default function DashboardPage() {
  // Proteger la ruta - este hook redirigirá automáticamente si no es admin
  const { isAdmin, isUserLoading } = useAdminRequired();
  const { user, userData, userClaims } = useAuth();
  
  // Estados para datos básicos del sistema
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para datos del dashboard en tiempo real
  const [realTimeStats, setRealTimeStats] = useState<DashboardRealTimeStats | null>(null);
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<ActiveVisitor[]>([]);
  const [activeRounds, setActiveRounds] = useState<ActiveRound[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
  // Estados de carga para cada sección
  const [loadingRealTime, setLoadingRealTime] = useState(true);
  const [loadingPanicAlerts, setLoadingPanicAlerts] = useState(true);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  
  // Obtener el ID del residencial que maneja este admin
  const esAdminDeResidencial = userClaims?.isResidencialAdmin === true;
  const residencialId = useMemo(() => esAdminDeResidencial ? userClaims?.managedResidencialId : null, [esAdminDeResidencial, userClaims]);
  
  // Cargar datos básicos del sistema
  const fetchBasicStats = async () => {
    try {
      console.log("Obteniendo estadísticas básicas del dashboard...");
      const systemStats = await AdminService.getSystemStats();
      setStats(systemStats);
    } catch (err: any) {
      console.error("Error obteniendo estadísticas básicas:", err);
      setError(err.message || "Error al cargar estadísticas básicas");
    }
  };
  
  // Cargar datos en tiempo real
  const fetchRealTimeData = async () => {
    try {
      setLoadingRealTime(true);
      console.log("Obteniendo estadísticas en tiempo real...");
      const realTimeData = await DashboardService.getRealTimeStats();
      setRealTimeStats(realTimeData);
    } catch (err: any) {
      console.error("Error obteniendo datos en tiempo real:", err);
    } finally {
      setLoadingRealTime(false);
    }
  };
  
  // Cargar alertas de pánico
  const fetchPanicAlerts = async () => {
    try {
      setLoadingPanicAlerts(true);
      console.log("Obteniendo alertas de pánico...");
      const alerts = await DashboardService.getPendingPanicAlerts();
      setPanicAlerts(alerts);
    } catch (err: any) {
      console.error("Error obteniendo alertas de pánico:", err);
    } finally {
      setLoadingPanicAlerts(false);
    }
  };
  
  // Cargar visitantes activos
  const fetchActiveVisitors = async () => {
    try {
      setLoadingVisitors(true);
      console.log("Obteniendo visitantes activos...");
      const visitors = await DashboardService.getActiveVisitors();
      setActiveVisitors(visitors);
    } catch (err: any) {
      console.error("Error obteniendo visitantes activos:", err);
    } finally {
      setLoadingVisitors(false);
    }
  };
  
  // Cargar rondas activas
  const fetchActiveRounds = async () => {
    try {
      setLoadingRounds(true);
      console.log("Obteniendo rondas activas...");
      const rounds = await DashboardService.getActiveRounds();
      setActiveRounds(rounds);
    } catch (err: any) {
      console.error("Error obteniendo rondas activas:", err);
    } finally {
      setLoadingRounds(false);
    }
  };
  
  // Cargar actividad reciente
  const fetchRecentActivity = async () => {
    try {
      setLoadingActivity(true);
      console.log("Obteniendo actividad reciente...");
      const activity = await DashboardService.getRecentActivity();
      setRecentActivity(activity);
    } catch (err: any) {
      console.error("Error obteniendo actividad reciente:", err);
    } finally {
      setLoadingActivity(false);
    }
  };
  
  // Cargar estado del sistema
  const fetchSystemHealth = async () => {
    try {
      console.log("Obteniendo estado del sistema...");
      const health = await DashboardService.getSystemHealth();
      setSystemHealth(health);
    } catch (err: any) {
      console.error("Error obteniendo estado del sistema:", err);
    }
  };
  
  // Función para cargar todos los datos
  const fetchAllData = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      
      // Cargar datos básicos y de estado del sistema en paralelo
      await Promise.all([
        fetchBasicStats(),
        fetchSystemHealth()
      ]);
      
      // Cargar datos en tiempo real en paralelo
      await Promise.all([
        fetchRealTimeData(),
        fetchPanicAlerts(),
        fetchActiveVisitors(),
        fetchActiveRounds(),
        fetchRecentActivity()
      ]);
      
    } catch (err: any) {
      console.error("Error obteniendo datos del dashboard:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoadingStats(false);
    }
  };
  
  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      
      // Configurar actualización periódica de datos
      const interval = setInterval(() => {
        fetchRealTimeData();
        fetchSystemHealth();
      }, 60000); // Actualizar cada minuto
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };
  
  // Renderizar skeleton durante la carga
  const renderStat = (value: number | undefined, label: string, icon: React.ReactNode, className?: string, isRealTime = false) => {
    const isLoading = isRealTime ? loadingRealTime : loadingStats;
    
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {label}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : error ? (
            <div className="text-destructive text-xs">Error al cargar</div>
          ) : (
            <div className="text-2xl font-bold">{value || 0}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Función para formatear tiempo relativo
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    
    return date.toLocaleDateString();
  };

  // Si está cargando o no es administrador, mostrar un indicador de carga
  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verificando permisos...</h2>
          <Progress value={60} className="w-64 mb-2" />
          <p className="text-muted-foreground">Por favor espere</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 lg:px-10">
      {/* Encabezado y botón de refresh */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bienvenido, {userData?.fullName || "Administrador"}
          </h2>
          <p className="text-muted-foreground">
            Panel de control de Zentry - Vista general del sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing || loadingStats}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar datos'}
        </Button>
      </div>

      {/* Indicador de error */}
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md">
          <p className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Error: {error}</span>
          </p>
        </div>
      )}

      {/* Pestañas del Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Vista General */}
        <TabsContent value="overview" className="space-y-4">
          {/* Estadísticas principales */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {renderStat(stats?.totalUsers, "Total de Usuarios", <Users className="h-4 w-4 text-blue-500" />)}
            {renderStat(stats?.activeUsers, "Usuarios Activos", <UserCheck className="h-4 w-4 text-green-500" />)}
            {renderStat(stats?.totalResidenciales, "Residenciales", <Building className="h-4 w-4 text-purple-500" />)}
            {renderStat(stats?.totalAdmins, "Administradores", <ShieldCheck className="h-4 w-4 text-amber-500" />)}
          </div>

          {/* Tarjeta de Stripe Connect - Solo para administradores de residencial */}
          {esAdminDeResidencial && residencialId && (
            <StripeConnectCard 
              residencialId={residencialId}
              className="mb-4"
            />
          )}
          
          {/* Estado del sistema y acciones rápidas */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Información en tiempo real del sistema Zentry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Servidor API</span>
                  <Badge variant="outline" className={
                    systemHealth?.apiStatus === 'operational' ? 'bg-green-50 text-green-700' : 
                    systemHealth?.apiStatus === 'degraded' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-red-50 text-red-700'
                  }>
                    {systemHealth?.apiStatus === 'operational' ? 'Operativo' : 
                     systemHealth?.apiStatus === 'degraded' ? 'Degradado' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Servicios de notificaciones</span>
                  <Badge variant="outline" className={
                    systemHealth?.notificationStatus === 'operational' ? 'bg-green-50 text-green-700' : 
                    systemHealth?.notificationStatus === 'degraded' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-red-50 text-red-700'
                  }>
                    {systemHealth?.notificationStatus === 'operational' ? 'Operativo' : 
                     systemHealth?.notificationStatus === 'degraded' ? 'Degradado' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Base de datos</span>
                  <Badge variant="outline" className={
                    systemHealth?.databaseStatus === 'operational' ? 'bg-green-50 text-green-700' : 
                    systemHealth?.databaseStatus === 'degraded' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-red-50 text-red-700'
                  }>
                    {systemHealth?.databaseStatus === 'operational' ? 'Operativa' : 
                     systemHealth?.databaseStatus === 'degraded' ? 'Degradada' : 'Inactiva'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Almacenamiento</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {systemHealth?.storageUsage ? `${100 - systemHealth.storageUsage}% disponible` : 'Cargando...'}
                    </div>
                    <Progress 
                      value={systemHealth?.storageUsage || 0} 
                      className="h-2 w-24" 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Última actualización</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth?.lastUpdate ? formatTimeAgo(systemHealth.lastUpdate) : 'Cargando...'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Gestión rápida de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Usuarios</p>
                    <p className="text-sm text-muted-foreground">
                      Administra residentes y usuarios del sistema
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/usuarios">Ir</Link>
                  </Button>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Home className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Residenciales</p>
                    <p className="text-sm text-muted-foreground">
                      Gestiona residenciales y propiedades
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/residenciales">Ir</Link>
                  </Button>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Alertas de Pánico</p>
                    <p className="text-sm text-muted-foreground">
                      Ver y gestionar alertas activas
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/alertas-panico">Ir</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña de Seguridad */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {renderStat(
              realTimeStats?.alertasPanico, 
              "Alertas de Pánico", 
              <ShieldAlert className="h-4 w-4 text-red-500" />,
              "border-l-4 border-red-500",
              true
            )}
            {renderStat(
              realTimeStats?.visitantesActivos, 
              "Visitantes Activos", 
              <UserPlus className="h-4 w-4 text-blue-500" />,
              undefined,
              true
            )}
            {renderStat(
              realTimeStats?.rondasActivas, 
              "Rondas en Curso", 
              <Activity className="h-4 w-4 text-green-500" />,
              undefined,
              true
            )}
          </div>
          
          {/* Alertas de pánico */}
          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                Alertas de Pánico Pendientes
              </CardTitle>
              <CardDescription>
                Alertas que requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPanicAlerts ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                panicAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {panicAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                          <div>
                            <p className="text-sm font-medium">
                              Alerta de {alert.userName} en {alert.address}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive">Atender</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No hay alertas pendientes
                  </p>
                )
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/alertas-panico">Ver todas las alertas</Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Visitantes Activos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 text-blue-500 mr-2" />
                Visitantes Activos
              </CardTitle>
              <CardDescription>
                Visitantes registrados actualmente en residenciales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVisitors ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                activeVisitors.length > 0 ? (
                  <div className="space-y-2">
                    {activeVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">
                              {visitor.visitorName} visita a {visitor.residentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duración esperada: {visitor.expectedDuration}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {formatTimeAgo(visitor.entryTime)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No hay visitantes activos
                  </p>
                )
              )}
            </CardContent>
          </Card>
          
          {/* Rondas de vigilancia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 text-green-500 mr-2" />
                Rondas de Vigilancia
              </CardTitle>
              <CardDescription>
                Rondas actualmente en curso y programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRounds ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                activeRounds.length > 0 ? (
                  <div className="space-y-2">
                    {activeRounds.map((round) => (
                      <div key={round.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center">
                          <CalendarClock className={`h-4 w-4 mr-2 ${
                            round.status === 'in_progress' ? 'text-green-500' : 'text-amber-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">
                              {round.status === 'in_progress' ? 'Ronda en curso' : 'Ronda programada'} - {round.residencialName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Guardia: {round.guardName}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          round.status === 'in_progress' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {round.status === 'in_progress' ? 'En curso' : 'Programada'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No hay rondas activas
                  </p>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Actividad Reciente */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas acciones y eventos en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                recentActivity.length > 0 ? (
                  <div className="space-y-8">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex">
                        <div className="relative mr-4">
                          <div className={`
                            h-9 w-9 rounded-full flex items-center justify-center
                            ${activity.type === 'alert' ? 'bg-red-100' : 
                              activity.type === 'visitor' || activity.type === 'entry' ? 'bg-blue-100' : 
                              activity.type === 'round' ? 'bg-green-100' : 'bg-gray-100'}
                          `}>
                            {activity.type === 'alert' && <Bell className="h-5 w-5 text-red-600" />}
                            {(activity.type === 'visitor' || activity.type === 'entry') && <User className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'round' && <Activity className="h-5 w-5 text-green-600" />}
                            {activity.type === 'user' && <Users className="h-5 w-5 text-gray-600" />}
                            {activity.type === 'event' && <CalendarClock className="h-5 w-5 text-purple-600" />}
                          </div>
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.message || activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No hay actividad reciente
                  </p>
                )
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                Ver todo el historial
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 