"use strict";
/**
 * Firebase Functions para el proyecto WEB de Zentry
 * Solo contiene las funciones necesarias para evitar conflictos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityUserWeb = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
// Inicializa Firebase Admin SDK si aún no está inicializado.
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.createSecurityUserWeb = (0, https_1.onCall)(async (request) => {
    logger.info('=== INICIO createSecurityUserWeb ===');
    // Verificar autenticación
    if (!request.auth) {
        logger.error('Usuario no autenticado');
        throw new https_1.HttpsError("unauthenticated", "El usuario no está autenticado.");
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
        throw new https_1.HttpsError("permission-denied", "Solo los administradores pueden crear usuarios.");
    }
    logger.info('Usuario autorizado para crear usuarios');
    const { email, password, fullName, paternalLastName, maternalLastName, role, residencialId, residencialDocId, houseNumber } = request.data;
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
        throw new https_1.HttpsError("invalid-argument", "Faltan campos obligatorios: email, password, role");
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
        // 2. Crear documento en Firestore
        const userData = {
            email: email,
            fullName: fullName || '',
            paternalLastName: paternalLastName || '',
            maternalLastName: maternalLastName || '',
            role: role,
            status: 'pending',
            residencialId: residencialId || '',
            residencialID: residencialId || '',
            residencialDocId: residencialDocId || '',
            houseNumber: houseNumber || '0',
            isGlobalAdmin: false,
            doNotDisturb: false,
            managedResidencials: [],
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };
        await admin.firestore()
            .collection('usuarios')
            .doc(userRecord.uid)
            .set(userData);
        logger.info(`Documento de usuario creado en Firestore: ${userRecord.uid}`);
        // 3. Asignar claims si es necesario
        if (role === 'admin' || role === 'security') {
            const customClaims = {};
            if (role === 'admin') {
                customClaims.isAdmin = true;
                customClaims.residencialId = residencialId;
            }
            else if (role === 'security') {
                customClaims.isGuard = true;
                customClaims.residencialId = residencialId;
            }
            await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
            logger.info(`Claims asignados al usuario: ${userRecord.uid}`, customClaims);
        }
        logger.info('=== ÉXITO createSecurityUserWeb ===');
        return {
            success: true,
            uid: userRecord.uid,
            message: 'Usuario creado exitosamente'
        };
    }
    catch (error) {
        logger.error(`Error al crear usuario: ${error.message}`, error);
        if (error.code === 'auth/email-already-exists') {
            throw new https_1.HttpsError("already-exists", "El correo electrónico ya está en uso");
        }
        else if (error.code === 'auth/invalid-email') {
            throw new https_1.HttpsError("invalid-argument", "El correo electrónico no es válido");
        }
        else if (error.code === 'auth/weak-password') {
            throw new https_1.HttpsError("invalid-argument", "La contraseña es muy débil");
        }
        throw new https_1.HttpsError("internal", `Error al crear usuario: ${error.message}`);
    }
});
//# sourceMappingURL=index_new.js.map