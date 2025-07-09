/**
 * Servicio específico para validación de residenciales durante el registro
 * Contiene los métodos necesarios para el proceso de registro
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ResidentialData {
  id: string;
  residencialID: string;
  nombre: string;
  calles: string[];
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

interface ResidentialValidationResult {
  isValid: boolean;
  data?: ResidentialData;
  error?: string;
}

interface UserCountInHouse {
  count: number;
  maxAllowed: number;
  canRegister: boolean;
}

class RegistrationResidentialService {
  private static instance: RegistrationResidentialService;
  private readonly maxUsersPerHouse = 2;

  private constructor() {}

  static getInstance(): RegistrationResidentialService {
    if (!RegistrationResidentialService.instance) {
      RegistrationResidentialService.instance = new RegistrationResidentialService();
    }
    return RegistrationResidentialService.instance;
  }

  /**
   * Valida un ID de residencial
   */
  async validateResidentialId(residentialId: string): Promise<ResidentialValidationResult> {
    try {
      console.log('🏙️ Validando ID de residencial:', residentialId);

      if (!residentialId || residentialId.length !== 6) {
        return {
          isValid: false,
          error: 'El ID del residencial debe tener exactamente 6 caracteres'
        };
      }

      const residencialesRef = collection(db, 'residenciales');
      const q = query(residencialesRef, where('residencialID', '==', residentialId.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ Residencial no encontrado:', residentialId);
        return {
          isValid: false,
          error: 'ID de residencial no encontrado'
        };
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();

      if (data.activo === false) {
        return {
          isValid: false,
          error: 'Este residencial está desactivado'
        };
      }

      const residentialData: ResidentialData = {
        id: docSnap.id,
        residencialID: data.residencialID,
        nombre: data.nombre || 'Residencial sin nombre',
        calles: Array.isArray(data.calles) ? data.calles : [],
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        activo: data.activo !== false
      };

      console.log('✅ Residencial encontrado:', residentialData.nombre);

      return {
        isValid: true,
        data: residentialData
      };
    } catch (error) {
      console.error('❌ Error al validar residencial:', error);
      return {
        isValid: false,
        error: 'Error al validar el residencial. Intenta nuevamente.'
      };
    }
  }

  /**
   * Cuenta usuarios existentes en una casa específica
   */
  async countUsersInHouse(
    residencialID: string,
    calle: string,
    houseNumber: string
  ): Promise<UserCountInHouse> {
    try {
      console.log('🔍 Verificando usuarios existentes en la casa');

      const usuariosRef = collection(db, 'usuarios');
      const q = query(
        usuariosRef,
        where('residencialID', '==', residencialID),
        where('calle', '==', calle),
        where('houseNumber', '==', houseNumber),
        where('status', 'in', ['pending', 'approved'])
      );

      const querySnapshot = await getDocs(q);
      const count = querySnapshot.docs.length;

      console.log('👨‍👩‍👧‍👦 Usuarios encontrados en la casa:', count);

      return {
        count,
        maxAllowed: this.maxUsersPerHouse,
        canRegister: count < this.maxUsersPerHouse
      };
    } catch (error) {
      console.error('❌ Error al verificar usuarios en la casa:', error);
      return {
        count: 0,
        maxAllowed: this.maxUsersPerHouse,
        canRegister: true
      };
    }
  }

  // Cambiar generateHouseId para máxima legibilidad y unicidad, sin la palabra 'CALLE'
  generateHouseId(residencialId: string, calle: string, houseNumber: string): string {
    const normalizeStreet = (street: string) =>
      street
        .replace(/^CALLE\s+/i, '') // Quitar prefijo 'CALLE' si existe
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/\s+/g, '_') // Espacios por guión bajo
        .toUpperCase();
    const calleNorm = normalizeStreet(calle);
    return `${residencialId}-${calleNorm}-${houseNumber}`;
  }

  /**
   * Valida una dirección completa
   */
  async validateAddress(
    residentialId: string,
    street: string,
    houseNumber: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      const residentialValidation = await this.validateResidentialId(residentialId);
      if (!residentialValidation.isValid) {
        return {
          isValid: false,
          error: residentialValidation.error
        };
      }

      const streets = residentialValidation.data?.calles || [];
      if (!streets.includes(street)) {
        return {
          isValid: false,
          error: 'La calle seleccionada no pertenece a este residencial'
        };
      }

      if (!houseNumber || houseNumber.trim() === '') {
        return {
          isValid: false,
          error: 'El número de casa es obligatorio'
        };
      }

      const userCount = await this.countUsersInHouse(residentialId, street, houseNumber);
      if (!userCount.canRegister) {
        return {
          isValid: false,
          error: `Esta casa ya tiene el máximo de ${userCount.maxAllowed} usuarios registrados`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error al validar dirección:', error);
      return {
        isValid: false,
        error: 'Error al validar la dirección. Intenta nuevamente.'
      };
    }
  }

  /**
   * Verifica si un usuario ya existe
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      console.log('👤 Verificando si el usuario ya existe:', email);

      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      const exists = !querySnapshot.empty;
      console.log(exists ? '⚠️ Usuario ya existe' : '✅ Usuario no existe');

      return exists;
    } catch (error) {
      console.error('❌ Error al verificar existencia del usuario:', error);
      return false;
    }
  }
}

export default RegistrationResidentialService.getInstance(); 