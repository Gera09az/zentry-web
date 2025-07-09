import { getFirestore } from 'firebase/firestore';
import { app } from './config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { getAuthSafe } from './config';
import { Ingreso, clasificarIngreso } from '../../types/ingresos'; // Corregido path
import { VehicleHistory } from '../../types/vehicle-history';
import { Pago, convertirDatosPago } from '../../types/pagos'; // Importar desde tipos de pagos
import { toast } from 'sonner'; // <--- AÑADIDO toast

export const db = getFirestore(app);

export const collections = {
  users: 'users',
  pensionCalculations: 'pensionCalculations',
  documents: 'documents',
  payments: 'payments',
} as const;

// Tipos de datos
export interface Usuario {
  id?: string;
  uid: string;
  email: string;
  fullName: string;
  paternalLastName: string;
  maternalLastName: string;
  telefono: string;
  role: 'admin' | 'resident' | 'security' | 'guest';
  residencialID: string;
  domicilio?: {
    calle: string;
    houseNumber: string;
  };
  houseID?: string;
  houseNumber?: string;
  calle?: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  registrationMethod?: string;
  identificacionUrl?: string;
  comprobanteUrl?: string;
  biometricEnabled?: boolean;
  fcmToken?: string;
  tokenUpdatedAt?: Timestamp | null;
  unreadNotifications?: number;
  notificationSettings?: {
    doNotDisturb: boolean;
    doNotDisturbStart: string;
    doNotDisturbEnd: string;
    emergencies: boolean;
    events: boolean;
    packages: boolean;
    visitors: boolean;
  };
  lastSignInTime: Timestamp | null;
  lastRefreshTime: Timestamp | null;
  signInProvider: string;
  addressValidation?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  isGlobalAdmin?: boolean;
  managedResidencialId?: string;
}

export interface Residencial {
  id?: string;
  residencialID?: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  cuotaMantenimiento: number;
  calles?: string[];
  cuentaPago?: {
    banco: string;
    numeroCuenta: string;
    clabe: string;
    titular: string;
  };
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface AreaComun {
  id?: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  horario: {
    apertura: string;
    cierre: string;
  };
  reservable: boolean;
  imagen?: string;
  estado?: 'activa' | 'inactiva' | 'mantenimiento';
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface Guardia {
  id?: string;
  usuarioId: string;
  nombreGuardia?: string;
  apellidoGuardia?: string;
  horario: {
    dias: string[];
    horaEntrada: string;
    horaSalida: string;
  };
  estado?: 'activo' | 'inactivo' | 'vacaciones';
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface Tag {
  id?: string;
  codigo: string;
  tipo: 'vehicular' | 'peatonal';
  usuarioId: string;
  residencialId: string;
  casa: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface Evento {
  id?: string;
  residencialId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  ubicacion: string;
  organizador: string;
  estado: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface Alerta {
  id?: string;
  residencialId: string;
  tipo: 'seguridad' | 'mantenimiento' | 'emergencia' | 'informativa';
  titulo: string;
  descripcion: string;
  fechaAlerta: Timestamp;
  estado: 'activa' | 'resuelta' | 'en_proceso';
  fechaRegistro: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export interface AlertaPanico {
  id?: string;
  message: string;
  priority: string;
  read: boolean;
  residencialID: string;
  status: 'active' | 'resolved' | 'in_progress';
  timestamp: Timestamp;
  title: string;
  type: string;
  userAddress: string;
  userEmail: string;
  userId: string;
  userName: string;
  userPhone: string;
  _residencialDocId: string;
}

// Funciones para Usuarios
export const getUsuarios = async (opciones?: { 
  limit?: number,
  orderBy?: string,
  orderDirection?: 'asc' | 'desc'
}) => {
  try {
    const usuariosRef = collection(db, 'usuarios');
    // Aplicar opciones si existen
    const limitValue = opciones?.limit || 50;
    const orderByField = opciones?.orderBy || 'fullName';
    const orderDirection = opciones?.orderDirection || 'asc';
    
    // Limitar a usuarios por página y ordenar
    const q = query(
      usuariosRef, 
      orderBy(orderByField, orderDirection), 
      limit(limitValue)
    );
    
    // Usar caché para peticiones iniciales
    const cacheOptions = {
      source: (process.env.NODE_ENV === 'production' ? 'cache' : 'default') as 'cache' | 'default' | 'server'
    };
    
    const snapshot = await getDocs(q);
    
    // Usar un mapeo optimizado con clave específica 
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Usuario[];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    // En caso de error, retornar array vacío para no bloquear la UI
    return [];
  }
};

export const getUsuariosPorResidencial = async (residencialId: string) => {
  try {
    if (!residencialId) {
      return [];
    }
    
    const usuarios = await getUsuarios();
    const usuariosFiltrados = usuarios.filter(usuario => {
      const coincide = usuario.residencialID === residencialId;
      return coincide;
    });
    
    return usuariosFiltrados;
  } catch (error) {
    throw error;
  }
};

export const getUsuariosPendientes = async (opciones?: { limit?: number }) => {
  try {
    const usuariosRef = collection(db, 'usuarios');
    const limitValue = opciones?.limit || 50;
    
    const q = query(
      usuariosRef, 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(limitValue)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Usuario[];
  } catch (error) {
    throw error;
  }
};

export const getUsuario = async (id: string) => {
  try {
    const usuarioRef = doc(db, 'usuarios', id);
    const docSnap = await getDoc(usuarioRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Usuario;
    } else {
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    throw error;
  }
};

export const crearUsuario = async (usuarioData: Partial<Usuario> & { uid: string }) => {
  try {
    if (!usuarioData.uid) {
      throw new Error('El campo uid es obligatorio para crear un usuario');
    }
    
    // Verificar que sea un UID válido (formato Firebase: alfanumérico largo)
    if (usuarioData.uid.length < 10) {
      throw new Error('El UID proporcionado no parece válido (demasiado corto)');
    }
    
    // Verificar que no estemos usando el auth.currentUser.uid para creación
    const auth = await getAuthSafe();
    if (auth && auth.currentUser && auth.currentUser.uid === usuarioData.uid && usuarioData.signInProvider === 'manual_creation') {
      throw new Error('No se puede crear un usuario con el mismo UID que el usuario actual');
    }
    
    // Usar el uid proporcionado como ID del documento
    const usuarioRef = doc(db, 'usuarios', usuarioData.uid);
    
    // Asegurarnos de que los campos obligatorios estén presentes
    const datosMinimos = {
      email: usuarioData.email || '',
      fullName: usuarioData.fullName || '',
      role: usuarioData.role || 'resident',
      residencialID: usuarioData.residencialID || '',
      status: usuarioData.status || 'pending', // Cambiar a pending por defecto
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      signInProvider: usuarioData.signInProvider || 'firebase'
    };
    
    // Guardar en Firestore
    await setDoc(usuarioRef, datosMinimos);
    
    return {
      id: usuarioData.uid,
      ...datosMinimos
    };
  } catch (error) {
    console.error('Error al crear usuario en Firestore:', error);
    throw error;
  }
};

export const actualizarUsuario = async (id: string, usuario: Partial<Usuario>) => {
  try {
    const usuarioRef = doc(db, 'usuarios', id);
    const datosActualizados = {
      ...usuario,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(usuarioRef, datosActualizados);
    return {
      id,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const cambiarEstadoUsuario = async (id: string, estado: Usuario['status']) => {
  return actualizarUsuario(id, { status: estado });
};

// Nueva función para eliminar usuarios
export const eliminarUsuario = async (id: string) => {
  try {
    if (!id) {
      console.error('❌ ID de usuario no válido o vacío');
      throw new Error('ID de usuario no válido');
    }
    
    console.log(`🗑️ Iniciando eliminación de usuario con ID: ${id}`);
    
    // Obtenemos primero el documento para verificar que existe y guardar sus datos
    const usuarioRef = doc(db, 'usuarios', id);
    
    try {
      // Verificar si el documento existe
      const usuarioDoc = await getDoc(usuarioRef);
      
      if (!usuarioDoc.exists()) {
        console.log(`⚠️ El usuario con ID ${id} no existe`);
        throw new Error(`Usuario con ID ${id} no encontrado`);
      }
      
      // Datos del usuario para logging
      const userData = usuarioDoc.data();
      console.log(`📝 Datos del usuario a eliminar: ${userData.email || 'email desconocido'}, rol: ${userData.role || 'rol desconocido'}`);
      
      // Intentar eliminar el usuario
      await deleteDoc(usuarioRef);
      
      console.log(`✅ Usuario con ID ${id} eliminado correctamente`);
      return true;
    } catch (error: any) {
      console.error(`❌ Error al acceder o eliminar el documento de usuario ${id}:`, error);
      
      // Si el error es de permisos, dar un mensaje más claro
      if (error.code === 'permission-denied') {
        throw new Error(`No tienes permisos para eliminar el usuario con ID ${id}`);
      }
      
      throw error;
    }
  } catch (error: any) {
    // Mejorar el mensaje de error para debugging
    const errorMsg = error.message || 'Error desconocido';
    const errorCode = error.code || 'sin_codigo';
    
    console.error(`❌ Error al eliminar usuario ${id}: [${errorCode}] ${errorMsg}`);
    
    // Reenviar el error para que sea manejado por el componente
    throw error;
  }
};

// Funciones para Residenciales
export const getResidenciales = async () => {
  try {
    const residencialesRef = collection(db, 'residenciales');
    const snapshot = await getDocs(residencialesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Residencial[];
  } catch (error) {
    throw error;
  }
};

export const getResidencial = async (id: string) => {
  try {
    const residencialRef = doc(db, 'residenciales', id);
    const docSnap = await getDoc(residencialRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Residencial;
    } else {
      throw new Error('Residencial no encontrado');
    }
  } catch (error) {
    throw error;
  }
};

export const crearResidencial = async (residencial: Omit<Residencial, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    const residencialesRef = collection(db, 'residenciales');
    const nuevoResidencial = {
      ...residencial,
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(residencialesRef, nuevoResidencial);
    return {
      id: docRef.id,
      ...nuevoResidencial
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarResidencial = async (id: string, residencial: Partial<Residencial>) => {
  try {
    const residencialRef = doc(db, 'residenciales', id);
    const datosActualizados = {
      ...residencial,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(residencialRef, datosActualizados);
    return {
      id,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const eliminarResidencial = async (id: string) => {
  try {
    const residencialRef = doc(db, 'residenciales', id);
    await deleteDoc(residencialRef);
    return { id };
  } catch (error) {
    throw error;
  }
};

// Funciones para Áreas Comunes
export const getAreasComunes = async (residencialID: string) => {
  try {
    const areasComunesRef = collection(db, `residenciales/${residencialID}/areasComunes`);
    const snapshot = await getDocs(areasComunesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AreaComun[];
  } catch (error) {
    throw error;
  }
};

export const getAreaComun = async (residencialID: string, areaId: string) => {
  try {
    const areaComunRef = doc(db, `residenciales/${residencialID}/areasComunes/${areaId}`);
    const docSnap = await getDoc(areaComunRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AreaComun;
    } else {
      throw new Error('Área común no encontrada');
    }
  } catch (error) {
    throw error;
  }
};

export const crearAreaComun = async (residencialID: string, areaComun: Omit<AreaComun, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    const areasComunesRef = collection(db, `residenciales/${residencialID}/areasComunes`);
    const nuevaAreaComun = {
      ...areaComun,
      estado: areaComun.estado || 'activa',
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(areasComunesRef, nuevaAreaComun);
    return {
      id: docRef.id,
      ...nuevaAreaComun
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarAreaComun = async (residencialID: string, areaId: string, areaComun: Partial<AreaComun>) => {
  try {
    const areaComunRef = doc(db, `residenciales/${residencialID}/areasComunes/${areaId}`);
    const datosActualizados = {
      ...areaComun,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(areaComunRef, datosActualizados);
    return {
      id: areaId,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const eliminarAreaComun = async (residencialID: string, areaId: string) => {
  try {
    const areaComunRef = doc(db, `residenciales/${residencialID}/areasComunes/${areaId}`);
    await deleteDoc(areaComunRef);
    return { id: areaId };
  } catch (error) {
    throw error;
  }
};

// Suscripción a cambios en áreas comunes de un residencial
export const suscribirseAAreasComunes = (residencialID: string, callback: (areasComunes: AreaComun[]) => void) => {
  try {
    const areasComunesRef = collection(db, `residenciales/${residencialID}/areasComunes`);
    
    return onSnapshot(areasComunesRef, (snapshot) => {
      const areasComunes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AreaComun[];
      
      callback(areasComunes);
    }, (error) => {
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

// Funciones para Guardias
export const getGuardias = async (residencialID: string) => {
  try {
    if (!residencialID) {
      throw new Error('ID del residencial es requerido');
    }
    
    const guardiasRef = collection(db, `residenciales/${residencialID}/guardias`);
    const snapshot = await getDocs(guardiasRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Guardia[];
  } catch (error) {
    throw error;
  }
};

export const getGuardia = async (residencialID: string, guardiaID: string) => {
  try {
    if (!residencialID || !guardiaID) {
      throw new Error('ID del residencial y del guardia son requeridos');
    }
    
    const guardiaRef = doc(db, `residenciales/${residencialID}/guardias/${guardiaID}`);
    const docSnap = await getDoc(guardiaRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Guardia;
    } else {
      throw new Error('Guardia no encontrado');
    }
  } catch (error) {
    throw error;
  }
};

export const crearGuardia = async (residencialID: string, guardia: Omit<Guardia, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    if (!residencialID) {
      throw new Error('ID del residencial es requerido');
    }
    
    const guardiasRef = collection(db, `residenciales/${residencialID}/guardias`);
    const nuevoGuardia = {
      ...guardia,
      estado: guardia.estado || 'activo',
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(guardiasRef, nuevoGuardia);
    return {
      id: docRef.id,
      ...nuevoGuardia
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarGuardia = async (residencialID: string, guardiaID: string, guardia: Partial<Guardia>) => {
  try {
    if (!residencialID || !guardiaID) {
      throw new Error('ID del residencial y del guardia son requeridos');
    }
    
    const guardiaRef = doc(db, `residenciales/${residencialID}/guardias/${guardiaID}`);
    const datosActualizados = {
      ...guardia,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(guardiaRef, datosActualizados);
    return {
      id: guardiaID,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const eliminarGuardia = async (residencialID: string, guardiaID: string) => {
  try {
    if (!residencialID || !guardiaID) {
      throw new Error('ID del residencial y del guardia son requeridos');
    }
    
    const guardiaRef = doc(db, `residenciales/${residencialID}/guardias/${guardiaID}`);
    await deleteDoc(guardiaRef);
    
    return { id: guardiaID };
  } catch (error) {
    throw error;
  }
};

// Suscripción a cambios en guardias de un residencial
export const suscribirseAGuardias = (residencialID: string, callback: (guardias: Guardia[]) => void) => {
  try {
    if (!residencialID) {
      throw new Error('ID del residencial es requerido');
    }
    
    const guardiasRef = collection(db, `residenciales/${residencialID}/guardias`);
    
    return onSnapshot(guardiasRef, (snapshot) => {
      const guardias = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Guardia[];
      
      callback(guardias);
    }, (error) => {
      throw error;
    });
  } catch (error) {
    throw error;
  }
};

// Funciones para Tags
export const getTags = async (residencialId: string) => {
  try {
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, where('residencialId', '==', residencialId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tag[];
  } catch (error) {
    throw error;
  }
};

export const getTagsPorUsuario = async (usuarioId: string) => {
  try {
    const tagsRef = collection(db, 'tags');
    const q = query(tagsRef, where('usuarioId', '==', usuarioId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tag[];
  } catch (error) {
    throw error;
  }
};

export const getTagsPorCasa = async (residencialId: string, casa: string) => {
  try {
    const tagsRef = collection(db, 'tags');
    const q = query(
      tagsRef, 
      where('residencialId', '==', residencialId),
      where('casa', '==', casa)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tag[];
  } catch (error) {
    throw error;
  }
};

export const crearTag = async (tag: Omit<Tag, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    const tagsRef = collection(db, 'tags');
    const nuevoTag = {
      ...tag,
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(tagsRef, nuevoTag);
    return {
      id: docRef.id,
      ...nuevoTag
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarTag = async (id: string, tag: Partial<Tag>) => {
  try {
    const tagRef = doc(db, 'tags', id);
    const datosActualizados = {
      ...tag,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(tagRef, datosActualizados);
    return {
      id,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const cambiarEstadoTag = async (id: string, estado: Tag['estado']) => {
  return actualizarTag(id, { estado });
};

// Funciones para Eventos
export const getEventos = async (residencialId: string) => {
  try {
    const eventosRef = collection(db, 'eventos');
    const q = query(
      eventosRef, 
      where('residencialId', '==', residencialId),
      orderBy('fechaInicio', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Evento[];
  } catch (error) {
    throw error;
  }
};

export const crearEvento = async (evento: Omit<Evento, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    const eventosRef = collection(db, 'eventos');
    const nuevoEvento = {
      ...evento,
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(eventosRef, nuevoEvento);
    return {
      id: docRef.id,
      ...nuevoEvento
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarEvento = async (id: string, evento: Partial<Evento>) => {
  try {
    const eventoRef = doc(db, 'eventos', id);
    const datosActualizados = {
      ...evento,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(eventoRef, datosActualizados);
    return {
      id,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const eliminarEvento = async (id: string) => {
  try {
    const eventoRef = doc(db, 'eventos', id);
    await deleteDoc(eventoRef);
    return { id };
  } catch (error) {
    throw error;
  }
};

// Funciones para Alertas
export const getAlertas = async (residencialId: string) => {
  try {
    const alertasRef = collection(db, 'alertas');
    const q = query(
      alertasRef, 
      where('residencialId', '==', residencialId),
      orderBy('fechaAlerta', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Alerta[];
  } catch (error) {
    throw error;
  }
};

export const getAlertasActivas = async (residencialId: string) => {
  try {
    const alertasRef = collection(db, 'alertas');
    const q = query(
      alertasRef, 
      where('residencialId', '==', residencialId),
      where('estado', '==', 'activa'),
      orderBy('fechaAlerta', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Alerta[];
  } catch (error) {
    throw error;
  }
};

export const crearAlerta = async (alerta: Omit<Alerta, 'id' | 'fechaRegistro' | 'fechaActualizacion'>) => {
  try {
    const alertasRef = collection(db, 'alertas');
    const nuevaAlerta = {
      ...alerta,
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    };
    
    const docRef = await addDoc(alertasRef, nuevaAlerta);
    return {
      id: docRef.id,
      ...nuevaAlerta
    };
  } catch (error) {
    throw error;
  }
};

export const actualizarAlerta = async (id: string, alerta: Partial<Alerta>) => {
  try {
    const alertaRef = doc(db, 'alertas', id);
    const datosActualizados = {
      ...alerta,
      fechaActualizacion: serverTimestamp()
    };
    
    await updateDoc(alertaRef, datosActualizados);
    return {
      id,
      ...datosActualizados
    };
  } catch (error) {
    throw error;
  }
};

export const cambiarEstadoAlerta = async (id: string, estado: Alerta['estado']) => {
  return actualizarAlerta(id, { estado });
};

export const eliminarAlerta = async (id: string) => {
  try {
    const alertaRef = doc(db, 'alertas', id);
    await deleteDoc(alertaRef);
    return { id };
  } catch (error) {
    throw error;
  }
};

// Funciones para Alertas de Pánico
export const getAlertasPanico = async (residencialID: string) => {
  try {
    console.log(`🔍 getAlertasPanico: Buscando alertas para residencial ID: ${residencialID}`);
    
    const alertas: AlertaPanico[] = [];
    
    // Intentar con diferentes nombres de colección
    const coleccionesPosibles = ['alertas', 'alertasPanico', 'panicAlerts'];
    
    // 1. Intentar primero en subcolecciones
    for (const nombreColeccion of coleccionesPosibles) {
      try {
        console.log(`🔍 Intentando con subcolección: ${nombreColeccion}`);
        const coleccionRef = collection(db, `residenciales/${residencialID}/${nombreColeccion}`);
        const snapshot = await getDocs(coleccionRef);
        console.log(`📊 Subcolección '${nombreColeccion}': ${snapshot.docs.length} documentos`);
        
        if (snapshot.docs.length > 0) {
          const alertasEncontradas = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Añadir el ID del documento residencial para futuras operaciones
              _residencialDocId: residencialID
            } as AlertaPanico;
          });
          
          console.log(`✅ Se encontraron ${alertasEncontradas.length} alertas en la subcolección '${nombreColeccion}'`);
          alertas.push(...alertasEncontradas);
          break; // Si encontramos alertas en esta colección, no seguimos buscando
        }
      } catch (error) {
        console.error(`❌ Error al buscar en subcolección '${nombreColeccion}':`, error);
        // Continuar con la siguiente colección
      }
    }
    
    // 2. Si no se encontraron alertas en subcolecciones, intentar en colecciones raíz
    if (alertas.length === 0) {
      console.log(`🔍 No se encontraron alertas en subcolecciones. Buscando en colecciones raíz...`);
      
      for (const nombreColeccion of coleccionesPosibles) {
        try {
          console.log(`🔍 Intentando con colección raíz: ${nombreColeccion}`);
          const coleccionRef = collection(db, nombreColeccion);
          
          // Consulta para buscar documentos con ese ID de residencial
          const q = query(
            coleccionRef,
            where('residencialID', '==', residencialID)
          );
          
          const snapshot = await getDocs(q);
          console.log(`📊 Colección raíz '${nombreColeccion}': ${snapshot.docs.length} documentos para residencial ${residencialID}`);
          
          if (snapshot.docs.length > 0) {
            const alertasEncontradas = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Añadir el ID del documento residencial para futuras operaciones
                _residencialDocId: residencialID
              } as AlertaPanico;
            });
            
            alertas.push(...alertasEncontradas);
            break; // Si encontramos alertas en esta colección, no seguimos buscando
          }
        } catch (error) {
          console.error(`❌ Error al buscar en colección raíz '${nombreColeccion}':`, error);
          // Continuar con la siguiente colección
        }
      }
    }
    
    // 3. Último intento: buscar todas las alertas sin filtrar por residencial
    if (alertas.length === 0) {
      console.log(`🔍 Último intento: buscando todas las alertas sin filtrar por residencial...`);
      
      for (const nombreColeccion of coleccionesPosibles) {
        try {
          console.log(`🔍 Intentando con colección raíz: ${nombreColeccion}`);
          const coleccionRef = collection(db, nombreColeccion);
          const snapshot = await getDocs(coleccionRef);
          console.log(`📊 Colección raíz '${nombreColeccion}' (sin filtro): ${snapshot.docs.length} documentos`);
          
          if (snapshot.docs.length > 0) {
            // Filtrar manualmente por residencialID
            const alertasEncontradas = snapshot.docs
              .filter(doc => {
                const data = doc.data();
                return data.residencialID === residencialID;
              })
              .map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  // Añadir el ID del documento residencial para futuras operaciones
                  _residencialDocId: residencialID
                } as AlertaPanico;
              });
            
            if (alertasEncontradas.length > 0) {
              alertas.push(...alertasEncontradas);
              break; // Si encontramos alertas en esta colección, no seguimos buscando
            }
          }
        } catch (error) {
          console.error(`❌ Error al buscar en colección raíz '${nombreColeccion}' (sin filtro):`, error);
          // Continuar con la siguiente colección
        }
      }
    }
    
    if (alertas.length === 0) {
      console.warn(`⚠️ No se encontraron alertas para el residencial ${residencialID} en ninguna colección`);
    } else {
      console.log(`✅ Total de alertas encontradas: ${alertas.length}`);
    }
    
    // Ordenar por fecha (más recientes primero)
    return alertas.sort((a, b) => {
      const timestampA = a.timestamp?.seconds || 0;
      const timestampB = b.timestamp?.seconds || 0;
      return timestampB - timestampA;
    });
  } catch (error) {
    console.error('❌ Error en getAlertasPanico:', error);
    throw error;
  }
};

export const getAlertasPanicoActivas = async (residencialID: string) => {
  try {
    console.log(`🔍 getAlertasPanicoActivas: Buscando alertas activas para residencial ID: ${residencialID}`);
    const alertasRef = collection(db, `residenciales/${residencialID}/alertas`);
    const q = query(
      alertasRef,
      where('status', '==', 'active'),
      orderBy('timestamp', 'desc')
    );
    
    console.log(`⏳ Ejecutando consulta de alertas activas...`);
    const snapshot = await getDocs(q);
    console.log(`✅ Consulta completada. Alertas activas encontradas: ${snapshot.docs.length}`);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AlertaPanico[];
  } catch (error) {
    console.error('❌ Error al obtener alertas de pánico activas:', error);
    throw error;
  }
};

export const actualizarEstadoAlertaPanico = async (residencialID: string, alertaID: string, estado: AlertaPanico['status']) => {
  try {
    console.log(`🔄 actualizarEstadoAlertaPanico: Actualizando alerta ${alertaID} a estado ${estado} en residencial ${residencialID}`);
    
    // Posible mapeo de IDs: Si el residencialID es un código corto (como "3C45M1"), 
    // necesitamos encontrar el ID real del documento en Firestore
    const residencialesRef = collection(db, 'residenciales');
    const residencialesSnapshot = await getDocs(residencialesRef);
    const residenciales = residencialesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Residencial[];
    
    // Intentar encontrar un mapeo entre códigos cortos y IDs reales
    let residencialRealID = residencialID;
    let encontradoMapeo = false;
    
    // Primero verificamos si ya es un ID válido de documento
    const docSnap = await getDoc(doc(db, 'residenciales', residencialID));
    if (docSnap.exists()) {
      console.log(`✅ El ID ${residencialID} es un ID válido de documento residencial`);
      residencialRealID = residencialID;
      encontradoMapeo = true;
    } else {
      console.log(`⚠️ El ID ${residencialID} no es un ID válido de documento residencial, buscando alternativas...`);
      
      // Si no es un ID válido, buscar en todos los residenciales para ver si alguno tiene este código
      for (const residencial of residenciales) {
        // Verificar si tiene algún código o ID alternativo que coincida
        if (residencial.residencialID === residencialID || 
            (residencial as any).codigo === residencialID ||
            (residencial as any).codigoAlfa === residencialID) {
          residencialRealID = residencial.id || '';
          encontradoMapeo = true;
          console.log(`✅ Encontrado mapeo: código ${residencialID} -> ID real ${residencialRealID}`);
          break;
        }
      }
      
      // Si no encontramos un mapeo explícito, intentemos buscar por nombre en los logs para debugging
      if (!encontradoMapeo) {
        console.log(`⚠️ No se encontró mapeo para código ${residencialID}, intentando encontrar alertas...`);
        
        // Intento alternativo: verificar en qué residencial existen las alertas
        for (const residencial of residenciales) {
          const residencialId = residencial.id || '';
          if (!residencialId) continue;
          
          console.log(`🔍 Verificando si la alerta existe en residencial ${residencial.nombre} (${residencialId})`);
          
          // Verificar si la alerta existe en este residencial
          const alertaRef = doc(db, `residenciales/${residencialId}/alertas`, alertaID);
          const alertaSnap = await getDoc(alertaRef);
          
          if (alertaSnap.exists()) {
            residencialRealID = residencialId;
            encontradoMapeo = true;
            console.log(`✅ ¡Alerta encontrada en residencial ${residencial.nombre} (${residencialId})!`);
            break;
          }
        }
      }
    }
    
    // Si no encontramos el residencial correcto, buscar dinámicamente en todos los residenciales
    if (!encontradoMapeo) {
      console.log(`🔍 Buscando dinámicamente en todos los residenciales para alerta: ${alertaID}`);
      
      // Obtener lista de todos los residenciales dinámicamente
      try {
        const residencialesSnapshot = await getDocs(collection(db, 'residenciales'));
        
        for (const residencialDoc of residencialesSnapshot.docs) {
          const residencialId = residencialDoc.id;
          console.log(`🔍 Verificando residencial dinámico: ${residencialId}`);
          
          const alertaRef = doc(db, `residenciales/${residencialId}/alertas`, alertaID);
        const alertaSnap = await getDoc(alertaRef);
        
        if (alertaSnap.exists()) {
            residencialRealID = residencialId;
          encontradoMapeo = true;
            console.log(`✅ ¡Alerta encontrada en residencial dinámico: ${residencialId}!`);
          break;
        }
        }
      } catch (error) {
        console.error('❌ Error buscando residenciales dinámicamente:', error);
      }
    }
    
    console.log(`🔍 Resultado de mapeo: ID original ${residencialID} -> ID para búsqueda ${residencialRealID}`);
    
    // Intentar con diferentes nombres de colección
    const coleccionesPosibles = ['alertas', 'alertasPanico', 'panicAlerts'];
    let actualizado = false;
    
    // 1. Intentar primero en subcolecciones con el ID real del residencial
    for (const nombreColeccion of coleccionesPosibles) {
      try {
        console.log(`🔍 Intentando actualizar en subcolección: ${nombreColeccion}`);
        const alertaRef = doc(db, `residenciales/${residencialRealID}/${nombreColeccion}`, alertaID);
        console.log(`📍 Path completo: ${alertaRef.path}`);
        
        // Verificar si el documento existe
        const docSnap = await getDoc(alertaRef);
        if (docSnap.exists()) {
          console.log(`✅ Documento encontrado en subcolección '${nombreColeccion}'`);
          console.log(`📄 Datos actuales: ${JSON.stringify(docSnap.data())}`);
          
          // Determinar qué campos actualizar según la estructura
          const data = docSnap.data();
          const actualizacion = {};
          
          if (data.status !== undefined) {
            // Estructura en inglés
            console.log(`🔤 Usando estructura en inglés (status: ${estado})`);
            Object.assign(actualizacion, {
              status: estado,
              read: true
            });
          } else if (data.estado !== undefined) {
            // Estructura en español
            const estadoEspanol = 
              estado === 'active' ? 'activa' : 
              estado === 'resolved' ? 'resuelta' : 
              estado === 'in_progress' ? 'en_proceso' : 'activa';
            
            console.log(`🔤 Usando estructura en español (estado: ${estadoEspanol})`);
            Object.assign(actualizacion, {
              estado: estadoEspanol,
              leida: true
            });
          } else {
            // Estructura desconocida, intentar ambas
            console.log(`⚠️ Estructura desconocida, intentando ambas`);
            Object.assign(actualizacion, {
              status: estado,
              estado: estado === 'active' ? 'activa' : 
                     estado === 'resolved' ? 'resuelta' : 
                     estado === 'in_progress' ? 'en_proceso' : 'activa',
              read: true,
              leida: true
            });
          }
          
          console.log(`📝 Datos a actualizar: ${JSON.stringify(actualizacion)}`);
          
          try {
            await updateDoc(alertaRef, actualizacion);
            console.log(`✅ Alerta actualizada correctamente en subcolección '${nombreColeccion}'`);
            actualizado = true;
            console.log(`🎉 ÉXITO: Alerta ${alertaID} actualizada a estado ${estado} en ${alertaRef.path}`);
            return true; // Retornar true para indicar éxito
          } catch (updateError) {
            console.error(`❌ Error al aplicar updateDoc:`, updateError);
            throw updateError; // Propagar el error para mejor diagnóstico
          }
        } else {
          console.log(`⚠️ Documento no existe en subcolección '${nombreColeccion}'`);
        }
      } catch (error) {
        console.error(`❌ Error al actualizar en subcolección '${nombreColeccion}':`, error);
        // Continuar con la siguiente colección
      }
    }
    
    // 2. Si no se encontró en subcolecciones, intentar en colecciones raíz
    if (!actualizado) {
      console.log(`🔍 No se encontró en subcolecciones. Intentando en colecciones raíz...`);
      
      for (const nombreColeccion of coleccionesPosibles) {
        try {
          console.log(`🔍 Buscando alerta en colección raíz: ${nombreColeccion}`);
          const alertaRef = doc(db, nombreColeccion, alertaID);
          console.log(`📍 Path completo: ${alertaRef.path}`);
          
          // Buscar el documento por ID
          const docSnap = await getDoc(alertaRef);
          
          if (docSnap.exists()) {
            console.log(`✅ Documento encontrado en colección raíz '${nombreColeccion}'`);
            console.log(`📄 Datos actuales: ${JSON.stringify(docSnap.data())}`);
            
            // Determinar qué campos actualizar según la estructura
            const data = docSnap.data();
            const actualizacion = {};
            
            if (data.status !== undefined) {
              // Estructura en inglés
              console.log(`🔤 Usando estructura en inglés (status: ${estado})`);
              Object.assign(actualizacion, {
                status: estado,
                read: true
              });
            } else if (data.estado !== undefined) {
              // Estructura en español
              const estadoEspanol = 
                estado === 'active' ? 'activa' : 
                estado === 'resolved' ? 'resuelta' : 
                estado === 'in_progress' ? 'en_proceso' : 'activa';
              
              console.log(`🔤 Usando estructura en español (estado: ${estadoEspanol})`);
              Object.assign(actualizacion, {
                estado: estadoEspanol,
                leida: true
              });
            } else {
              // Estructura desconocida, intentar ambas
              console.log(`⚠️ Estructura desconocida, intentando ambas`);
              Object.assign(actualizacion, {
                status: estado,
                estado: estado === 'active' ? 'activa' : 
                       estado === 'resolved' ? 'resuelta' : 
                       estado === 'in_progress' ? 'en_proceso' : 'activa',
                read: true,
                leida: true
              });
            }
            
            console.log(`📝 Datos a actualizar: ${JSON.stringify(actualizacion)}`);
            
            try {
              await updateDoc(alertaRef, actualizacion);
              console.log(`✅ Alerta actualizada correctamente en colección raíz '${nombreColeccion}'`);
              actualizado = true;
              console.log(`🎉 ÉXITO: Alerta ${alertaID} actualizada a estado ${estado} en ${alertaRef.path}`);
              return true; // Retornar true para indicar éxito
            } catch (updateError) {
              console.error(`❌ Error al aplicar updateDoc:`, updateError);
              throw updateError; // Propagar el error para mejor diagnóstico
            }
          } else {
            console.log(`⚠️ Documento no existe en colección raíz '${nombreColeccion}'`);
          }
        } catch (error) {
          console.error(`❌ Error al actualizar en colección raíz '${nombreColeccion}':`, error);
          // Continuar con la siguiente colección
        }
      }
    }
      
    // Si llegamos aquí, no se pudo actualizar en ninguna colección
    if (!actualizado) {
      console.error(`❌ No se pudo encontrar la alerta ${alertaID} en ninguna colección`);
      console.log(`📌 RESUMEN: Intentamos actualizar alerta ${alertaID} en residencial ${residencialID} (mapeado a ${residencialRealID}) sin éxito`);
      // En lugar de arrojar un error, vamos a devolver false para indicar fallo
      return false; 
    }
  } catch (error) {
    console.error('❌ Error al actualizar estado de alerta de pánico:', error);
    throw error;
  }
};

export const marcarAlertaPanicoComoLeida = async (residencialID: string, alertaID: string) => {
  try {
    console.log(`📖 marcarAlertaPanicoComoLeida: Marcando alerta ${alertaID} como leída`);
    
    // Intentar con diferentes nombres de colección
    const coleccionesPosibles = ['alertas', 'alertasPanico', 'panicAlerts'];
    let actualizado = false;
    
    for (const nombreColeccion of coleccionesPosibles) {
      try {
        console.log(`🔍 Intentando marcar como leída en colección: ${nombreColeccion}`);
        const alertaRef = doc(db, `residenciales/${residencialID}/${nombreColeccion}`, alertaID);
        
        // Verificar si el documento existe
        const docSnap = await getDoc(alertaRef);
        if (docSnap.exists()) {
          console.log(`✅ Documento encontrado en colección '${nombreColeccion}'`);
          
          // Determinar qué campos actualizar según la estructura
          const data = docSnap.data();
          if (data.read !== undefined) {
            // Estructura en inglés
            await updateDoc(alertaRef, {
              read: true
            });
          } else if (data.leida !== undefined) {
            // Estructura en español
            await updateDoc(alertaRef, {
              leida: true
            });
          } else {
            // Estructura desconocida, intentar ambas
            await updateDoc(alertaRef, {
              read: true,
              leida: true
            });
          }
          
          console.log(`✅ Alerta marcada como leída correctamente en colección '${nombreColeccion}'`);
          actualizado = true;
          break;
        }
      } catch (error) {
        console.error(`❌ Error al marcar como leída en colección '${nombreColeccion}':`, error);
        // Continuar con la siguiente colección
      }
    }
    
    if (!actualizado) {
      throw new Error(`No se pudo marcar la alerta como leída. No se encontró en ninguna colección.`);
    }
  } catch (error) {
    console.error('❌ Error al marcar alerta de pánico como leída:', error);
    throw error;
  }
};

export const suscribirseAAlertasPanico = (residencialID: string, callback: (alertas: AlertaPanico[]) => void) => {
  try {
    let unsubscribe: () => void = () => {};
    console.log(`🔔 suscribirseAAlertasPanico: Iniciando suscripción para residencial ID: ${residencialID}`);
    
    // Intentar con diferentes nombres de colección
    const coleccionesPosibles = ['alertas', 'alertasPanico', 'panicAlerts'];
    
    // Función para probar una colección
    const probarColeccion = (nombreColeccion: string, esColeccionRaiz = false) => {
      try {
        // Definir la referencia a la colección dependiendo de si es raíz o subcolección
        const coleccionPath = esColeccionRaiz 
          ? nombreColeccion // Colección raíz
          : `residenciales/${residencialID}/${nombreColeccion}`; // Subcolección
        
        console.log(`🔍 Suscripción: Intentando con ${esColeccionRaiz ? 'colección raíz' : 'subcolección'}: ${coleccionPath}`);
        
        const coleccionRef = collection(db, coleccionPath);
        
        // Si es una colección raíz, necesitamos filtrar por residencialID
        const q = esColeccionRaiz
          ? query(coleccionRef, where('residencialID', '==', residencialID))
          : query(coleccionRef);
        
        // Crear la suscripción
        return onSnapshot(q, (snapshot) => {
          console.log(`📊 Suscripción: ${nombreColeccion} (${esColeccionRaiz ? 'raíz' : 'subcolección'}): ${snapshot.docs.length} documentos`);
          
          if (snapshot.docs.length > 0) {
            const alertas = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                message: data.message || '',
                priority: data.priority || 'high',
                read: data.read !== undefined ? data.read : data.leida !== undefined ? data.leida : false,
                residencialID: data.residencialID || residencialID,
                status: data.status || data.estado || 'active',
                timestamp: data.timestamp || serverTimestamp(),
                title: data.title || data.titulo || '',
                type: data.type || data.tipo || 'panic_alert',
                userAddress: data.userAddress || data.direccionUsuario || '',
                userEmail: data.userEmail || data.emailUsuario || '',
                userId: data.userId || data.idUsuario || '',
                userName: data.userName || data.nombreUsuario || '',
                userPhone: data.userPhone || data.telefonoUsuario || '',
                _residencialDocId: data.residencialID || residencialID
              } as AlertaPanico;
            });
            
            console.log(`✅ Suscripción: Enviando ${alertas.length} alertas al componente`);
            callback(alertas);
            return true; // Indicar que se encontraron alertas
          }
          
          return false; // Indicar que no se encontraron alertas
        }, (error) => {
          console.error(`❌ Error en suscripción a ${nombreColeccion}:`, error);
          return false; // Indicar que hubo un error
        });
      } catch (error) {
        console.error(`❌ Error al iniciar suscripción a ${nombreColeccion}:`, error);
        return () => {}; // Devolver una función vacía en caso de error
      }
    };
    
    // Primero intentar con subcolecciones
    let suscripcionActiva = false;
    let suscripcionesActivas: (() => void)[] = [];
    
    // Intentar primero con subcolecciones
    for (const nombreColeccion of coleccionesPosibles) {
      if (!suscripcionActiva) {
        const unsub = probarColeccion(nombreColeccion);
        // Guardar la función de cancelación
        suscripcionesActivas.push(unsub);
        
        // Verificar si esta suscripción está obteniendo datos
        setTimeout(() => {
          // Aquí no podemos verificar directamente si hay alertas, 
          // pero guardamos la suscripción para cancelarla después si es necesario
        }, 500);
      }
    }
    
    // Si después de 2 segundos no se han encontrado alertas en las subcolecciones,
    // intentar con colecciones raíz
    setTimeout(() => {
      console.log('⏳ Verificando si se encontraron alertas en subcolecciones...');
      
      // Intentar con colecciones raíz si no hay alertas aún
      for (const nombreColeccion of coleccionesPosibles) {
        const unsub = probarColeccion(nombreColeccion, true); // true indica que es colección raíz
        suscripcionesActivas.push(unsub);
      }
    }, 2000);
    
    // Devolver una función que cancele todas las suscripciones activas
    return () => {
      console.log(`🛑 Cancelando todas las suscripciones para residencial: ${residencialID}`);
      suscripcionesActivas.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('❌ Error en suscribirseAAlertasPanico:', error);
    return () => {}; // Devolver una función vacía en caso de error
  }
};

/**
 * Suscribirse a cambios en usuarios
 * @param callback Función a llamar cuando hay cambios en los usuarios
 * @returns Función para cancelar la suscripción
 */
export const suscribirseAUsuarios = (
  callback: (usuarios: Usuario[]) => void,
  opciones?: { 
    limit?: number, 
    residencialID?: string,
    orderBy?: string,
    orderDirection?: 'asc' | 'desc'
  }
) => {
  let q;
  const limitValue = opciones?.limit || 100;
  const orderByField = opciones?.orderBy || 'createdAt';
  const orderDirection = opciones?.orderDirection || 'desc';
  
  // Construir query basado en opciones
  if (opciones?.residencialID) {
    q = query(
      collection(db, 'usuarios'),
      where('residencialID', '==', opciones.residencialID),
      orderBy(orderByField, orderDirection),
      limit(limitValue)
    );
  } else {
    q = query(
      collection(db, 'usuarios'),
      orderBy(orderByField, orderDirection),
      limit(limitValue)
    );
  }

  let previousData: Usuario[] = [];
  
  return onSnapshot(q, (snapshot) => {
    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Usuario[];

    // Solo actualizar si hay cambios reales
    if (JSON.stringify(previousData) !== JSON.stringify(usuarios)) {
      previousData = usuarios;
      callback(usuarios);
    }
  }, (error) => {
    console.error('Error en suscripción a usuarios:', error);
    // Reintentar la suscripción después de un error
    setTimeout(() => suscribirseAUsuarios(callback, opciones), 5000);
  });
};

/**
 * Suscribirse a cambios en usuarios pendientes
 * @param callback Función a llamar cuando hay cambios en los usuarios pendientes
 * @returns Función para cancelar la suscripción
 */
export const suscribirseAUsuariosPendientes = (
  callback: (usuarios: Usuario[]) => void,
  opciones?: { limit?: number }
) => {
  const limitValue = opciones?.limit || 50;
  
  const q = query(
    collection(db, 'usuarios'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(limitValue)
  );

  let previousData: Usuario[] = [];
  
  return onSnapshot(q, (snapshot) => {
    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Usuario[];

    // Solo actualizar si hay cambios reales
    if (JSON.stringify(previousData) !== JSON.stringify(usuarios)) {
      previousData = usuarios;
      callback(usuarios);
    }
  }, (error) => {
    console.error('Error en suscripción a usuarios pendientes:', error);
    // Reintentar la suscripción después de un error
    setTimeout(() => suscribirseAUsuariosPendientes(callback, opciones), 5000);
  });
};

/**
 * Suscribirse a cambios en los residenciales
 * @param callback Función a llamar cuando hay cambios en los residenciales
 * @returns Función para cancelar la suscripción
 */
export const suscribirseAResidenciales = (callback: (residenciales: Residencial[]) => void) => {
  const q = query(
    collection(db, 'residenciales'),
    orderBy('nombre', 'asc'),
    limit(50) // Limitar a 50 residenciales
  );

  let previousData: Residencial[] = [];
  
  return onSnapshot(q, (snapshot) => {
    const residenciales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Residencial[];

    // Solo actualizar si hay cambios reales
    if (JSON.stringify(previousData) !== JSON.stringify(residenciales)) {
      previousData = residenciales;
      callback(residenciales);
    }
  }, (error) => {
    console.error('Error en suscripción a residenciales:', error);
    // Reintentar la suscripción después de un error
    setTimeout(() => suscribirseAResidenciales(callback), 5000);
  });
};

/**
 * Verifica si el usuario actual es administrador del residencial especificado
 * @param residencialId ID del residencial a verificar
 * @returns Promesa con un booleano que indica si el usuario es administrador
 */
export const esAdministradorDeResidencial = async (residencialId: string): Promise<boolean> => {
  try {
    const auth = await getAuthSafe();
    if (!auth || !auth.currentUser) {
      return false;
    }
    
    const userRef = doc(db, 'usuarios', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().role === 'admin') {
      return true;
    }
    
    const adminRef = doc(db, `residenciales/${residencialId}/admins/${auth.currentUser.uid}`);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return true;
    }
    
    const residencialRef = doc(db, `residenciales/${residencialId}`);
    const residencialSnap = await getDoc(residencialRef);
    
    if (residencialSnap.exists()) {
      const residencialData = residencialSnap.data();
      
      if (residencialData.adminIds && 
          Array.isArray(residencialData.adminIds) && 
          residencialData.adminIds.includes(auth.currentUser.uid)) {
        return true;
      }
      
      if (residencialData.administradores && 
          Array.isArray(residencialData.administradores) && 
          residencialData.administradores.includes(auth.currentUser.uid)) {
        return true;
      }
    }
    
    const userResidencialRef = doc(db, `usuarios/${auth.currentUser.uid}/residenciales/${residencialId}`);
    const userResidencialSnap = await getDoc(userResidencialRef);
    
    if (userResidencialSnap.exists()) {
      const userData = userResidencialSnap.data();
      if (userData.role === 'admin') {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Obtener notificaciones para un residencial específico
 * @param residencialID ID del residencial
 * @returns Promesa con array de notificaciones
 */
export const getNotificaciones = async (residencialID: string) => {
  try {
    console.log(`🔍 getNotificaciones: Buscando notificaciones para residencial ID: ${residencialID}`);
    
    const notificacionesRef = collection(db, `residenciales/${residencialID}/notificaciones`);
    const snapshot = await getDocs(notificacionesRef);
    console.log(`📊 Subcolección 'notificaciones': ${snapshot.docs.length} documentos`);
    
    const notificaciones = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Añadir el ID del documento residencial para futuras operaciones
        _residencialDocId: residencialID
      } as AlertaPanico; // Reutilizamos la misma interfaz por ahora
    });
    
    console.log(`✅ Se encontraron ${notificaciones.length} notificaciones`);
    return notificaciones;
  } catch (error) {
    console.error('❌ Error en getNotificaciones:', error);
    return [];
  }
};

/**
 * Suscribirse a notificaciones de un residencial
 * @param residencialID ID del residencial
 * @param callback Función a llamar cuando hay cambios
 * @returns Función para cancelar la suscripción
 */
export const suscribirseANotificaciones = (residencialID: string, callback: (notificaciones: AlertaPanico[]) => void) => {
  try {
    console.log(`🔔 suscribirseANotificaciones: Iniciando suscripción para residencial ID: ${residencialID}`);
    
    const notificacionesRef = collection(db, `residenciales/${residencialID}/notificaciones`);
    const q = query(notificacionesRef);
    
    return onSnapshot(q, (snapshot) => {
      console.log(`📊 Suscripción a notificaciones: ${snapshot.docs.length} documentos`);
      
      if (snapshot.docs.length > 0) {
        const notificaciones = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            message: data.message || '',
            priority: data.priority || 'high',
            read: data.read !== undefined ? data.read : data.leida !== undefined ? data.leida : false,
            residencialID: data.residencialID || residencialID,
            status: data.status || data.estado || 'active',
            timestamp: data.timestamp || serverTimestamp(),
            title: data.title || data.titulo || '',
            type: data.type || data.tipo || 'notificacion',
            userAddress: data.userAddress || data.direccionUsuario || '',
            userEmail: data.userEmail || data.emailUsuario || '',
            userId: data.userId || data.idUsuario || '',
            userName: data.userName || data.nombreUsuario || '',
            userPhone: data.userPhone || data.telefonoUsuario || '',
            _residencialDocId: data.residencialID || residencialID
          } as AlertaPanico;
        });
        
        console.log(`✅ Suscripción: Enviando ${notificaciones.length} notificaciones al componente`);
        callback(notificaciones);
      } else {
        console.log(`ℹ️ Suscripción: No hay notificaciones para enviar`);
        callback([]);
      }
    }, (error) => {
      console.error(`❌ Error en suscripción a notificaciones:`, error);
      return () => {};
    });
  } catch (error) {
    console.error('❌ Error en suscribirseANotificaciones:', error);
    return () => {};
  }
};

// =====================================================
// FUNCIONES PARA PAGOS
// =====================================================

/**
 * Obtiene los pagos de un residencial específico
 */
export const getPagos = async (residencialID: string): Promise<Pago[]> => {
  try {
    console.log(`🔍 getPagos: Buscando pagos para residencial ID: ${residencialID}`);
    
    const coleccionesPosibles = ['pagos', 'payments'];
    
    for (const nombreColeccion of coleccionesPosibles) {
      console.log(`🔍 Intentando con subcolección: ${nombreColeccion}`);
      
      const colRef = collection(db, `residenciales/${residencialID}/${nombreColeccion}`);
      const q = query(colRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        console.log(`📊 Subcolección '${nombreColeccion}': ${snapshot.docs.length} documentos`);
        console.log(`✅ Se encontraron ${snapshot.docs.length} pagos en la subcolección '${nombreColeccion}'`);
        
        const pagos = snapshot.docs.map(doc => {
          const pagoConvertido = convertirDatosPago(doc.data(), doc.id);
          return {
            ...pagoConvertido,
            _residencialDocId: residencialID
          };
        });
        
        console.log(`✅ Total de pagos encontrados: ${pagos.length}`);
        return pagos;
      } else {
        console.log(`❌ Subcolección '${nombreColeccion}': No hay documentos`);
      }
    }
    
    console.log(`⚠️ No se encontraron pagos en ninguna subcolección para el residencial: ${residencialID}`);
    return [];
  } catch (error) {
    console.error('❌ Error en getPagos:', error);
    throw error;
  }
};

/**
 * Suscripción en tiempo real a los pagos de un residencial
 */
export const suscribirseAPagos = (residencialID: string, callback: (pagos: Pago[]) => void): (() => void) => {
  const pagosRef = collection(db, `residenciales/${residencialID}/pagos`);
  const q = query(pagosRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const pagosData: Pago[] = [];
    querySnapshot.forEach((doc) => {
      const pagoConvertido = convertirDatosPago(doc.data(), doc.id);
      pagosData.push({
        ...pagoConvertido,
        _residencialDocId: residencialID
      });
    });
    callback(pagosData);
  }, (error) => {
    console.error(`Error al suscribirse a pagos para el residencial ${residencialID}:`, error);
    toast.error(`Error al obtener pagos en tiempo real para ${residencialID}`);
  });

  return unsubscribe;
};

// FUNCIONES PARA INGRESOS

/**
 * Obtiene los ingresos de un residencial específico.
 * @param residencialDocId ID del documento del residencial.
 * @returns Promise<Ingreso[]>
 */
export const getIngresos = async (residencialDocId: string): Promise<Ingreso[]> => {
  if (!residencialDocId) {
    console.error("Error: residencialDocId es indefinido en getIngresos");
    return [];
  }
  try {
    console.log(`🔍 getIngresos: Buscando ingresos para residencial ID: ${residencialDocId}`);
    
    const ingresosRef = collection(db, `residenciales/${residencialDocId}/ingresos`);
    const q = query(ingresosRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Se encontraron ${snapshot.docs.length} ingresos para residencial ${residencialDocId}`);
    
    return snapshot.docs.map(doc => clasificarIngreso(doc.data(), doc.id));
  } catch (error) {
    console.error(`Error al obtener ingresos para el residencial ${residencialDocId}:`, error);
    toast.error("Error al cargar los registros de ingresos.");
    return [];
  }
};

/**
 * Se suscribe a los cambios en los ingresos de un residencial específico.
 * @param residencialDocId ID del documento del residencial.
 * @param callback Función a llamar con los datos actualizados.
 * @returns Función para cancelar la suscripción.
 */
export const suscribirseAIngresos = (residencialDocId: string, callback: (ingresos: Ingreso[]) => void): (() => void) => {
  if (!residencialDocId) {
    console.error("Error: residencialDocId es indefinido en suscribirseAIngresos");
    return () => {};
  }
  try {
    console.log(`🔔 suscribirseAIngresos: Configurando suscripción para residencial ID: ${residencialDocId}`);
    
    const ingresosRef = collection(db, `residenciales/${residencialDocId}/ingresos`);
    const q = query(ingresosRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`📊 Suscripción ingresos: ${querySnapshot.docs.length} documentos recibidos para ${residencialDocId}`);
      
      const ingresosData: Ingreso[] = [];
      querySnapshot.forEach((doc) => {
        ingresosData.push(clasificarIngreso(doc.data(), doc.id));
      });
      callback(ingresosData);
    }, (error) => {
      console.error(`Error al suscribirse a ingresos para el residencial ${residencialDocId}:`, error);
      toast.error(`Error al obtener ingresos en tiempo real para ${residencialDocId}.`);
      callback([]); 
    });

    return unsubscribe;
  } catch (error) {
    console.error(`Error al intentar configurar la suscripción a ingresos para ${residencialDocId}:`, error);
    toast.error("Error crítico al configurar la escucha de ingresos.");
    return () => {};
  }
};

// =====================================================
// FUNCIONES PARA HISTORIAL DE VEHÍCULOS
// =====================================================

// Helper para convertir Timestamp de Firestore a Date
const convertFirestoreTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }
  return new Date();
};

/**
 * Obtiene el historial de un vehículo específico por su placa
 * @param residencialDocId ID del documento del residencial
 * @param placa Placa del vehículo
 * @returns Promise<VehicleHistory | null>
 */
export const getVehicleHistory = async (
  residencialDocId: string, 
  placa: string
): Promise<VehicleHistory | null> => {
  if (!residencialDocId || !placa) {
    console.error("Error: residencialDocId o placa es indefinido en getVehicleHistory");
    return null;
  }
  
  try {
    console.log(`🔍 getVehicleHistory: Buscando historial para placa ${placa} en residencial ${residencialDocId}`);
    
    const docRef = doc(db, `residenciales/${residencialDocId}/vehicle_history/${placa}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`✅ Historial pre-calculado encontrado para placa ${placa}`);
      
      // Calcular estadísticas
      const personas = data.personas || [];
      const totalPersonas = personas.length;
      const totalIngresos = personas.reduce((sum: number, persona: any) => sum + (persona.totalEntries || 0), 0);
      
      // Encontrar primera y última entrada global
      let firstGlobalEntry = null;
      let lastGlobalEntry = null;
      
      if (personas.length > 0) {
        const allEntries = personas.flatMap((persona: any) => [persona.firstEntry, persona.lastEntry])
          .filter(Boolean)
          .map((entry: string) => new Date(entry))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());
        
        if (allEntries.length > 0) {
          firstGlobalEntry = allEntries[0].toISOString();
          lastGlobalEntry = allEntries[allEntries.length - 1].toISOString();
        }
      }
      
      const vehicleHistory: VehicleHistory = {
        id: docSnap.id,
        created: data.created,
        lastUpdated: data.lastUpdated,
        personas: data.personas || [],
        placa: data.placa || placa,
        vehicleInfo: data.vehicleInfo || {
          color: '',
          marca: '',
          modelo: '',
          placa: placa
        },
        // Campos calculados
        _totalPersonas: totalPersonas,
        _totalIngresos: totalIngresos,
        _firstGlobalEntry: firstGlobalEntry,
        _lastGlobalEntry: lastGlobalEntry
      };
      
      return vehicleHistory;
    } else {
      console.log(`⚠️ No se encontró historial pre-calculado para la placa ${placa}. Construyendo sobre la marcha...`);
      
      const ingresosRef = collection(db, `residenciales/${residencialDocId}/ingresos`);
      const q = query(
        ingresosRef, 
        where("vehicleInfo.placa", "==", placa),
        orderBy("timestamp", "desc")
      );
      
      const ingresosSnap = await getDocs(q);
      
      if (ingresosSnap.empty) {
        console.log(`🚫 No se encontraron ingresos para la placa ${placa}.`);
        return null;
      }

      const ingresos = ingresosSnap.docs.map(doc => clasificarIngreso(doc.data(), doc.id));
      
      const firstEntry = ingresos[ingresos.length - 1];
      const lastEntry = ingresos[0];
      
      const vehicleHistory: VehicleHistory = {
        id: placa,
        placa: placa,
        vehicleInfo: firstEntry.vehicleInfo || { placa, color: 'N/A', marca: 'N/A', modelo: 'N/A' },
        personas: [], // El procesamiento de personas es complejo, se omite en la versión on-the-fly
        created: firstEntry.timestamp,
        lastUpdated: lastEntry.timestamp,
        _totalPersonas: 0, // No se calcula on-the-fly
        _totalIngresos: ingresos.length,
        _firstGlobalEntry: firstEntry.timestamp.toString(),
        _lastGlobalEntry: lastEntry.timestamp.toString(),
        _isLive: true, // Flag para indicar que es una respuesta construida en vivo
        _rawIngresos: ingresos, // Devolvemos los ingresos crudos para el detalle
      };
      
      console.log(`✅ Historial construido en vivo para placa ${placa} con ${ingresos.length} ingresos.`);
      return vehicleHistory;
    }
  } catch (error: any) {
    console.error(`❌ Error al obtener historial del vehículo ${placa}:`, error);
    
    // Si el error es por índice faltante, proveer el link para crearlo
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      const url = `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClJwcm9qZWN0cy96ZW50cnktY2VudHJhbC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvaW5ncmVzb3MvaW5kZXhlcy9fEAEaFgoSdmVoaWNsZUluZm8ucGxhY2EQARoNCgl0aW1lc3RhbXAQAg`;
      console.error('ÍNDICE FALTANTE: Por favor, crea el siguiente índice compuesto en Firestore:');
      console.error(url);
      toast.error('Se requiere una configuración en la base de datos. Contacta a soporte.');
      toast.info('Link de configuración en la consola del navegador.');
    } else {
      toast.error(`Error al cargar el historial del vehículo ${placa}`);
    }
    
    return null;
  }
};

/**
 * Obtiene todos los historiales de vehículos de un residencial
 * @param residencialDocId ID del documento del residencial
 * @returns Promise<VehicleHistory[]>
 */
export const getAllVehicleHistories = async (residencialDocId: string): Promise<VehicleHistory[]> => {
  if (!residencialDocId) {
    console.error("Error: residencialDocId es indefinido en getAllVehicleHistories");
    return [];
  }
  
  try {
    console.log(`🔍 getAllVehicleHistories: Buscando todos los historiales para residencial ${residencialDocId}`);
    
    const vehicleHistoriesRef = collection(db, `residenciales/${residencialDocId}/vehicle_history`);
    const q = query(vehicleHistoriesRef, orderBy("lastUpdated", "desc"));
    const snapshot = await getDocs(q);
    
    console.log(`📊 Se encontraron ${snapshot.docs.length} historiales de vehículos para residencial ${residencialDocId}`);
    
    const vehicleHistories: VehicleHistory[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const personas = data.personas || [];
      const totalPersonas = personas.length;
      const totalIngresos = personas.reduce((sum: number, persona: any) => sum + (persona.totalEntries || 0), 0);
      
      // Encontrar primera y última entrada global
      let firstGlobalEntry = null;
      let lastGlobalEntry = null;
      
      if (personas.length > 0) {
        const allEntries = personas.flatMap((persona: any) => [persona.firstEntry, persona.lastEntry])
          .filter(Boolean)
          .map((entry: string) => new Date(entry))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());
        
        if (allEntries.length > 0) {
          firstGlobalEntry = allEntries[0].toISOString();
          lastGlobalEntry = allEntries[allEntries.length - 1].toISOString();
        }
      }
      
      vehicleHistories.push({
        id: doc.id,
        created: data.created,
        lastUpdated: data.lastUpdated,
        personas: personas,
        placa: data.placa || doc.id,
        vehicleInfo: data.vehicleInfo || {
          color: '',
          marca: '',
          modelo: '',
          placa: data.placa || doc.id
        },
        // Campos calculados
        _totalPersonas: totalPersonas,
        _totalIngresos: totalIngresos,
        _firstGlobalEntry: firstGlobalEntry,
        _lastGlobalEntry: lastGlobalEntry
      });
    });
    
    return vehicleHistories;
  } catch (error) {
    console.error(`❌ Error al obtener historiales de vehículos para residencial ${residencialDocId}:`, error);
    toast.error("Error al cargar los historiales de vehículos");
    return [];
  }
};

interface EfectivoPaymentData {
  residencialId: string;
  userId: string;
  userName: string;
  amount: number;
  concept: string;
  paymentDate: Date;
}

export const registrarPagoEfectivo = async (data: EfectivoPaymentData): Promise<void> => {
  const { residencialId, userId, userName, amount, concept, paymentDate } = data;

  if (!residencialId) {
    throw new Error("El ID del residencial es requerido para registrar un pago.");
  }

  try {
    const pagosRef = collection(db, `residenciales/${residencialId}/pagos`);
    
    const newPaymentDoc = {
      amount: amount * 100, // Guardar en centavos
      currency: 'mxn',
      description: concept,
      status: 'succeeded',
      paymentMethod: 'cash',
      user: {
        id: userId,
        name: userName,
      },
      timestamp: Timestamp.fromDate(paymentDate),
      createdAt: serverTimestamp(),
    };

    await addDoc(pagosRef, newPaymentDoc);
    console.log("Pago en efectivo registrado con éxito");

  } catch (error) {
    console.error("Error al registrar el pago en efectivo:", error);
    throw new Error("No se pudo registrar el pago en efectivo en la base de datos.");
  }
};