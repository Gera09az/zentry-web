/**
 * Firebase Functions para el proyecto WEB de Zentry
 * Solo contiene las funciones necesarias para evitar conflictos
 */

import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';

// Inicializa Firebase Admin SDK si aún no está inicializado.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const createSecurityUser = onCall(async (request) => {
    logger.info('=== INICIO createSecurityUser ===');
    
    // Verificar autenticación
    if (!request.auth) {
        logger.error('Usuario no autenticado');
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    // Log detallado de claims para debugging
    const userClaims = request.auth.token;
    logger.info('Claims del usuario:', {
        uid: request.auth.uid,
        email: userClaims.email,
        isAdmin: userClaims.isAdmin,
        isGlobalAdmin: userClaims.isGlobalAdmin,
        admin: userClaims.admin,
        globalAdmin: userClaims.globalAdmin,
        role: userClaims.role,
        allClaims: userClaims
    });

    // Verificar que sea un administrador (expandir verificación)
    const isAuthorized = userClaims.isAdmin || 
                        userClaims.isGlobalAdmin || 
                        userClaims.admin || 
                        userClaims.globalAdmin ||
                        userClaims.role === 'admin' ||
                        userClaims.role === 'global_admin';
                        
    if (!isAuthorized) {
        logger.error('Usuario no autorizado para crear usuarios', {
            uid: request.auth.uid,
            claims: userClaims
        });
        throw new HttpsError("permission-denied", "Solo los administradores pueden crear usuarios.");
    }
    
    logger.info('Usuario autorizado para crear usuarios');

    const { 
        email, 
        password, 
        fullName, 
        paternalLastName, 
        maternalLastName, 
        role, 
        residencialId, 
        residencialDocId, 
        houseNumber 
    } = request.data;

    // Log de datos recibidos
    logger.info('Datos recibidos:', {
        email,
        role,
        residencialId,
        residencialDocId,
        houseNumber,
        fullName
    });

    // Validaciones
    if (!email || !password || !role) {
        logger.error('Faltan campos obligatorios');
        throw new HttpsError("invalid-argument", "Faltan campos obligatorios: email, password, role");
    }

    try {
        logger.info(`Creando usuario: ${email} con rol: ${role}`);

        // 1. Crear usuario en Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName || 'Usuario',
            emailVerified: true
        });

        logger.info(`Usuario creado en Authentication: ${userRecord.uid}`);

        // 2. Obtener información del residencial si es necesario
        let residentialInfo: any = {};
        if (residencialDocId) {
            try {
                const residentialDoc = await admin.firestore()
                    .collection('residenciales')
                    .doc(residencialDocId)
                    .get();
                
                if (residentialDoc.exists) {
                    const data = residentialDoc.data();
                    residentialInfo = {
                        residencialName: data?.nombre || data?.name || '',
                        street: data?.direccion || data?.address || '', // Intentar obtener la calle
                        calles: data?.calles || [],
                    };
                    logger.info('Información del residencial obtenida:', residentialInfo);
                }
            } catch (residentialError) {
                logger.warn('Error al obtener información del residencial:', residentialError);
            }
        }

        // 2.5. Generar houseId si es necesario
        let finalHouseId = '';
        if (role === 'resident' || role === 'security') {
            // Generar un ID de casa de 4 caracteres alfanuméricos
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let i = 0; i < 4; i++) {
                finalHouseId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            logger.info(`ID de casa generado automáticamente: ${finalHouseId}`);
        }

        // 3. Crear documento en Firestore
        const userData = {
            uid: userRecord.uid, // Incluir el UID en el documento
            email: email,
            fullName: fullName || '',
            paternalLastName: paternalLastName || '',
            maternalLastName: maternalLastName || '',
            role: role,
            status: 'approved', // Cambiar a 'approved' para usuarios creados por admin
            residencialId: residencialId || '',
            residencialID: residencialId || '',
            residencialDocId: residencialDocId || '',
            houseNumber: houseNumber || '0',
            houseId: finalHouseId, // ID específico de la casa
            street: residentialInfo.street || '', // Añadir calle si está disponible
            isGlobalAdmin: false,
            doNotDisturb: false,
            managedResidencials: [],
            signInProvider: 'admin_created', // Indicar que fue creado por admin
            biometricEnabled: false,
            unreadNotifications: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        await admin.firestore()
            .collection('usuarios')
            .doc(userRecord.uid)
            .set(userData);

        logger.info(`Documento de usuario creado en Firestore: ${userRecord.uid}`);

        // 4. Asignar claims si es necesario
        if (role === 'admin' || role === 'security') {
            const customClaims: any = {};
            
            if (role === 'admin') {
                customClaims.isAdmin = true;
                customClaims.residencialId = residencialId;
            } else if (role === 'security') {
                customClaims.isGuard = true;
                customClaims.residencialId = residencialId;
            }

            await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
            logger.info(`Claims asignados al usuario: ${userRecord.uid}`, customClaims);
        }

        logger.info('=== ÉXITO createSecurityUser ===');
        return {
            success: true,
            uid: userRecord.uid,
            message: 'Usuario creado exitosamente'
        };

    } catch (error: any) {
        logger.error(`Error al crear usuario: ${error.message}`, error);
        
        if (error.code === 'auth/email-already-exists') {
            throw new HttpsError("already-exists", "El correo electrónico ya está en uso");
        } else if (error.code === 'auth/invalid-email') {
            throw new HttpsError("invalid-argument", "El correo electrónico no es válido");
        } else if (error.code === 'auth/weak-password') {
            throw new HttpsError("invalid-argument", "La contraseña es muy débil");
        }
        
        throw new HttpsError("internal", `Error al crear usuario: ${error.message}`);
    }
});

export const publicRegistration = onRequest({
    cors: true
}, async (request, response) => {
    logger.info('=== INICIO registerPublicUser ===');
    
    // Manejar preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        response.set('Access-Control-Allow-Origin', '*');
        response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.status(204).send('');
        return;
    }

    // Solo permitir POST
    if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Configurar CORS headers
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    try {
        const { 
            authMethod,
            email, 
            fullName, 
            paternalLastName, 
            maternalLastName, 
            residencialId, 
            houseNumber,
            identificacionUrl,
            comprobanteUrl
        } = request.body;

        // Log de datos recibidos
        logger.info('Datos de registro público recibidos:', {
            authMethod,
            email,
            fullName,
            residencialId,
            houseNumber,
            identificacionUrl,
            comprobanteUrl,
            hasIdentificacion: !!identificacionUrl,
            hasComprobante: !!comprobanteUrl
        });

        // Validaciones
        if (!email || !fullName || !residencialId) {
            logger.error('Faltan campos obligatorios');
            response.status(400).json({ 
                error: 'Faltan campos obligatorios: email, fullName, residencialId' 
            });
            return;
        }

        // Verificar si el usuario ya existe en Firebase Authentication
        let uid: string;
        let userRecord: any = null;
        let isExistingUser = false;
        
        try {
            // Intentar obtener el usuario existente por email
            userRecord = await admin.auth().getUserByEmail(email);
            uid = userRecord.uid;
            isExistingUser = true;
            logger.info(`Usuario encontrado en Authentication: ${uid}`);
            
            // Verificar si el usuario también existe en Firestore
            const userDoc = await admin.firestore().collection('usuarios').doc(uid).get();
            
            if (userDoc.exists) {
                // Usuario completo: existe en Auth + Firestore
                logger.info(`Usuario ya registrado completamente: ${uid}`);
                throw new Error('Este email ya está registrado y el proceso de registro está completo');
            } else {
                // Usuario a medias: existe en Auth pero NO en Firestore
                logger.info(`Usuario a medias detectado: ${uid} - completando registro en Firestore`);
                
                // Actualizar información del usuario en Authentication si es necesario
                if (userRecord.displayName !== fullName) {
                    await admin.auth().updateUser(uid, {
                        displayName: fullName
                    });
                    logger.info(`Nombre actualizado en Authentication: ${fullName}`);
                }
            }
            
        } catch (authError: any) {
            if (authError.code === 'auth/user-not-found') {
                // Usuario nuevo: no existe en Authentication
                logger.info(`Usuario nuevo, creando en Authentication: ${email}`);
                
                if (authMethod === 'email') {
                    // Para email, crear usuario completo en Authentication
                    try {
                        userRecord = await admin.auth().createUser({
                            email: email,
                            password: `TempPass${Date.now()}!`, // Contraseña temporal que el usuario debe cambiar
                            displayName: fullName,
                            emailVerified: false // Requerirá verificación
                        });
                        uid = userRecord.uid;
                        logger.info(`Usuario de email creado en Authentication: ${uid}`);
                    } catch (createError: any) {
                        logger.error('Error al crear usuario de email:', createError);
                        throw new Error(`Error al crear cuenta: ${createError.message}`);
                    }
                } else {
                    // Para OAuth (Google/Apple), crear usuario temporal que se vinculará después
                    try {
                        userRecord = await admin.auth().createUser({
                            email: email,
                            displayName: fullName,
                            emailVerified: true, // OAuth emails están verificados
                            disabled: true // Deshabilitado hasta que se complete el flujo OAuth
                        });
                        uid = userRecord.uid;
                        logger.info(`Usuario OAuth temporal creado en Authentication: ${uid}`);
                    } catch (createError: any) {
                        logger.error('Error al crear usuario OAuth:', createError);
                        throw new Error(`Error al crear cuenta: ${createError.message}`);
                    }
                }
            } else {
                // Error diferente al buscar usuario
                logger.error('Error al verificar usuario existente:', authError);
                if (authError.message && authError.message.includes('ya está registrado')) {
                    throw authError; // Re-lanzar errores de registro completo
                }
                throw new Error(`Error al verificar cuenta existente: ${authError.message}`);
            }
        }
        
        if (isExistingUser) {
            logger.info(`Completando registro a medias para: ${email} con UID: ${uid}`);
        } else {
            logger.info(`Creando registro público para: ${email} con UID real: ${uid}`);
        }

        // Obtener información del residencial para construir la dirección
        let residentialInfo: any = {};
        let calle = '';
        let direccionCompleta = 'Dirección no disponible';
        
        try {
            // Buscar el residencial por residencialID, no por documento ID
            const querySnapshot = await admin.firestore()
                .collection('residenciales')
                .where('residencialID', '==', residencialId)
                .get();
            
            if (!querySnapshot.empty) {
                const residentialDoc = querySnapshot.docs[0];
                const data = residentialDoc.data();
                residentialInfo = {
                    nombre: data?.nombre || '',
                    direccion: data?.direccion || '',
                    calles: data?.calles || []
                };
                
                // Construir dirección completa
                if (residentialInfo.calles && residentialInfo.calles.length > 0) {
                    calle = residentialInfo.calles[0]; // Usar la primera calle disponible
                    direccionCompleta = `${calle} #${houseNumber || '0'}, ${residentialInfo.nombre}`;
                } else if (residentialInfo.direccion) {
                    calle = residentialInfo.direccion;
                    direccionCompleta = `${residentialInfo.direccion} #${houseNumber || '0'}`;
                } else {
                    calle = residentialInfo.nombre || 'Calle no disponible';
                    direccionCompleta = `${residentialInfo.nombre || 'Residencial'} #${houseNumber || '0'}`;
                }
                
                logger.info('Información del residencial obtenida:', {
                    nombre: residentialInfo.nombre,
                    calle: calle,
                    direccionCompleta: direccionCompleta,
                    callesDisponibles: residentialInfo.calles
                });
            } else {
                logger.warn(`Residencial con ID ${residencialId} no encontrado`);
                calle = 'Calle no disponible';
                direccionCompleta = 'Dirección no disponible';
            }
        } catch (residentialError) {
            logger.error('Error al obtener información del residencial:', residentialError);
            calle = 'Calle no disponible';
            direccionCompleta = 'Dirección no disponible';
        }

        // Generar houseId único de 4 caracteres
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let houseId = '';
        for (let i = 0; i < 4; i++) {
            houseId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Preparar datos del usuario con estructura completa (igual a la app móvil)
        const now = admin.firestore.Timestamp.now();
        const userData = {
            uid: uid,
            email: email,
            fullName: fullName,
            paternalLastName: paternalLastName || '',
            maternalLastName: maternalLastName || '',
            telefono: null, // null como en la app móvil
            role: 'resident',
            status: 'pending', // Usuarios públicos requieren aprobación
            residencialID: residencialId, // Solo esta versión (como en móvil)
            houseNumber: houseNumber || '0',
            houseID: houseId, // ID único de la casa (mayúsculas como en móvil)
            calle: calle, // Campo importante para mostrar dirección
            
            // Campos específicos de registro web/móvil
            emailVerified: authMethod !== 'email', // OAuth emails están verificados
            hasAcceptedTerms: true, // Asumimos que aceptó términos en el proceso
            ownershipStatus: 'own', // Valor por defecto
            privacyPolicyVersion: '1.0.0',
            termsVersion: '1.0.0',
            termsAcceptedAt: now,
            registrationMethod: authMethod,
            
            // Rutas de documentos (formato correcto)
            identificacionPath: identificacionUrl || null,
            comprobantePath: comprobanteUrl || null,
            
            // Array de topics (vacío por defecto)
            topics: [],
            
            // Campos de fecha
            createdAt: now,
            updatedAt: now
        };

        // Crear documento en Firestore (colección 'users' como en la app móvil)
        await admin.firestore()
            .collection('usuarios')
            .doc(uid)
            .set(userData);

        // Respuesta exitosa
        const successMessage = isExistingUser 
            ? `Registro completado exitosamente para usuario existente: ${uid}`
            : `Usuario registrado exitosamente: ${uid}`;
        
        logger.info(successMessage);
        logger.info('=== ÉXITO registerPublicUser ===');
        
        response.status(200).json({
            success: true,
            uid: uid,
            message: isExistingUser ? 'Registro completado exitosamente. Pendiente de aprobación.' : 'Usuario registrado exitosamente. Pendiente de aprobación.',
            wasExistingUser: isExistingUser
        });

    } catch (error: any) {
        logger.error(`Error en registro público: ${error.message}`, error);
        response.status(500).json({ 
            error: `Error en el registro: ${error.message}` 
        });
    }
});

export const createResidentUser = onCall(async (request) => {
    logger.info('=== INICIO createResidentUser ===');
    
    // Verificar autenticación
    if (!request.auth) {
        logger.error('Usuario no autenticado');
        throw new HttpsError("unauthenticated", "El usuario no está autenticado.");
    }

    // Verificar que sea un administrador
    const userClaims = request.auth.token;
    const isAuthorized = userClaims.isAdmin || 
                        userClaims.isGlobalAdmin || 
                        userClaims.admin || 
                        userClaims.globalAdmin ||
                        userClaims.role === 'admin' ||
                        userClaims.role === 'global_admin';
                        
    if (!isAuthorized) {
        logger.error('Usuario no autorizado para crear usuarios');
        throw new HttpsError("permission-denied", "Solo los administradores pueden crear usuarios.");
    }

    const { 
        email, 
        password, 
        fullName, 
        paternalLastName, 
        maternalLastName, 
        residencialId, 
        residencialDocId, 
        houseNumber,
        street,
        houseId 
    } = request.data;

    // Validaciones
    if (!email || !password || !fullName) {
        logger.error('Faltan campos obligatorios');
        throw new HttpsError("invalid-argument", "Faltan campos obligatorios: email, password, fullName");
    }

    try {
        logger.info(`Creando usuario residente: ${email}`);

        // 1. Crear usuario en Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName,
            emailVerified: true
        });

        logger.info(`Usuario residente creado en Authentication: ${userRecord.uid}`);

        // 2. Obtener información del residencial
        let residentialInfo: any = {};
        if (residencialDocId) {
            try {
                const residentialDoc = await admin.firestore()
                    .collection('residenciales')
                    .doc(residencialDocId)
                    .get();
                
                if (residentialDoc.exists) {
                    const data = residentialDoc.data();
                    residentialInfo = {
                        residencialName: data?.nombre || data?.name || '',
                        defaultStreet: data?.direccion || data?.address || '',
                        calles: data?.calles || [],
                    };
                    logger.info('Información del residencial obtenida:', residentialInfo);
                }
            } catch (residentialError) {
                logger.warn('Error al obtener información del residencial:', residentialError);
            }
        }

        // 3. Generar houseId si no se proporciona
        let finalHouseId = houseId;
        if (!finalHouseId) {
            // Generar un ID de casa de 4 caracteres alfanuméricos
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            finalHouseId = '';
            for (let i = 0; i < 4; i++) {
                finalHouseId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            logger.info(`ID de casa generado automáticamente: ${finalHouseId}`);
        }

        // 4. Determinar la calle a usar
        let finalStreet = street || '';
        if (!finalStreet && residentialInfo.calles && residentialInfo.calles.length > 0) {
            // Si no se especificó calle, usar la primera calle disponible del residencial
            finalStreet = residentialInfo.calles[0];
            logger.info(`Usando primera calle del residencial: ${finalStreet}`);
        } else if (!finalStreet && residentialInfo.defaultStreet) {
            // Si no hay calles específicas, usar la dirección general
            finalStreet = residentialInfo.defaultStreet;
            logger.info(`Usando dirección general como calle: ${finalStreet}`);
        }

        // 5. Crear documento completo en Firestore
        const userData = {
            uid: userRecord.uid,
            email: email,
            fullName: fullName,
            paternalLastName: paternalLastName || '',
            maternalLastName: maternalLastName || '',
            role: 'resident',
            status: 'approved', // Aprobado automáticamente por admin
            residencialId: residencialId || '',
            residencialID: residencialId || '',
            residencialDocId: residencialDocId || '',
            houseNumber: houseNumber || '0',
            houseId: finalHouseId, // ID específico de la casa
            street: finalStreet, // Calle específica o default
            isGlobalAdmin: false,
            doNotDisturb: false,
            managedResidencials: [],
            signInProvider: 'admin_created',
            biometricEnabled: false,
            unreadNotifications: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        await admin.firestore()
            .collection('usuarios')
            .doc(userRecord.uid)
            .set(userData);

        logger.info(`Documento de usuario residente creado en Firestore: ${userRecord.uid}`);

        // 6. Asignar claims básicos de residente
        const customClaims = {
            isResident: true,
            residencialId: residencialId
        };

        await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
        logger.info(`Claims de residente asignados al usuario: ${userRecord.uid}`);

        logger.info('=== ÉXITO createResidentUser ===');
        return {
            success: true,
            uid: userRecord.uid,
            message: 'Usuario residente creado exitosamente'
        };

    } catch (error: any) {
        logger.error(`Error al crear usuario residente: ${error.message}`, error);
        
        if (error.code === 'auth/email-already-exists') {
            throw new HttpsError("already-exists", "El correo electrónico ya está en uso");
        } else if (error.code === 'auth/invalid-email') {
            throw new HttpsError("invalid-argument", "El correo electrónico no es válido");
        } else if (error.code === 'auth/weak-password') {
            throw new HttpsError("invalid-argument", "La contraseña es muy débil");
        }
        
        throw new HttpsError("internal", `Error al crear usuario residente: ${error.message}`);
    }
}); 

export const checkEmailProvider = functions.https.onRequest(async (req, res) => {
  // Permitir CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const { email } = req.query;
  if (!email) {
    res.status(400).json({ error: 'Email requerido' });
    return;
  }
  try {
    const userRecord = await admin.auth().getUserByEmail(email as string);
    const providers = userRecord.providerData.map(p => p.providerId);
    res.json({ exists: true, providers });
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      res.json({ exists: false, providers: [] });
      return;
    }
    res.status(500).json({ error: error.message });
  }
}); 