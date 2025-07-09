"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  UserPlus, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash, 
  UserCog, 
  Mail, 
  Phone, 
  Home, 
  Clock,
  Shield,
  Users,
  Building,
  FileText,
  ExternalLink,
  Eye,
  Wifi,
  Trash2,
  RefreshCcw
} from "lucide-react";
import { getUsuarios, getUsuariosPendientes, getUsuariosPorResidencial, cambiarEstadoUsuario, crearUsuario, eliminarUsuario, Usuario, getResidenciales, Residencial, suscribirseAUsuarios, suscribirseAUsuariosPendientes, suscribirseAResidenciales } from "@/lib/firebase/firestore";
import { 
  documentExistsSimplificado, 
  getDocumentURLSimplificado, 
  eliminarDocumento // Añadir eliminarDocumento a la importación
} from '@/lib/firebase/storage';
import { usuarioToUserModel, userModelToUsuario } from "@/lib/utils/user-mappers";
import { toast as sonnerToast } from "sonner";
import Image from "next/image";
import { useAuth, UserClaims } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

import { auth, db } from '@/lib/firebase/config';
import { debounce } from "lodash";
import { Dialog as HeadlessDialog } from '@headlessui/react';
import { collection, doc, setDoc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { useRef } from "react";
import { memo } from "react";
import { AuthService } from "@/lib/services/auth-service";
import { UserRole } from "@/types/models";
import dynamic from 'next/dynamic'; // Importar dynamic
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

// Importar dinámicamente DetallesUsuarioDialog
const DetallesUsuarioDialog = dynamic(() => import('@/components/dashboard/usuarios/DetallesUsuarioDialog'), {
  suspense: true,
});

// Importar dinámicamente NuevoUsuarioDialogContent
const NuevoUsuarioDialogContent = dynamic(() => import('@/components/dashboard/usuarios/NuevoUsuarioDialogContent'), {
  suspense: true,
});

// Importar dinámicamente ConfirmarEliminarDialogContent
const ConfirmarEliminarDialogContent = dynamic(() => import('@/components/dashboard/usuarios/ConfirmarEliminarDialogContent'), {
  suspense: true,
});

// Importar dinámicamente MostrarDocumentoDialogContent
const MostrarDocumentoDialogContent = dynamic(() => import('@/components/dashboard/usuarios/MostrarDocumentoDialogContent'), {
  suspense: true,
});

// Importar dinámicamente ContenidoPestanaSeguridad
const ContenidoPestanaSeguridad = dynamic(() => import('@/components/dashboard/usuarios/ContenidoPestanaSeguridad'), {
  suspense: true,
});

// Importar dinámicamente ContenidoPestanaAdministradores
const ContenidoPestanaAdministradores = dynamic(() => import('@/components/dashboard/usuarios/ContenidoPestanaAdministradores'), {
  suspense: true,
});

// Importar dinámicamente ContenidoPestanaPendientes
const ContenidoPestanaPendientes = dynamic(() => import('@/components/dashboard/usuarios/ContenidoPestanaPendientes'), {
  suspense: true,
});

// Importar dinámicamente ContenidoPestanaResidentes
const ContenidoPestanaResidentes = dynamic(() => import('@/components/dashboard/usuarios/ContenidoPestanaResidentes'), {
  suspense: true,
  loading: () => <TableSkeleton />, // Añadir skeleton como fallback de carga
});

// Componente de esqueleto para la tabla de usuarios
const TableSkeleton = () => (
  <div className="space-y-2 mt-4">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

// Componente wrapper que permite reiniciar el componente sin recargar la página
export default function UsuariosPage() {
  // Este key se usa para forzar un remontaje completo del componente
  const [componentKey, setComponentKey] = useState<number>(0);
  
  return (
    <UsuariosPageContent key={componentKey} onReset={() => setComponentKey(prev => prev + 1)} />
  );
}

// Componente interno que contiene toda la lógica
function UsuariosPageContent({ onReset }: { onReset: () => void }): JSX.Element {
  const router = useRouter();
  // Obtener userClaims del AuthContext
  const { user, userClaims, loading: authLoading } = useAuth(); 
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosPendientes, setUsuariosPendientes] = useState<Usuario[]>([]);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [residencialSeleccionado, setResidencialSeleccionado] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>('residentes');
  const [mapeoResidenciales, setMapeoResidenciales] = useState<{[key: string]: string}>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<string | null>(null);
  const [documentoURL, setDocumentoURL] = useState<string | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  const [documentoNombre, setDocumentoNombre] = useState<string>("");
  const [lastNotifiedPendingCount, setLastNotifiedPendingCount] = useState<number>(0);
  const [actualizacionEnTiempoReal, setActualizacionEnTiempoReal] = useState(false);
  const [showNuevoUsuarioDialog, setShowNuevoUsuarioDialog] = useState(false);
  const [nuevoUsuarioForm, setNuevoUsuarioForm] = useState({
    fullName: "",
    paternalLastName: "",
    maternalLastName: "",
    email: "",
    telefono: "",
    role: "resident" as Usuario['role'],
    residencialID: "",
    houseID: "",
    calle: "",
    houseNumber: "",
    password: ""
  });
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [typingSearchTerm, setTypingSearchTerm] = useState("");
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);
  const [eliminandoUsuario, setEliminandoUsuario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [showDetallesUsuarioDialog, setShowDetallesUsuarioDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    rol: 'resident' as Usuario['role'],
    residencialId: ''
  });
  const [callesDisponibles, setCallesDisponibles] = useState<string[]>([]);
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<(Function | null)[]>([]);
  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

  // Determinar si el admin es solo de residencial o global
  const esAdminDeResidencial = useMemo(() => userClaims?.isResidencialAdmin && !userClaims?.isGlobalAdmin, [userClaims]);
  const residencialIdDelAdmin = useMemo(() => esAdminDeResidencial ? (userClaims?.managedResidencialId ?? null) : null, [esAdminDeResidencial, userClaims]);

  // =================================================================================
  // REFACTORIZACIÓN: Lógica de carga de datos centralizada
  // =================================================================================
  
  // Función para cargar las calles cuando se selecciona un residencial
  const cargarCallesDelResidencial = useCallback(async (residencialId: string) => {
    try {
      if (!residencialId) {
        setCallesDisponibles([]);
        return;
      }
      
      console.log('🔍 Cargando calles para residencial ID:', residencialId);
      
      // Obtener el documento del residencial
      const residencialDoc = await getDoc(doc(db, 'residenciales', residencialId));
      
      if (residencialDoc.exists()) {
        const residencialData = residencialDoc.data();
        
        // Verificar si existe el campo calles y es un array
        if (residencialData.calles && Array.isArray(residencialData.calles)) {
          console.log('✅ Calles encontradas:', residencialData.calles);
          const callesFiltradas = residencialData.calles.filter((calle: string) => calle && calle.trim() !== '');
          setCallesDisponibles(callesFiltradas);
        } else {
          console.log('⚠️ No se encontraron calles en el residencial');
          setCallesDisponibles([]);
        }
      } else {
        console.log('❌ No se encontró el documento del residencial');
        setCallesDisponibles([]);
      }
    } catch (error) {
      console.error('Error al cargar calles:', error);
      setCallesDisponibles([]);
    }
  }, []);

  const cargarYActualizarUsuarios = useCallback(async (residencialId: string = "todos") => {
    setIsLoading(true);
    try {
      let fetchedUsuarios: Usuario[] = [];
      const fetchInitialData = residenciales.length === 0;

      if (residencialId === 'todos') {
        // Carga para admin global, vista "Todos los residenciales"
        fetchedUsuarios = await getUsuarios({ 
          orderBy: 'createdAt', 
          orderDirection: 'desc', 
          limit: 100 // Cargar un lote inicial más grande para la vista global
        });
      } else if (residencialIdDelAdmin) {
        // Carga para admin de residencial (siempre su residencial)
        fetchedUsuarios = await getUsuariosPorResidencial(residencialIdDelAdmin);
      } else {
        // Carga para admin global que selecciona un residencial específico
        const codigoResidencial = mapeoResidenciales[residencialId];
        if (codigoResidencial) {
          fetchedUsuarios = await getUsuariosPorResidencial(codigoResidencial);
        }
      }
      
      setUsuarios(fetchedUsuarios);
      setLastUpdate(new Date());

      // Cargar datos secundarios solo en la primera carga para evitar llamadas innecesarias
      if (fetchInitialData) {
        const [pendientes, todosLosResidenciales] = await Promise.all([
          getUsuariosPendientes({ limit: 50 }),
          getResidenciales()
        ]);

        const mapeo: {[key: string]: string} = {};
        todosLosResidenciales.forEach(r => {
          if (r.id && r.residencialID) mapeo[r.id] = r.residencialID;
        });
        
        setMapeoResidenciales(mapeo);
        setUsuariosPendientes(pendientes);
        setResidenciales(todosLosResidenciales);

        // Si es admin de residencial, preseleccionar su residencial
        if (residencialIdDelAdmin) {
          const idDocResidencialAdmin = Object.keys(mapeo).find(key => mapeo[key] === residencialIdDelAdmin);
          if (idDocResidencialAdmin) {
            setResidencialSeleccionado(idDocResidencialAdmin);
            cargarCallesDelResidencial(idDocResidencialAdmin);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar y actualizar usuarios:", error);
      sonnerToast.error("Error al cargar la lista de usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [residenciales.length, residencialIdDelAdmin, mapeoResidenciales, cargarCallesDelResidencial]);


  // Efecto para la carga inicial de datos
  useEffect(() => {
    if (!authLoading && userClaims !== undefined) {
      const idParaCargar = residencialIdDelAdmin || "todos";
      cargarYActualizarUsuarios(idParaCargar);
    }
  }, [authLoading, userClaims, residencialIdDelAdmin, cargarYActualizarUsuarios]);
  
  // Efecto para resetear la página al cambiar de filtro o residencial
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, residencialSeleccionado, searchTerm]);

  useEffect(() => {
    if (isLoading) return;
    
    if (usuariosPendientes.length > 0 && 
        activeTab !== "pendientes" && 
        usuariosPendientes.length > lastNotifiedPendingCount) {
      
      sonnerToast.info(`${usuariosPendientes.length} usuarios pendientes de aprobación`, {
        description: "Se actualizó automáticamente"
      });
      
      setLastNotifiedPendingCount(usuariosPendientes.length);
    } else if (usuariosPendientes.length !== lastNotifiedPendingCount) {
      setLastNotifiedPendingCount(usuariosPendientes.length);
    }
  }, [usuariosPendientes.length, activeTab, isLoading, lastNotifiedPendingCount]);

  useEffect(() => {
    if (usuariosPendientes.length > 0) {
      usuariosPendientes.forEach(usuario => {
        const identificacionPath = (usuario as any).identificacionPath;
        const comprobantePath = (usuario as any).comprobantePath;
        
        if (identificacionPath || comprobantePath) {
          if (identificacionPath) console.log(`- Identificación: ${identificacionPath}`);
          if (comprobantePath) console.log(`- Comprobante: ${comprobantePath}`);
        }
      });
    }
  }, [usuariosPendientes]);

  const handleAprobarUsuario = async (id: string) => {
    try {
      // Obtener los datos del usuario antes de aprobarlo para acceder a sus rutas de documentos
      const usuarioPendiente = usuariosPendientes.find(u => u.id === id);
      const identificacionPath = (usuarioPendiente as any)?.identificacionPath;
      const comprobantePath = (usuarioPendiente as any)?.comprobantePath;
      
      // Guardar rutas para registro
      const rutasDocumentos = {
        identificacion: identificacionPath,
        comprobante: comprobantePath
      };
      
      console.log("🔄 Aprobando usuario:", id, "con documentos:", rutasDocumentos);
      
      // Primero aprobamos al usuario
      await cambiarEstadoUsuario(id, "approved");
      sonnerToast.success("Usuario aprobado correctamente");
      
      // Luego intentamos eliminar los documentos
      let docsEliminados = 0;
      let docsFallidos = 0;
      
      if (identificacionPath) {
        const eliminado = await eliminarDocumento(identificacionPath);
        eliminado ? docsEliminados++ : docsFallidos++;
      }
      
      if (comprobantePath) {
        const eliminado = await eliminarDocumento(comprobantePath);
        eliminado ? docsEliminados++ : docsFallidos++;
      }
      
      // Informar al usuario sobre la eliminación de documentos
      if (docsEliminados > 0) {
        console.log(`✅ Se eliminaron ${docsEliminados} documentos asociados al usuario`);
        sonnerToast.success(`Se eliminaron ${docsEliminados} documentos del almacenamiento`, {
          description: "Los documentos ya no son necesarios después de la aprobación",
          duration: 4000
        });
      }
      
      if (docsFallidos > 0) {
        console.warn(`⚠️ No se pudieron eliminar ${docsFallidos} documentos`);
        sonnerToast.warning(`No se pudieron eliminar ${docsFallidos} documentos`, {
          description: "Los documentos permanecerán en el almacenamiento",
          duration: 4000
        });
      }
      
      // Actualizar el estado de la interfaz
      setUsuariosPendientes(prev => prev.filter(u => u.id !== id));
      
      if (usuarioPendiente) {
        setUsuarios(prev => [...prev, { ...usuarioPendiente, status: "approved" }]);
      } else {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: "approved" } : u));
      }
    } catch (error) {
      console.error("Error al aprobar usuario:", error);
      sonnerToast.error("Error al aprobar el usuario");
    }
  };

  const handleRechazarUsuario = async (id: string) => {
    try {
      // Obtener los datos del usuario antes de rechazarlo para acceder a sus rutas de documentos
      const usuarioPendiente = usuariosPendientes.find(u => u.id === id);
      const identificacionPath = (usuarioPendiente as any)?.identificacionPath;
      const comprobantePath = (usuarioPendiente as any)?.comprobantePath;
      
      // Guardar rutas para registro
      const rutasDocumentos = {
        identificacion: identificacionPath,
        comprobante: comprobantePath
      };
      
      console.log("🔄 Rechazando usuario:", id, "con documentos:", rutasDocumentos);
      
      // Primero rechazamos al usuario
      await cambiarEstadoUsuario(id, "rejected");
      sonnerToast.success("Usuario rechazado correctamente");
      
      // Luego intentamos eliminar los documentos
      let docsEliminados = 0;
      let docsFallidos = 0;
      
      if (identificacionPath) {
        const eliminado = await eliminarDocumento(identificacionPath);
        eliminado ? docsEliminados++ : docsFallidos++;
      }
      
      if (comprobantePath) {
        const eliminado = await eliminarDocumento(comprobantePath);
        eliminado ? docsEliminados++ : docsFallidos++;
      }
      
      // Informar al usuario sobre la eliminación de documentos
      if (docsEliminados > 0) {
        console.log(`✅ Se eliminaron ${docsEliminados} documentos asociados al usuario`);
        sonnerToast.success(`Se eliminaron ${docsEliminados} documentos del almacenamiento`, {
          description: "Los documentos rechazados son eliminados automáticamente",
          duration: 4000
        });
      }
      
      if (docsFallidos > 0) {
        console.warn(`⚠️ No se pudieron eliminar ${docsFallidos} documentos`);
        sonnerToast.warning(`No se pudieron eliminar ${docsFallidos} documentos`, {
          description: "Los documentos permanecerán en el almacenamiento",
          duration: 4000
        });
      }
      
      // Actualizar el estado de la interfaz
      setUsuariosPendientes(prev => prev.filter(u => u.id !== id));
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: "rejected" } : u));
    } catch (error) {
      console.error("Error al rechazar usuario:", error);
      sonnerToast.error("Error al rechazar el usuario");
    }
  };
  
  const handleCambiarEstado = async (id: string, nuevoEstado: Usuario['status']) => {
    try {
      await cambiarEstadoUsuario(id, nuevoEstado);
      
      if (nuevoEstado === "approved") {
        sonnerToast.success("Usuario activado correctamente");
      } else if (nuevoEstado === "inactive") {
        sonnerToast.success("Usuario desactivado correctamente");
      } else {
        sonnerToast.success(`Estado del usuario cambiado a ${nuevoEstado}`);
      }
      
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, status: nuevoEstado } : u));
      
      if (nuevoEstado === "pending") {
        const usuario = usuarios.find(u => u.id === id);
        if (usuario && !usuariosPendientes.some(u => u.id === id)) {
          setUsuariosPendientes(prev => [...prev, usuario]);
        }
      }
    } catch (error) {
      console.error(`Error al cambiar estado del usuario a ${nuevoEstado}:`, error);
      sonnerToast.error("Error al cambiar el estado del usuario");
    }
  };

  const getResidencialIdFromUser = (usuario: Usuario): string => {
    // Verificar las diferentes propiedades donde podría estar el ID del residencial
    if (usuario.residencialID) {
      return usuario.residencialID;
    }
    
    if ((usuario as any)['residencialId']) {
      return (usuario as any)['residencialId'];
    }
    
    if ((usuario as any)['residencialDocId']) {
      const docId = (usuario as any)['residencialDocId'];
      // Intentar obtener el residencialID del mapeo
      if (mapeoResidenciales[docId]) {
        return mapeoResidenciales[docId];
      }
      return docId;
    }
    
    return ""; // Valor por defecto vacío en lugar de undefined
  };

  const filtrarUsuariosPorResidencial = (residencialId: string) => {
    if (residencialId === "todos") {
      return usuarios;
    }
    
    // Obtener el código del residencial del mapeo
    const codigoResidencial = mapeoResidenciales[residencialId];
    
    if (!codigoResidencial) {
      return [];
    }
    
    // Filtrar los usuarios que coinciden con el residencial
    const usuariosFiltrados = usuarios.filter(u => {
      const userResidencialId = getResidencialIdFromUser(u);
      // Solo filtrar por coincidencia de residencial, independientemente del rol
      return userResidencialId === codigoResidencial;
    });
    
    return usuariosFiltrados;
  };

  const filtrarUsuariosPorRol = (usuarios: Usuario[], rol: string) => {
    return usuarios.filter(u => {
      const coincideRol = u.role === rol;
      const estaAprobado = u.status === "approved";
      return coincideRol && estaAprobado;
    });
  };

  const filtrarUsuariosPorBusqueda = (usuarios: Usuario[]) => {
    if (!searchTerm) return usuarios;
    
    const termino = searchTerm.toLowerCase();
    return usuarios.filter(usuario => 
      usuario.fullName.toLowerCase().includes(termino) ||
      usuario.paternalLastName.toLowerCase().includes(termino) ||
      usuario.maternalLastName.toLowerCase().includes(termino) ||
      usuario.email.toLowerCase().includes(termino) ||
      usuario.telefono.toLowerCase().includes(termino) ||
      (usuario.houseID && usuario.houseID.toLowerCase().includes(termino))
    );
  };

  // Usar useMemo para filtrar los usuarios por residencial
  const usuariosDelResidencial = useMemo(() => {
    if (residencialIdDelAdmin) {
      // Si es admin de residencial, filtrar por su residencial ID (usando el mapeo para ser consistentes)
      const idDocResidencialAdmin = Object.keys(mapeoResidenciales).find(key => mapeoResidenciales[key] === residencialIdDelAdmin);
      if (idDocResidencialAdmin) {
         return usuarios.filter(u => getResidencialIdFromUser(u) === residencialIdDelAdmin);
      }
      return []; // Si no se encuentra el residencial del admin, devolver lista vacía
    }
    // Si es admin global
    if (residencialSeleccionado === "todos") {
      return usuarios;
    }
    const codigoResidencial = mapeoResidenciales[residencialSeleccionado];
    if (!codigoResidencial) {
      return [];
    }
    return usuarios.filter(u => getResidencialIdFromUser(u) === codigoResidencial);
  }, [usuarios, residencialSeleccionado, mapeoResidenciales, residencialIdDelAdmin]);

  // Usar useMemo para aplicar el filtro de búsqueda
  const usuariosBuscados = useMemo(() => {
    if (!searchTerm) return usuariosDelResidencial;
    
    const termino = searchTerm.toLowerCase();
    return usuariosDelResidencial.filter(usuario => 
      usuario.fullName?.toLowerCase().includes(termino) ||
      usuario.paternalLastName?.toLowerCase().includes(termino) ||
      usuario.maternalLastName?.toLowerCase().includes(termino) ||
      usuario.email?.toLowerCase().includes(termino) ||
      usuario.telefono?.toLowerCase().includes(termino) ||
      (usuario.houseID && usuario.houseID.toLowerCase().includes(termino))
    );
  }, [usuariosDelResidencial, searchTerm]);
  
  // Usar useMemo para calcular los usuarios filtrados por rol
  const residentes = useMemo(() => 
    filtrarUsuariosPorRol(usuariosBuscados, 'resident'),
    [usuariosBuscados]
  );
  
  const guardias = useMemo(() => 
    filtrarUsuariosPorRol(usuariosBuscados, 'security'),
    [usuariosBuscados]
  );
  
  const administradores = useMemo(() => 
    filtrarUsuariosPorRol(usuariosBuscados, 'admin'),
    [usuariosBuscados]
  );

  // =================================================================================
  // REFACTORIZACIÓN: Lógica de selección de lista y paginación
  // =================================================================================

  // 1. Determinar la lista de usuarios activa según la pestaña
  const listaActiva = useMemo(() => {
    switch (activeTab) {
      case "residentes":
        return residentes;
      case "seguridad":
        return guardias;
      case "administradores":
        return administradores;
      case "pendientes":
        // Aplicar búsqueda también a los pendientes
        return filtrarUsuariosPorBusqueda(usuariosPendientes);
      default:
        // Por defecto, mostrar residentes para evitar listas vacías inesperadas
        return residentes;
    }
  }, [activeTab, residentes, guardias, administradores, usuariosPendientes, searchTerm, filtrarUsuariosPorBusqueda]);

  // 2. Aplicar paginación a la lista activa
  const totalItems = listaActiva.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = useMemo(() => 
    listaActiva.slice(indexOfFirstItem, indexOfLastItem),
    [listaActiva, currentPage, itemsPerPage]
  );

  // Usar useMemo para determinar qué lista de usuarios mostrar según la pestaña activa
  const usuariosFiltrados = useMemo(() => {
    if (activeTab === "residentes") {
      return residentes;
    } else if (activeTab === "seguridad") {
      return guardias;
    } else if (activeTab === "administradores") {
      return administradores;
    } else if (activeTab === "pendientes") {
      return usuariosPendientes;
    }
    return [];
  }, [activeTab, residentes, guardias, administradores, usuariosBuscados, usuariosPendientes]);

  const getEstadoBadge = (estado: Usuario['status']) => {
    switch (estado) {
      case "approved":
        return <Badge variant="success">Activo</Badge>;
      case "pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getRolBadge = (rol: Usuario['role']) => {
    switch (rol) {
      case "admin":
        return <Badge variant="secondary">Administrador</Badge>;
      case "resident":
        return <Badge variant="outline">Residente</Badge>;
      case "security":
        return <Badge variant="outline">Guardia</Badge>;
      default:
        return <Badge variant="outline">{rol}</Badge>;
    }
  };

  const getResidencialNombre = (id: string) => {
    if (!id) return "No asignado";
    
    // Buscar primero por ID directo
    const porIdDirecto = residenciales.find(r => r.id === id);
    if (porIdDirecto) return porIdDirecto.nombre;
    
    // Buscar por residencialID
    const porResidencialID = residenciales.find(r => r.residencialID === id);
    if (porResidencialID) return porResidencialID.nombre;
    
    // Buscar en el mapeo inverso
    for (const [docId, residencialID] of Object.entries(mapeoResidenciales)) {
      if (residencialID === id) {
        const residencial = residenciales.find(r => r.id === docId);
        if (residencial) return residencial.nombre;
      }
    }
    
    // Último intento: búsqueda insensible a mayúsculas/minúsculas
    const residencialCaseInsensitive = residenciales.find(r => 
      (r.residencialID && r.residencialID.toLowerCase() === id.toLowerCase()) || 
      (r.id && r.id.toLowerCase() === id.toLowerCase())
    );
    
    if (residencialCaseInsensitive) return residencialCaseInsensitive.nombre;
    
    console.log(`⚠️ No se encontró nombre para residencial ID: ${id}`);
    return "Residencial ID: " + id.substring(0, 6) + "...";
  };

  const mostrarDocumento = async (ruta: string, nombre: string) => {
    try {
      // Logs detallados al inicio de la función
      const currentUser = auth.currentUser; // auth es tu instancia de Firebase Auth importada
      console.log(
        '[DEBUG] Iniciando mostrarDocumento - Datos del solicitante y archivo:',
        {
          solicitanteUID: currentUser?.uid,
          solicitanteEmail: currentUser?.email,
          rutaArchivo: ruta,
          nombreArchivo: nombre,
        }
      );

      setIsLoadingDocument(true);
      setDocumentoSeleccionado(ruta);
      setDocumentoNombre(nombre);
      
      if (!ruta || ruta.trim() === '') {
        console.error('❌ Ruta del documento inválida');
        sonnerToast.error(`La ruta del documento ${nombre} no es válida`);
        setDocumentoSeleccionado(null);
        return;
      }
      
      console.log('[DEBUG] Antes de llamar a documentExists. Ruta:', ruta);
      const resultado = await documentExistsSimplificado(ruta);
      console.log('[DEBUG] Después de llamar a documentExists. Resultado:', resultado);
      
      if (!resultado.existe) {
        console.error('❌ Documento no encontrado o sin permisos:', ruta);
        sonnerToast.error(`No es posible acceder al documento "${nombre}". Verifica que tengas permisos de administrador para el residencial correspondiente.`);
        setDocumentoSeleccionado(null);
        return;
      }
      
      // Si documentExists ya devolvió la URL, usamos esa directamente
      if (resultado.url) {
        console.log('📥 URL obtenida directamente del verificador');
        setDocumentoURL(resultado.url);
        sonnerToast.success(`Documento ${nombre} cargado correctamente`);
        return;
      }
      
      // Si no tenemos URL, intentamos obtenerla con getDocumentURL como fallback
      console.log('[DEBUG] Antes de llamar a getDocumentURL. Ruta:', ruta);
      const url = await getDocumentURLSimplificado(ruta);
      console.log('[DEBUG] Después de llamar a getDocumentURL. URL obtenida:', url ? 'URL Presente' : 'URL Ausente');
      
      if (!url) {
        console.error('❌ No se pudo obtener la URL del documento');
        sonnerToast.error(`No se pudo obtener la URL del documento ${nombre}`);
        setDocumentoSeleccionado(null);
        return;
      }
      
      setDocumentoURL(url);
      sonnerToast.success(`Documento ${nombre} cargado correctamente`);
    } catch (error) {
      console.error('❌ Error al cargar documento:', {
        error,
        errorCode: (error as any)?.code,
        errorMessage: (error as Error).message
      });
      
      const errorCode = (error as any)?.code;
      const errorMessage = (error as Error).message || '';
      
      if (errorCode === 'storage/unauthorized' || errorMessage.includes('No tienes permiso')) {
        console.error('🚫 Error de permisos:', {
          userEmail: user?.email,
          userRole: (user as any)?.role,
          documentPath: ruta
        });
        
        sonnerToast.error(`No tienes permisos para acceder al documento ${nombre}`, {
          description: "Debes ser administrador del residencial o propietario del documento",
          duration: 5000
        });
      } else if (errorCode === 'storage/object-not-found') {
        sonnerToast.error(`El documento ${nombre} no existe en el servidor`);
      } else if (errorCode === 'storage/invalid-argument') {
        sonnerToast.error(`La ruta del documento ${nombre} no es válida`);
      } else if (errorMessage.includes('Usuario no autenticado')) {
        sonnerToast.error(`Debes iniciar sesión para acceder a este documento`, {
          description: "Tu sesión puede haber expirado. Intenta recargar la página.",
          duration: 5000
        });
      } else {
        sonnerToast.error(`Error al cargar el documento ${nombre}: ${errorMessage || 'Error desconocido'}`);
      }
      
      setDocumentoSeleccionado(null);
    } finally {
      setIsLoadingDocument(false);
    }
  };
  
  const cerrarModal = () => {
    setDocumentoSeleccionado(null);
    setDocumentoURL(null);
    setShowDetallesUsuarioDialog(false);
    setTimeout(() => {
      setUsuarioSeleccionado(null);
    }, 300);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoUsuarioForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role" && value === "security") {
      // Solo cambiar el rol, sin asignar email predeterminado
      setNuevoUsuarioForm({
        ...nuevoUsuarioForm,
        [name]: value,
        // No preestablecemos el email para permitir que el usuario ingrese su propio valor
      });
    } else if (name === "residencialID") {
      // Cuando se cambia el residencial, cargar las calles disponibles
      cargarCallesDelResidencial(value);
      
      setNuevoUsuarioForm({
        ...nuevoUsuarioForm,
        [name]: value,
        // Reiniciar la calle seleccionada
        calle: ""
      });
    } else {
      setNuevoUsuarioForm({
        ...nuevoUsuarioForm,
        [name]: value
      });
    }
  };

  const handleCrearUsuario = async (): Promise<void> => {
    setCreandoUsuario(true);
    
    try {
      // Validaciones del formulario
      const formToValidate = { ...nuevoUsuarioForm };
      if (!formToValidate.fullName && formToValidate.role !== 'security') {
        sonnerToast.error('El nombre es obligatorio');
        setCreandoUsuario(false);
        return;
      }
      
      if (!formToValidate.email) {
        sonnerToast.error('El correo electrónico es obligatorio');
        setCreandoUsuario(false);
        return;
      }
      
      if (!formToValidate.residencialID) {
        sonnerToast.error('Debe seleccionar un residencial');
        setCreandoUsuario(false);
        return;
      }
      
      if (!formToValidate.password) {
        sonnerToast.error('La contraseña es obligatoria');
        setCreandoUsuario(false);
        return;
      }
      
      try {
        // Obtener el residencialID correcto del documento de residencial
        let correctResidencialID = formToValidate.residencialID;
        
        try {
          // Intentar obtener el documento del residencial para extraer el residencialID correcto
          const residencialDoc = await getDoc(doc(db, 'residenciales', formToValidate.residencialID));
          
          if (residencialDoc.exists() && residencialDoc.data().residencialID) {
            correctResidencialID = residencialDoc.data().residencialID;
            console.log(`📌 Usando residencialID correcto: ${correctResidencialID}`);
          } else {
            console.warn('⚠️ No se pudo obtener el residencialID correcto, usando el ID del documento');
          }
        } catch (error) {
          console.error('Error al obtener residencialID:', error);
        }
        
        // SOLUCIÓN: Crear una instancia de Firebase completamente independiente
        // Esto evita completamente que se interfiera con la sesión del administrador
        
        // Convertir el rol a UserRole enum
        let userRole: UserRole;
        switch (formToValidate.role) {
          case 'admin':
            userRole = UserRole.Admin;
            break;
          case 'security':
            userRole = UserRole.Guard;
            break;
          case 'resident':
          default:
            userRole = UserRole.Resident;
            break;
        }

        // Usar Firebase Functions para crear el usuario de forma segura
        const { getFunctions, httpsCallable } = await import('firebase/functions');
        
        const functions = getFunctions(undefined, 'us-central1'); // Especificar la región
        
        // Elegir la función correcta según el tipo de usuario
        const functionName = formToValidate.role === 'resident' ? 'createResidentUser' : 'createSecurityUser';
        const createUserFunction = httpsCallable(functions, functionName);
        
        console.log(`🔥 Llamando a Firebase Function ${functionName} con datos:`, {
          email: formToValidate.email,
          role: formToValidate.role,
          residencialId: correctResidencialID
        });
        
        // Preparar datos específicos según el tipo de usuario
        const userData: any = {
          email: formToValidate.email,
          password: formToValidate.password,
          fullName: formToValidate.role === 'security' ? 'Caseta de Seguridad' : formToValidate.fullName,
          paternalLastName: formToValidate.paternalLastName || '',
          maternalLastName: formToValidate.maternalLastName || '',
          role: formToValidate.role,
          residencialId: correctResidencialID,
          residencialDocId: formToValidate.residencialID,
          houseNumber: formToValidate.houseNumber || '0'
        };

        // Agregar campos específicos para residentes
        if (formToValidate.role === 'resident') {
          userData.street = formToValidate.calle || '';
          userData.houseId = formToValidate.houseID || generarHouseID();
        }
        
        const result = await createUserFunction(userData);
        
        console.log('🎉 Resultado de Firebase Function:', result);
        
        const resultData = result.data as { success: boolean; uid: string; message: string };
        
        console.log('✅ Usuario creado exitosamente:', resultData.uid);
        sonnerToast.success('Usuario creado exitosamente en Authentication y Firestore');
        
        // Resetear el formulario y cerrar el modal
        resetFormularioUsuario();
        setShowNuevoUsuarioDialog(false);
        
        // Recargar la lista de usuarios
        await cargarYActualizarUsuarios(residencialSeleccionado);
        
      } catch (authError: any) {
        console.error('Error al crear usuario:', authError);
        
        // Errores específicos de Firebase Auth
        if (authError.code === 'auth/email-already-in-use') {
          sonnerToast.error('El correo electrónico ya está en uso');
        } else if (authError.code === 'auth/invalid-email') {
          sonnerToast.error('El correo electrónico no es válido');
        } else if (authError.code === 'auth/weak-password') {
          sonnerToast.error('La contraseña es muy débil');
        } else if (authError.code === 'auth/api-key-not-valid') {
          sonnerToast.error('Error de configuración: La clave API de Firebase no es válida');
        } else {
          sonnerToast.error(`Error al crear usuario: ${authError.message}`);
        }
      }
    } catch (error) {
      console.error('Error general al crear usuario:', error);
      sonnerToast.error('Error al crear usuario');
    } finally {
      setCreandoUsuario(false);
    }
  };

  const resetFormularioUsuario = () => {
    setNuevoUsuarioForm({
      fullName: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      telefono: "",
      role: "resident",
      residencialID: residencialSeleccionado !== "todos" ? residencialSeleccionado : "",
      houseID: "",
      calle: "",
      houseNumber: "",
      password: ""
    });
  };
  
  // Función para generar el houseID automáticamente (4 caracteres alfanuméricos)
  const generarHouseID = (): string => {
    const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let houseID = '';
    for (let i = 0; i < 4; i++) {
      houseID += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    console.log('🏠 House ID generado:', houseID);
    return houseID;
  };

  // Búsqueda optimizada con debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTypingSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Limpiar recursos
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Función para renderizar la paginación
  const renderPagination = () => {
    if (totalItems <= itemsPerPage) return null;
    
    return (
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {getPageNumbers().map(number => (
              <PaginationItem key={number}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(number);
                  }}
                  isActive={currentPage === number}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
        <div className="text-xs text-muted-foreground text-center mt-2">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} de {totalItems} usuarios
        </div>
      </div>
    );
  };

  // Función para generar números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Número máximo de páginas visibles
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son menos del máximo
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas relevantes alrededor de la actual
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = startPage + maxVisible - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Función para manejar la eliminación de usuarios
  const handleEliminarUsuario = async (usuario: Usuario) => {
    // Verificar si hay un ID válido
    if (!usuario.id) {
      // Es seguro mostrar un toast aquí porque estamos en un evento de usuario
      sonnerToast.error("No se puede eliminar el usuario: ID no válido");
      return;
    }
    
    // Mostrar diálogo de confirmación
    setUsuarioAEliminar(usuario);
  };
  
  // SOLUCIÓN FINAL: Un enfoque controlado manual para evitar congelamiento
  const confirmarEliminarUsuario = useCallback(() => {
    // Verificar que tenemos un usuario válido para eliminar
    if (!usuarioAEliminar || !usuarioAEliminar.id) {
      console.error("⚠️ No hay usuario válido para eliminar");
      return;
    }
    
    // Guardar datos importantes para uso posterior
    const userId = usuarioAEliminar.id;
    const userName = usuarioAEliminar.fullName || "Usuario";
    const esPendiente = usuarioAEliminar.status === 'pending';
    
    // Cerrar el diálogo inmediatamente
    setUsuarioAEliminar(null);
    
    // Mostrar toast de carga (sin referencias para evitar problemas)
    const toastId = sonnerToast.loading(`Eliminando usuario...`);
    
    // Activar estado de eliminación
    setEliminandoUsuario(true);
    
    // Eliminar usuario simplificado
    eliminarUsuario(userId)
      .then(() => {
        // Usar setTimeout para evitar problemas de renderizado
        setTimeout(() => {
          // Actualizar estado de forma sencilla, sin getUsuarios
          setUsuarios(prev => prev.filter(u => u.id !== userId));
          if (esPendiente) {
            setUsuariosPendientes(prev => prev.filter(u => u.id !== userId));
          }
          
          // Cerrar toast y mostrar confirmación
          sonnerToast.dismiss(toastId);
          sonnerToast.success(`Usuario ${userName} eliminado correctamente`);
        }, 300);
      })
      .catch(error => {
        console.error(`❌ Error eliminando usuario:`, error);
        sonnerToast.dismiss(toastId);
        sonnerToast.error(`Error al eliminar usuario: ${error.message || "Error desconocido"}`);
      })
      .finally(() => {
        setTimeout(() => setEliminandoUsuario(false), 300);
      });
  }, [usuarioAEliminar]);

  // Función para manejar eliminación múltiple
  const handleEliminarMultiplesUsuarios = useCallback(async (usuariosAEliminar: Usuario[]) => {
    if (usuariosAEliminar.length === 0) {
      return;
    }

    const toastId = sonnerToast.loading(`Eliminando ${usuariosAEliminar.length} usuarios...`);
    setEliminandoUsuario(true);

    try {
      // Eliminar usuarios en paralelo para mejor rendimiento
      const promesasEliminacion = usuariosAEliminar.map(async (usuario) => {
        if (!usuario.id) throw new Error(`Usuario sin ID válido: ${usuario.fullName}`);
        return await eliminarUsuario(usuario.id);
      });

      await Promise.all(promesasEliminacion);

      // Actualizar estado local removiendo los usuarios eliminados
      const idsEliminados = new Set(usuariosAEliminar.map(u => u.id).filter(Boolean));
      
      setTimeout(() => {
        setUsuarios(prev => prev.filter(u => !u.id || !idsEliminados.has(u.id)));
        setUsuariosPendientes(prev => prev.filter(u => !u.id || !idsEliminados.has(u.id)));
        
        sonnerToast.dismiss(toastId);
        sonnerToast.success(`${usuariosAEliminar.length} usuarios eliminados correctamente`);
      }, 300);

    } catch (error) {
      console.error('❌ Error eliminando usuarios múltiples:', error);
      sonnerToast.dismiss(toastId);
      sonnerToast.error(`Error al eliminar usuarios: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setTimeout(() => setEliminandoUsuario(false), 300);
    }
  }, []);

  // Función para manejar la vista de detalles
  const handleVerDetallesUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowDetallesUsuarioDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios por residencial
            <span className="text-xs block mt-1 flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1 inline" />
              Última actualización: {lastUpdate.toLocaleTimeString()}
              {actualizacionEnTiempoReal && (
                <span className="flex items-center ml-2 text-green-500">
                  <Wifi className="h-3.5 w-3.5 mr-1 animate-pulse" />
                  En tiempo real
                </span>
              )}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col w-[250px]">
          <Select
            value={residencialSeleccionado}
            onValueChange={(value) => {
              if (!residencialIdDelAdmin) {
                setResidencialSeleccionado(value);
                cargarYActualizarUsuarios(value); // Cargar usuarios para el nuevo residencial
                if (value !== "todos") {
                  cargarCallesDelResidencial(value);
                }
              } else {
                sonnerToast.info("Solo puedes ver usuarios de tu residencial asignado.");
              }
            }}
            disabled={!!residencialIdDelAdmin}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar residencial" />
            </SelectTrigger>
            <SelectContent>
              {(!residencialIdDelAdmin || userClaims?.isGlobalAdmin) && (
              <SelectItem value="todos">Todos los residenciales</SelectItem>
              )}
              {residenciales
                .filter(residencial => !!residencial.id)
                .filter(residencial => !residencialIdDelAdmin || (residencial.residencialID === residencialIdDelAdmin) || (mapeoResidenciales[residencial.id!] === residencialIdDelAdmin) )
                .map((residencial) => (
                  <SelectItem key={residencial.id} value={residencial.id!.toString()}>
                    {residencial.nombre}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          {residencialIdDelAdmin ? (
          <p className="text-xs text-muted-foreground mt-1">
              Mostrando usuarios de tu residencial asignado.
          </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Selecciona un residencial para filtrar usuarios.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, email, teléfono..."
              className="pl-8 w-full"
              value={typingSearchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setAdvancedFiltersVisible(!advancedFiltersVisible)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              {advancedFiltersVisible ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>
            <Button onClick={() => setShowNuevoUsuarioDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b">
        <Tabs defaultValue="residentes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="residentes" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Residentes</span>
              <Badge variant="secondary" className="ml-1 h-5">
                {residentes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Seguridad</span>
              <Badge variant="secondary" className="ml-1 h-5">
                {guardias.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="administradores" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span>Admins</span>
              <Badge variant="secondary" className="ml-1 h-5">
                {administradores.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pendientes" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Pendientes</span>
              <Badge variant="secondary" className="ml-1 h-5 text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300">
                {usuariosPendientes.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="residentes">
            <Suspense fallback={<TableSkeleton />}>
              <ContenidoPestanaResidentes
                usuarios={currentUsers}
                titulo={getTituloTabla("residentes")}
                isLoading={isLoading}
                onVerDetalles={handleVerDetallesUsuario}
                onEliminarUsuario={handleEliminarUsuario}
                onEliminarMultiplesUsuarios={handleEliminarMultiplesUsuarios}
                actualizacionEnTiempoReal={actualizacionEnTiempoReal}
                getRolBadge={getRolBadge}
                getResidencialNombre={getResidencialNombre}
                getEstadoBadge={getEstadoBadge}
                renderPagination={renderPagination}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="seguridad">
            <Suspense fallback={<TableSkeleton />}>
              <ContenidoPestanaSeguridad
                usuarios={currentUsers}
                isLoading={isLoading} 
                onVerDetalles={handleVerDetallesUsuario}
                onEliminarUsuario={handleEliminarUsuario}
                onEliminarMultiplesUsuarios={handleEliminarMultiplesUsuarios}
                actualizacionEnTiempoReal={actualizacionEnTiempoReal}
                getRolBadge={getRolBadge}
                getResidencialNombre={getResidencialNombre}
                getEstadoBadge={getEstadoBadge}
                renderPagination={renderPagination}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="administradores">
            <Suspense fallback={<TableSkeleton />}>
              <ContenidoPestanaAdministradores
                usuarios={currentUsers}
                isLoading={isLoading} 
                onVerDetalles={handleVerDetallesUsuario}
                onEliminarUsuario={handleEliminarUsuario}
                onEliminarMultiplesUsuarios={handleEliminarMultiplesUsuarios}
                actualizacionEnTiempoReal={actualizacionEnTiempoReal}
                getRolBadge={getRolBadge}
                getResidencialNombre={getResidencialNombre}
                getEstadoBadge={getEstadoBadge}
                renderPagination={renderPagination}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="pendientes">
            <Suspense fallback={<TableSkeleton />}>
              <ContenidoPestanaPendientes
                usuariosPendientes={currentUsers as Usuario[]}
                isLoading={isLoading}
                actualizacionEnTiempoReal={actualizacionEnTiempoReal}
                getResidencialIdFromUser={getResidencialIdFromUser}
                getResidencialNombre={getResidencialNombre}
                getRolBadge={getRolBadge}
                mostrarDocumento={mostrarDocumento}
                handleRechazarUsuario={handleRechazarUsuario}
                handleAprobarUsuario={handleAprobarUsuario}
                handleEliminarUsuario={handleEliminarUsuario}
                onEliminarMultiplesUsuarios={handleEliminarMultiplesUsuarios}
                renderPagination={renderPagination}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!documentoSeleccionado || isLoadingDocument} onOpenChange={(open) => !open && cerrarModal()}>
        {(!!documentoSeleccionado || isLoadingDocument) && (
          <Suspense fallback={<div className="p-6 text-center">Cargando visor de documentos...</div>}>
            <MostrarDocumentoDialogContent
              documentoSeleccionado={documentoSeleccionado}
              documentoNombre={documentoNombre}
              documentoURL={documentoURL}
              isLoadingDocument={isLoadingDocument}
              onCloseDialog={cerrarModal} 
            />
          </Suspense>
        )}
      </Dialog>

      <Dialog open={showNuevoUsuarioDialog} onOpenChange={setShowNuevoUsuarioDialog}>
        {showNuevoUsuarioDialog && ( 
          <Suspense fallback={<div className="p-6 text-center">Cargando formulario...</div>}>
            <NuevoUsuarioDialogContent
              nuevoUsuarioForm={nuevoUsuarioForm}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              residenciales={residenciales}
              residencialIdDelAdmin={residencialIdDelAdmin}
              mapeoResidenciales={mapeoResidenciales}
              callesDisponibles={callesDisponibles}
              creandoUsuario={creandoUsuario}
              handleCrearUsuario={handleCrearUsuario}
              setShowNuevoUsuarioDialog={setShowNuevoUsuarioDialog}
            />
          </Suspense>
        )}
      </Dialog>

      <Dialog open={!!usuarioAEliminar} onOpenChange={(open) => !open && setUsuarioAEliminar(null)}>
        {!!usuarioAEliminar && ( 
          <Suspense fallback={<div className="p-6 text-center">Cargando confirmación...</div>}>
            <ConfirmarEliminarDialogContent
              usuarioAEliminar={usuarioAEliminar}
              onCloseDialog={() => setUsuarioAEliminar(null)}
              onConfirmDelete={confirmarEliminarUsuario}
              eliminandoUsuario={eliminandoUsuario}
            />
          </Suspense>
        )}
      </Dialog>

      {showDetallesUsuarioDialog && usuarioSeleccionado && (
        <Suspense fallback={<div>Cargando detalles...</div>}>
          <DetallesUsuarioDialog
            usuarioSeleccionado={usuarioSeleccionado}
            showDialog={showDetallesUsuarioDialog}
            onClose={cerrarModal} 
            getResidencialNombre={getResidencialNombre}
            getEstadoBadge={getEstadoBadge}
            getRolBadge={getRolBadge}
            mostrarDocumento={mostrarDocumento}
          />
        </Suspense>
      )}
    </div>
  );
}

const getTituloTabla = (activeTab: string) => {
  switch (activeTab) {
    case 'residentes':
      return 'Residentes';
    case 'seguridad':
      return 'Personal de Seguridad';
    case 'administradores':
      return 'Administradores';
    case 'pendientes':
      return 'Usuarios Pendientes de Aprobación';
    default:
      return 'Usuarios';
  }
}; 
