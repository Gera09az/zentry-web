"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  getResidenciales, 
  getAreasComunes, 
  crearAreaComun, 
  actualizarAreaComun, 
  eliminarAreaComun,
  suscribirseAAreasComunes,
  Residencial,
  AreaComun as FirebaseAreaComun
} from "@/lib/firebase/firestore";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth, UserClaims } from "@/contexts/AuthContext";
import dynamic from 'next/dynamic';

// Importar dinámicamente AreaComunFormDialogContent
const AreaComunFormDialogContent = dynamic(() => import('@/components/dashboard/areas-comunes/AreaComunFormDialogContent'), {
  suspense: true,
});

// Importar dinámicamente ConfirmarEliminarAreaComunDialogContent
const ConfirmarEliminarAreaComunDialogContent = dynamic(() => import('@/components/dashboard/areas-comunes/ConfirmarEliminarAreaComunDialogContent'), {
  suspense: true,
});

// Importar TablaAreasComunes (no dinámico por ahora)
import TablaAreasComunes from "@/components/dashboard/areas-comunes/TablaAreasComunes";

interface AreaComun extends FirebaseAreaComun {
  _residencialIdDoc?: string;
}

interface Reglamento {
  maxHorasPorReserva: number;
  maxReservasPorDia: number;
  maxReservasPorSemana: number;
  maxReservasPorMes: number;
  antelacionMinima: number; // horas
  antelacionMaxima: number; // días
  cancelacionMinima: number; // horas antes
  permiteInvitados: boolean;
  maxInvitados: number; // Número total de personas por casa (residente + invitados)
  requiereAprobacion: boolean;
  permiteReservasSimultaneas: boolean; // Permite que múltiples casas reserven al mismo tiempo
  maxCasasSimultaneas: number; // Máximo número de casas que pueden reservar simultáneamente
  diasDeshabilitados: string[]; // Fechas específicas deshabilitadas en formato YYYY-MM-DD
  diasSemanaDeshabilitados: string[]; // Días de la semana deshabilitados permanentemente
  // 🆕 NUEVAS PROPIEDADES PARA CONTROL DE RESERVAS
  tipoReservas: 'bloques' | 'traslapes'; // Tipo de reservas: por bloques fijos o con traslapes
  permiteTraslapes: boolean; // Permite que las reservas se superpongan en tiempo
  // 🆕 NUEVA PROPIEDAD PARA HORAS DESHABILITADAS EN DÍAS ESPECÍFICOS
  horasDeshabilitadas: {
    [diaSemana: string]: {
      inicio: string; // formato "HH:MM"
      fin: string;   // formato "HH:MM"
      motivo?: string; // motivo opcional de la deshabilitación
    }[];
  };

  horarios: {
    entreSemana: {
      apertura: string;
      cierre: string;
    };
    finDeSemana: {
      apertura: string;
      cierre: string;
    };
    diasDisponibles: string[];
  };
}

interface AreaComunFormData {
  nombre: string;
  descripcion: string;
  capacidad: number;
  esDePago: boolean;
  precio?: number;
  activa: boolean;
  reglamento: Reglamento;
}

export default function AreasComunesPage() {
  const router = useRouter();
  const { user, userClaims, loading: authLoading } = useAuth();

  const [areasComunes, setAreasComunes] = useState<AreaComun[]>([]);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [residencialFilter, setResidencialFilter] = useState<string>("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<AreaComun | null>(null);
  const [selectedResidencialId, setSelectedResidencialId] = useState<string>("");
  const [formData, setFormData] = useState<AreaComunFormData>({
    nombre: "",
    descripcion: "",
    capacidad: 50,
    esDePago: false,
    precio: 0,
    activa: true,
    reglamento: {
      maxHorasPorReserva: 4,
      maxReservasPorDia: 1,
      maxReservasPorSemana: 3,
      maxReservasPorMes: 10,
      antelacionMinima: 24,
      antelacionMaxima: 30,
      cancelacionMinima: 2,
      permiteInvitados: true,
      maxInvitados: 6,
      requiereAprobacion: false,
      permiteReservasSimultaneas: false,
      maxCasasSimultaneas: 1,
      diasDeshabilitados: [],
      diasSemanaDeshabilitados: [],
      // 🆕 NUEVAS PROPIEDADES PARA CONTROL DE RESERVAS
      tipoReservas: 'bloques' as const,
      permiteTraslapes: false,
      // 🆕 NUEVA PROPIEDAD PARA HORAS DESHABILITADAS
      horasDeshabilitadas: {},
      horarios: {
        entreSemana: {
          apertura: "08:00",
          cierre: "22:00"
        },
        finDeSemana: {
          apertura: "09:00",
          cierre: "23:00"
        },
        diasDisponibles: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
      }
    }
  });
  const [mapeoResidenciales, setMapeoResidenciales] = useState<{[key: string]: string}>({});

  const esAdminDeResidencial = useMemo(() => (
    !!userClaims && userClaims.role === 'admin' && !userClaims.isGlobalAdmin &&
    ((userClaims as any).managedResidencials?.length > 0 || !!(userClaims as any).residencialId)
  ), [userClaims]);
  const residencialCodigoDelAdmin = useMemo(() => {
    if (!esAdminDeResidencial) return null;
    return (userClaims as any)?.managedResidencials?.[0] || (userClaims as any)?.residencialId || null;
  }, [esAdminDeResidencial, userClaims]);

  const convertirHora = useCallback((hora24: string): string => {
    const [hour, minute] = hora24.split(':');
    const hora = parseInt(hour);
    if (hora === 0) return `12:${minute} AM`;
    if (hora === 12) return `12:${minute} PM`;
    if (hora > 12) return `${hora - 12}:${minute} PM`;
    return `${hora}:${minute} AM`;
  }, []);

  const cargarTodosLosResidenciales = useCallback(async () => {
    try {
      const residencialesData = await getResidenciales();
      setResidenciales(residencialesData);
      const mapeo: {[key: string]: string} = {};
      residencialesData.forEach(r => {
        if (r.id && r.residencialID) {
          mapeo[r.id] = r.residencialID;
        }
      });
      setMapeoResidenciales(mapeo);
      return residencialesData;
    } catch (error) {
      console.error("Error al cargar todos los residenciales:", error);
      toast.error("Error al cargar lista de residenciales");
      return [];
    }
  }, []);
  
  const cargarAreasDeResidencial = useCallback(async (idDocResidencial: string): Promise<AreaComun[]> => {
    if (!idDocResidencial) return [];
    try {
      const areas = await getAreasComunes(idDocResidencial);
      return areas.map(area => ({ ...area, _residencialIdDoc: idDocResidencial }));
    } catch (error) {
      console.error(`Error al cargar áreas para ${idDocResidencial}:`, error);
      toast.error(`Error al cargar áreas de un residencial`);
      return [];
    }
  }, []);

  const cargarAreasDeTodosLosResidenciales = useCallback(async (listaResidenciales: Residencial[]): Promise<AreaComun[]> => {
    const todasLasAreasPromises = listaResidenciales
      .filter(r => r.id)
      .map(r => cargarAreasDeResidencial(r.id!));
    const arraysDeAreas = await Promise.all(todasLasAreasPromises);
    return arraysDeAreas.flat();
  }, [cargarAreasDeResidencial]);

  useEffect(() => {
    const cargarDatosAreas = async () => {
      if (authLoading || !userClaims) {
        setAreasComunes([]); 
        setLoadingData(userClaims === undefined);
        return;
      }
      setLoadingData(true);

      const todosLosResidenciales = await cargarTodosLosResidenciales(); 

      if (esAdminDeResidencial && residencialCodigoDelAdmin) {
        const idDocResidencialAdmin = Object.keys(mapeoResidenciales).find(
          key => mapeoResidenciales[key] === residencialCodigoDelAdmin
        );
        if (idDocResidencialAdmin) {
          if (residencialFilter !== idDocResidencialAdmin) setResidencialFilter(idDocResidencialAdmin);
          if (selectedResidencialId !== idDocResidencialAdmin) setSelectedResidencialId(idDocResidencialAdmin);
          
          const areas = await cargarAreasDeResidencial(idDocResidencialAdmin);
          setAreasComunes(areas);
        } else {
          console.warn("Admin de residencial pero no se encontró su ID de documento para cargar áreas:", residencialCodigoDelAdmin);
          setAreasComunes([]);
        }
      } else if (userClaims.isGlobalAdmin) {
        if (residencialFilter === "todos") {
          const areas = await cargarAreasDeTodosLosResidenciales(todosLosResidenciales);
          setAreasComunes(areas);
        } else {
          const areas = await cargarAreasDeResidencial(residencialFilter);
          setAreasComunes(areas);
          if (selectedResidencialId !== residencialFilter) setSelectedResidencialId(residencialFilter);
        }
      } else {
        setAreasComunes([]);
        toast.error("No tienes permisos para ver esta sección.");
      }
      setLoadingData(false);
    };

    cargarDatosAreas();
  }, [
      authLoading, 
      userClaims, 
      residencialFilter, 
      esAdminDeResidencial, 
      residencialCodigoDelAdmin, 
      cargarTodosLosResidenciales, 
      cargarAreasDeResidencial, 
      cargarAreasDeTodosLosResidenciales,
      mapeoResidenciales
  ]);

  const currentResIdForSubscriptionMemoized = useMemo(() => {
    if (esAdminDeResidencial && residencialCodigoDelAdmin) {
      return Object.keys(mapeoResidenciales).find(
        key => mapeoResidenciales[key] === residencialCodigoDelAdmin
      ) || null;
    } else if (userClaims?.isGlobalAdmin && residencialFilter !== "todos") {
      return residencialFilter;
    }
    return null;
  }, [esAdminDeResidencial, residencialCodigoDelAdmin, mapeoResidenciales, userClaims?.isGlobalAdmin, residencialFilter]);

  useEffect(() => {
    if (authLoading || !userClaims) return;

    let unsubscribe: (() => void) | null = null;
    const idParaSuscribir = currentResIdForSubscriptionMemoized;

    if (idParaSuscribir) {
      unsubscribe = suscribirseAAreasComunes(idParaSuscribir, (areasActualizadas) => {
        // Solo actualizar si no estamos en medio de una operación manual
        if (!loadingSubmit && !loadingDelete) {
          setAreasComunes(areasActualizadas.map(area => ({ ...area, _residencialIdDoc: idParaSuscribir })));
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authLoading, userClaims, currentResIdForSubscriptionMemoized, loadingSubmit, loadingDelete]);

  const handleOpenDialog = useCallback((area?: AreaComun) => {
    if (area) {
      setCurrentArea(area);
      setSelectedResidencialId(area._residencialIdDoc || ""); 
              setFormData({
          nombre: area.nombre,
          descripcion: area.descripcion,
          capacidad: area.capacidad,
          esDePago: area.esDePago || false,
          precio: area.precio || 0,
          activa: area.activa || true,
          reglamento: {
            // Valores por defecto
            maxHorasPorReserva: 4,
            maxReservasPorDia: 1,
            maxReservasPorSemana: 3,
            maxReservasPorMes: 10,
            antelacionMinima: 24,
            antelacionMaxima: 30,
            cancelacionMinima: 2,
            permiteInvitados: true,
            maxInvitados: 6,
            requiereAprobacion: false,
            permiteReservasSimultaneas: false,
            maxCasasSimultaneas: 1,
            diasDeshabilitados: [],
      diasSemanaDeshabilitados: [],
            tipoReservas: 'bloques' as const,
            permiteTraslapes: false,
            horarios: {
              entreSemana: {
                apertura: "08:00",
                cierre: "22:00"
              },
              finDeSemana: {
                apertura: "09:00",
                cierre: "23:00"
              },
              diasDisponibles: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
            },
            // Sobrescribir con los valores existentes
            ...area.reglamento
          }
        });
    } else {
      setCurrentArea(null);
      setFormData({
        nombre: "",
        descripcion: "",
        capacidad: 0,
        esDePago: false,
        precio: 0,
        activa: true,
        reglamento: {
          maxHorasPorReserva: 4,
          maxReservasPorDia: 1,
          maxReservasPorSemana: 3,
          maxReservasPorMes: 10,
          antelacionMinima: 24,
          antelacionMaxima: 30,
          cancelacionMinima: 2,
          permiteInvitados: true,
          maxInvitados: 6,
          requiereAprobacion: false,
          permiteReservasSimultaneas: false,
          maxCasasSimultaneas: 1,
          diasDeshabilitados: [],
      diasSemanaDeshabilitados: [],
          // 🆕 NUEVAS PROPIEDADES PARA CONTROL DE RESERVAS
          tipoReservas: 'bloques' as const,
          permiteTraslapes: false,
          horarios: {
            entreSemana: {
              apertura: "08:00",
              cierre: "22:00"
            },
            finDeSemana: {
              apertura: "09:00",
              cierre: "23:00"
            },
            diasDisponibles: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
          }
        }
      });
    }
    setOpenDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback((area: AreaComun) => {
    setCurrentArea(area);
    setSelectedResidencialId(area._residencialIdDoc || ""); 
    setDeleteConfirmOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!currentArea || !currentArea.id || !selectedResidencialId) {
        toast.error("No se pudo determinar el área o el residencial para eliminar.");
        return;
    }
    setLoadingDelete(true);
    try {
      await eliminarAreaComun(selectedResidencialId, currentArea.id);
      toast.success("Área común eliminada correctamente");
      
      setDeleteConfirmOpen(false);
      setCurrentArea(null);

      // No recargar manualmente los datos - confiar en la suscripción en tiempo real

    } catch (error) {
      console.error("Error al eliminar área común:", error);
      toast.error("Error al eliminar el área común");
    } finally {
      setLoadingDelete(false);
    }
  }, [currentArea, selectedResidencialId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedResidencialId) { 
      toast.error("Por favor selecciona un residencial.");
      return;
    }
    setLoadingSubmit(true);
    try {
      const areaData = { ...formData, estado: 'activa' as const };

      if (currentArea && currentArea.id) {
        await actualizarAreaComun(selectedResidencialId, currentArea.id, areaData);
        toast.success("Área común actualizada correctamente");
      } else {
        await crearAreaComun(selectedResidencialId, areaData);
        toast.success("Área común añadida correctamente");
      }
      
      setOpenDialog(false); 
      setCurrentArea(null);

      // No recargar manualmente los datos - confiar en la suscripción en tiempo real

    } catch (error) {
      console.error("Error al guardar área común:", error);
      toast.error("Error al guardar el área común");
    } finally {
      setLoadingSubmit(false);
    }
  }, [selectedResidencialId, formData, currentArea]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "capacidad" ? parseInt(value) || 0 : value
    }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === "reservable" ? value === "true" : value
    }));
  }, []);

  const handleResidencialFilterChange = useCallback((value: string) => {
    if (esAdminDeResidencial) return;
    setResidencialFilter(value);
  }, [esAdminDeResidencial]);

  const filteredAreas = useMemo(() => areasComunes.filter(area => {
    if (!area || !area.nombre) return false;
    const matchesSearch = searchTerm === "" || 
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.descripcion && area.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }), [areasComunes, searchTerm]);

  const getResidencialNombre = useCallback((area: AreaComun) => {
    if (!area._residencialIdDoc) return "Desconocido";
    const residencialEncontrado = residenciales.find(r => r.id === area._residencialIdDoc);
    return residencialEncontrado ? residencialEncontrado.nombre : `ID: ${area._residencialIdDoc.substring(0,6)}...`;
  }, [residenciales]);

  const opcionesHora = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const hora24 = i.toString().padStart(2, '0');
    const hora12 = convertirHora(`${hora24}:00`);
    return { valor: `${hora24}:00`, etiqueta: hora12 };
  }), [convertirHora]);

  if (authLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 3 }).map((_, i) => ( <Skeleton key={i} className="h-12 w-full" /> ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userClaims?.isGlobalAdmin && !esAdminDeResidencial) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-var(--navbar-height,4rem))] p-8">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Acceso Denegado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No tienes los permisos necesarios para acceder a esta sección.</p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-6">
                        Volver al Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Áreas Comunes</h1>
        <Button 
          onClick={() => handleOpenDialog()}
          disabled={(userClaims?.isGlobalAdmin && !esAdminDeResidencial && residencialFilter === "todos")}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir Área Común
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Áreas Comunes</CardTitle>
          <CardDescription>
            {esAdminDeResidencial 
              ? `Áreas comunes de tu residencial asignado.`
              : `Administra las áreas comunes de los residenciales.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar áreas comunes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={residencialFilter}
                onValueChange={handleResidencialFilterChange}
                disabled={esAdminDeResidencial}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por residencial" />
                </SelectTrigger>
                <SelectContent>
                  {userClaims?.isGlobalAdmin && !esAdminDeResidencial && (
                    <SelectItem value="todos">Todos los residenciales</SelectItem>
                  )}
                  {residenciales
                    .filter(r => r.id)
                    .filter(r => !esAdminDeResidencial || r.id === residencialFilter) 
                    .map((residencial) => (
                      <SelectItem key={residencial.id!} value={residencial.id!}>
                        {residencial.nombre}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sustituir el JSX de la tabla por el componente TablaAreasComunes */}
            <TablaAreasComunes
              loading={loadingData}
              filteredAreas={filteredAreas}
              esAdminDeResidencial={esAdminDeResidencial}
              userClaims={userClaims}
              getResidencialNombre={getResidencialNombre}
              convertirHora={convertirHora}
              handleOpenDialog={handleOpenDialog}
              handleDeleteConfirm={handleDeleteConfirm}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {openDialog && (
          <Suspense fallback={<div className="p-6 text-center">Cargando formulario...</div>}>
            <AreaComunFormDialogContent
              currentArea={currentArea}
              formData={formData}
              handleInputChange={handleInputChange}
              setFormData={setFormData}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmit}
              setOpenDialog={setOpenDialog}
              loading={loadingSubmit}
              userClaims={userClaims}
              esAdminDeResidencial={esAdminDeResidencial}
              selectedResidencialId={selectedResidencialId}
              setSelectedResidencialId={setSelectedResidencialId}
              residenciales={residenciales}
            />
          </Suspense>
        )}
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        {deleteConfirmOpen && (
          <Suspense fallback={<div className="p-6 text-center">Cargando confirmación...</div>}>
            <ConfirmarEliminarAreaComunDialogContent
              currentArea={currentArea}
              handleDelete={handleDelete}
              setDeleteConfirmOpen={setDeleteConfirmOpen}
              loading={loadingDelete}
            />
          </Suspense>
        )}
      </Dialog>
    </div>
  );
}