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

interface AreaComunFormData {
  nombre: string;
  descripcion: string;
  capacidad: number;
  horario: {
    apertura: string;
    cierre: string;
  };
  reservable: boolean;
}

export default function AreasComunesPage() {
  const router = useRouter();
  const { user, userClaims, loading: authLoading } = useAuth();

  const [areasComunes, setAreasComunes] = useState<AreaComun[]>([]);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [residencialFilter, setResidencialFilter] = useState<string>("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<AreaComun | null>(null);
  const [selectedResidencialId, setSelectedResidencialId] = useState<string>("");
  const [formData, setFormData] = useState<AreaComunFormData>({
    nombre: "",
    descripcion: "",
    capacidad: 0,
    horario: {
      apertura: "08:00",
      cierre: "20:00"
    },
    reservable: false,
  });
  const [mapeoResidenciales, setMapeoResidenciales] = useState<{[key: string]: string}>({});

  useEffect(() => {
    console.log('[StateChangeTracker] loading:', loading, 'openDialog:', openDialog, 'deleteConfirmOpen:', deleteConfirmOpen);
  }, [loading, openDialog, deleteConfirmOpen]);

  const esAdminDeResidencial = useMemo(() => !!(userClaims?.isResidencialAdmin && !userClaims?.isGlobalAdmin), [userClaims]);
  const residencialCodigoDelAdmin = useMemo(() => esAdminDeResidencial ? userClaims?.managedResidencialId : null, [esAdminDeResidencial, userClaims]);

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
  }, [setResidenciales, setMapeoResidenciales]);
  
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
        setLoading(userClaims === undefined);
        return;
      }
      setLoading(true);

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
      setLoading(false);
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
      console.log(`[Suscripción] Intentando suscribir a áreas de: ${idParaSuscribir}`);
      unsubscribe = suscribirseAAreasComunes(idParaSuscribir, (areasActualizadas) => {
        console.log(`[Suscripción] Áreas actualizadas para ${idParaSuscribir}:`, areasActualizadas.length);
        setAreasComunes(areasActualizadas.map(area => ({ ...area, _residencialIdDoc: idParaSuscribir })));
      });
    } else {
      console.log("[Suscripción] No hay ID para suscribir o es Admin Global con 'todos'.");
    }

    return () => {
      if (unsubscribe) {
        console.log(`[Suscripción] Desuscribiendo de: ${idParaSuscribir}`);
        unsubscribe();
      }
    };
  }, [authLoading, userClaims, currentResIdForSubscriptionMemoized, suscribirseAAreasComunes, residenciales]); // residenciales para el toast de error

  const handleOpenDialog = (area?: AreaComun) => {
    // setLoading(false); // Comentado temporalmente para prueba
    console.log('[handleOpenDialog] Inicio', { area, currentLoading: loading });

    if (area) {
      setCurrentArea(area);
      setSelectedResidencialId(area._residencialIdDoc || ""); 
      setFormData({
        nombre: area.nombre,
        descripcion: area.descripcion,
        capacidad: area.capacidad,
        horario: {
          apertura: area.horario.apertura,
          cierre: area.horario.cierre
        },
        reservable: area.reservable,
      });
    } else {
      setCurrentArea(null);
      setFormData({
        nombre: "",
        descripcion: "",
        capacidad: 0,
        horario: {
          apertura: "08:00",
          cierre: "20:00"
        },
        reservable: false,
      });
    }
    setLoading(false); // Asegurar que loading es false antes de abrir el diálogo
    console.log('[handleOpenDialog] Antes de setOpenDialog(true)', { newLoading: false });
    setOpenDialog(true);
    console.log('[handleOpenDialog] Después de setOpenDialog(true)');
  };

  const handleDeleteConfirm = (area: AreaComun) => {
    console.log('[handleDeleteConfirm] Inicio', { area, currentLoading: loading });
    setCurrentArea(area);
    setSelectedResidencialId(area._residencialIdDoc || ""); 
    console.log('[handleDeleteConfirm] Antes de setDeleteConfirmOpen(true)');
    setDeleteConfirmOpen(true);
    console.log('[handleDeleteConfirm] Después de setDeleteConfirmOpen(true)');
  };

  const handleDelete = async () => {
    if (!currentArea || !currentArea.id || !selectedResidencialId) {
        toast.error("No se pudo determinar el área o el residencial para eliminar.");
        return;
    }
    console.log('[handleDelete] Inicio', { currentLoading: loading, currentArea });
    setLoading(true);
    console.log('[handleDelete] setLoading(true) ejecutado');
    try {
      await eliminarAreaComun(selectedResidencialId, currentArea.id);
      toast.success("Área común eliminada correctamente");
      
      console.log('[handleDelete] Antes de setDeleteConfirmOpen(false)');
      setDeleteConfirmOpen(false);
      console.log('[handleDelete] Después de setDeleteConfirmOpen(false)');
      setCurrentArea(null);

      const residencialIdParaRecargar = selectedResidencialId;
      console.log('[handleDelete] Antes de recargar datos');

      if (userClaims?.isGlobalAdmin && residencialFilter === "todos" && !esAdminDeResidencial) {
        const reloadedResidenciales = await cargarTodosLosResidenciales();
        const areas = await cargarAreasDeTodosLosResidenciales(reloadedResidenciales);
        setAreasComunes(areas);
      } else {
        const areasActualizadas = await cargarAreasDeResidencial(residencialIdParaRecargar);
        setAreasComunes(areasActualizadas.map(area => ({ ...area, _residencialIdDoc: residencialIdParaRecargar })));
      }
      console.log('[handleDelete] Después de recargar datos');

    } catch (error) {
      console.error("Error al eliminar área común:", error);
      toast.error("Error al eliminar el área común");
      console.log('[handleDelete] Error catch', error);
    } finally {
      console.log('[handleDelete] Inicio finally, currentLoading:', loading);
      setLoading(false);
      console.log('[handleDelete] Fin finally, setLoading(false) ejecutado');
    }
  };

  const handleSubmit = async () => {
    if (!selectedResidencialId) { 
      toast.error("Por favor selecciona un residencial.");
      return;
    }
    console.log('[handleSubmit] Inicio', { currentLoading: loading });
    setLoading(true);
    console.log('[handleSubmit] setLoading(true) ejecutado');
    try {
      const areaData = { ...formData, estado: 'activa' as const };
      const residencialIdParaRecargar = selectedResidencialId; 

      if (currentArea && currentArea.id) {
        await actualizarAreaComun(selectedResidencialId, currentArea.id, areaData);
        toast.success("Área común actualizada correctamente");
      } else {
        await crearAreaComun(selectedResidencialId, areaData);
        toast.success("Área común añadida correctamente");
      }
      
      console.log('[handleSubmit] Antes de setOpenDialog(false)');
      setOpenDialog(false); 
      console.log('[handleSubmit] Después de setOpenDialog(false)');
      setCurrentArea(null);

      console.log('[handleSubmit] Antes de recargar datos');
      if (userClaims?.isGlobalAdmin && (residencialFilter === "todos" || residencialFilter !== residencialIdParaRecargar)) {
        const reloadedResidenciales = await cargarTodosLosResidenciales();
        const areasActualizadas = await cargarAreasDeTodosLosResidenciales(reloadedResidenciales);
        setAreasComunes(areasActualizadas);
      } else if (userClaims?.isGlobalAdmin && residencialFilter === residencialIdParaRecargar) {
         const areasActualizadas = await cargarAreasDeResidencial(residencialIdParaRecargar);
         setAreasComunes(areasActualizadas.map(area => ({ ...area, _residencialIdDoc: residencialIdParaRecargar })));
      } else if (esAdminDeResidencial) {
        const areasActualizadas = await cargarAreasDeResidencial(residencialIdParaRecargar);
        setAreasComunes(areasActualizadas.map(area => ({ ...area, _residencialIdDoc: residencialIdParaRecargar })));
      }
      console.log('[handleSubmit] Después de recargar datos');

    } catch (error) {
      console.error("Error al guardar área común:", error);
      toast.error("Error al guardar el área común");
      console.log('[handleSubmit] Error catch', error);
    } finally {
      console.log('[handleSubmit] Inicio finally, currentLoading:', loading);
      setLoading(false); 
      console.log('[handleSubmit] Fin finally, setLoading(false) ejecutado');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "capacidad" ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name === "reservable" ? value === "true" : value
    }));
  };

  const handleResidencialFilterChange = (value: string) => {
    if (esAdminDeResidencial) return;
    setResidencialFilter(value);
  };

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
              loading={loading}
              filteredAreas={filteredAreas} // Asegurarse que filteredAreas esté definido y pasado correctamente
              esAdminDeResidencial={esAdminDeResidencial}
              userClaims={userClaims}
              getResidencialNombre={getResidencialNombre} // Asegurarse que esta función esté definida y pasada
              convertirHora={convertirHora} // Asegurarse que esta función esté definida y pasada
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
              loading={loading}
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
              loading={loading}
            />
          </Suspense>
        )}
      </Dialog>
    </div>
  );
}