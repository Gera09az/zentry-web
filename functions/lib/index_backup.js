"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifypaymentstatus = exports.registerpayment = exports.stripewebhookhandler = exports.stripewebhook = exports.setsecurityrole = exports.setresidencialadminstatus = exports.forcesetrole = exports.forcesetadminrole = exports.debugusers = exports.createtestusers = exports.createSecurityUserWeb = exports.createpaymentintent = exports.obtenerEstadoCuentaStripe = exports.stripeWebhookHandler = exports.crearCuentaStripeResidencial = exports.setResidencialAdminStatus = exports.createTestUsers = exports.setUserGlobalAdminClaim = void 0;
// import * as functions from "firebase-functions"; // Comentado o eliminado si no hay otras funciones Gen1
const https_1 = require("firebase-functions/v2/https"); // Para las funciones HTTP que permanecen Gen2
const https_2 = require("firebase-functions/v2/https"); // Para funciones Callable Gen2
const logger = require("firebase-functions/logger"); // Logger de Gen2
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
// Inicializa Firebase Admin SDK si aún no está inicializado.
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const SUPER_ADMIN_UID = "dpEPYUcuMYc7WgFM06iF6HY25rp2"; // Tu UID
// Inicializar Stripe con tu clave secreta
let stripe = null;
try {
    const stripeKey = process.env.STRIPE_SECRET_KEY; // Usar variable de entorno
    if (stripeKey) {
        stripe = new stripe_1.default(stripeKey, {
            apiVersion: "2024-04-10",
        });
        logger.info("Stripe initialized successfully");
    }
    else {
        logger.warn("Stripe secret key (STRIPE_SECRET_KEY) not found in environment variables.");
    }
}
catch (error) {
    logger.error("Error initializing Stripe:", error);
}
/**
 * Función HTTP para establecer un custom claim 'isGlobalAdmin' a un usuario.
 * (Esta función permanece como onRequest, pero usando el import de v2)
 */
exports.setUserGlobalAdminClaim = (0, https_1.onRequest)(async (request, response) => {
    var _a;
    // Permitir CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    // Asegurarse de que sea un método POST
    if (request.method !== "POST") {
        logger.warn("Attempted non-POST request to setUserGlobalAdminClaim");
        response.status(405).send("Method Not Allowed");
        return;
    }
    // --- INICIO DE LA SECCIÓN DE AUTORIZACIÓN ---
    const idToken = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
    if (!idToken) {
        logger.warn("setUserGlobalAdminClaim: Unauthorized - No token provided.");
        response.status(401).send("Unauthorized: No token provided.");
        return;
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid !== SUPER_ADMIN_UID) {
            logger.error(`setUserGlobalAdminClaim: Forbidden - Caller ${decodedToken.uid} is not the super admin.`);
            response.status(403).send("Forbidden: Caller is not authorized.");
            return;
        }
        logger.info(`setUserGlobalAdminClaim: Authorized call by super admin ${decodedToken.uid}`);
    }
    catch (error) {
        logger.error("setUserGlobalAdminClaim: Error verifying auth token.", error);
        response.status(401).send("Unauthorized: Invalid token.");
        return;
    }
    // --- FIN DE LA SECCIÓN DE AUTORIZACIÓN ---
    const { uid, isGlobalAdmin } = request.body;
    if (!uid || typeof uid !== "string") {
        logger.error("setUserGlobalAdminClaim: Missing or invalid 'uid'.", request.body);
        response.status(400).send("Bad Request: Missing or invalid 'uid'.");
        return;
    }
    if (typeof isGlobalAdmin !== "boolean") {
        logger.error("setUserGlobalAdminClaim: Missing or invalid 'isGlobalAdmin'.", request.body);
        response
            .status(400)
            .send("Bad Request: Missing or invalid 'isGlobalAdmin' (must be boolean).");
        return;
    }
    try {
        await admin.auth().setCustomUserClaims(uid, { isGlobalAdmin });
        logger.info(`Successfully set isGlobalAdmin=${isGlobalAdmin} for user ${uid} by super admin ${SUPER_ADMIN_UID}`);
        response.status(200).send({
            message: `Successfully set isGlobalAdmin=${isGlobalAdmin} for user ${uid}`,
        });
    }
    catch (error) {
        logger.error(`Error setting custom claim for user ${uid}:`, error);
        response.status(500).send({ error: "Internal Server Error", details: error });
    }
});
/**
 * FUNCIÓN TEMPORAL: Crear usuarios de prueba
 * Esta función se puede eliminar después de crear los usuarios
 */
exports.createTestUsers = (0, https_1.onRequest)(async (request, response) => {
    // Permitir CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }
    // TEMPORAL: Sin autorización para facilitar la ejecución
    logger.info("Ejecutando creación de usuarios de prueba sin verificación de token (TEMPORAL)");
    // Configuración
    const RESIDENCIAL_CONFIG = {
        residencialDocId: 'K040CWBejin9WdIrLWAG',
        residencialID: 'KR590V',
        calles: ['1', '2', '3', '4', '5'],
        nombreResidencial: 'Residencial KR590V'
    };
    const NOMBRES = [
        'Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Francisco', 'Isabel',
        'Antonio', 'Dolores', 'Manuel', 'Pilar', 'Jesús', 'Mercedes', 'Javier',
        'Francisca', 'David', 'Antonia', 'Daniel', 'Josefa', 'Alejandro', 'Rosario',
        'Rafael', 'Teresa', 'Fernando'
    ];
    const APELLIDOS_PATERNOS = [
        'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez',
        'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
        'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres',
        'Domínguez', 'Vázquez', 'Ramos'
    ];
    const APELLIDOS_MATERNOS = [
        'Silva', 'Castro', 'Vargas', 'Ortega', 'Reyes', 'Delgado', 'Morales',
        'Guerrero', 'Mendoza', 'Vega', 'Rojas', 'Medina', 'Aguilar', 'Herrera',
        'Rivera', 'Flores', 'Ramírez', 'Cruz', 'Cortés', 'Iglesias', 'Santana',
        'Peña', 'Cabrera', 'Lozano', 'Santos'
    ];
    const resultados = [];
    const db = admin.firestore();
    for (let i = 0; i < 25; i++) {
        try {
            const nombre = NOMBRES[i];
            const apellidoPaterno = APELLIDOS_PATERNOS[i];
            const apellidoMaterno = APELLIDOS_MATERNOS[i];
            const numeroCasa = Math.floor(Math.random() * 300) + 1;
            const email = `${i + 1}@test.com`;
            const telefono = `55${Math.floor(Math.random() * 90000000) + 10000000}`;
            const calle = RESIDENCIAL_CONFIG.calles[Math.floor(Math.random() * RESIDENCIAL_CONFIG.calles.length)];
            // Crear usuario en Firebase Auth
            const userRecord = await admin.auth().createUser({
                email: email,
                password: 'test123',
                displayName: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
                emailVerified: true
            });
            // Crear documento en Firestore
            const userData = {
                email: email,
                fullName: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`,
                paternalLastName: apellidoPaterno,
                maternalLastName: apellidoMaterno,
                role: 'resident',
                status: 'approved',
                residencialId: RESIDENCIAL_CONFIG.residencialID,
                residencialID: RESIDENCIAL_CONFIG.residencialID,
                residencialDocId: RESIDENCIAL_CONFIG.residencialDocId,
                houseNumber: numeroCasa.toString(),
                direccion: `${calle} #${numeroCasa}`,
                calle: calle,
                telefono: telefono,
                isGlobalAdmin: false,
                doNotDisturb: false,
                managedResidencials: [],
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };
            await db.collection('usuarios').doc(userRecord.uid).set(userData);
            resultados.push({
                uid: userRecord.uid,
                email: email,
                nombre: `${nombre} ${apellidoPaterno}`,
                casa: `${calle} #${numeroCasa}`
            });
            logger.info(`Usuario creado: ${email}`);
        }
        catch (error) {
            logger.error(`Error creando usuario ${i + 1}:`, error);
        }
    }
    response.status(200).send({
        message: `Usuarios de prueba creados exitosamente`,
        total: resultados.length,
        usuarios: resultados,
        credenciales: {
            emails: '1@test.com hasta 25@test.com',
            password: 'test123'
        }
    });
});
/**
 * Función HTTP para establecer/revocar el rol de administrador de residencial para un usuario.
 * (Esta función permanece como onRequest, pero usando el import de v2)
 */
exports.setResidencialAdminStatus = (0, https_1.onRequest)(async (request, response) => {
    var _a;
    // Permitir CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    // Asegurarse de que sea un método POST
    if (request.method !== "POST") {
        logger.warn("Attempted non-POST request to setResidencialAdminStatus");
        response.status(405).send("Method Not Allowed");
        return;
    }
    // --- INICIO DE LA SECCIÓN DE AUTORIZACIÓN (igual que en setUserGlobalAdminClaim) ---
    const idToken = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
    if (!idToken) {
        logger.warn("setResidencialAdminStatus: Unauthorized - No token provided.");
        response.status(401).send("Unauthorized: No token provided.");
        return;
    }
    let callingUid;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid !== SUPER_ADMIN_UID) {
            logger.error(`setResidencialAdminStatus: Forbidden - Caller ${decodedToken.uid} is not the super admin.`);
            response.status(403).send("Forbidden: Caller is not authorized.");
            return;
        }
        callingUid = decodedToken.uid;
        logger.info(`setResidencialAdminStatus: Authorized call by super admin ${callingUid}`);
    }
    catch (error) {
        logger.error("setResidencialAdminStatus: Error verifying auth token.", error);
        response.status(401).send("Unauthorized: Invalid token.");
        return;
    }
    // --- FIN DE LA SECCIÓN DE AUTORIZACIÓN ---
    const { targetUid, residencialId, isAdmin } = request.body;
    if (!targetUid || typeof targetUid !== "string") {
        logger.error("setResidencialAdminStatus: Missing or invalid 'targetUid'.", request.body);
        response.status(400).send("Bad Request: Missing or invalid 'targetUid'.");
        return;
    }
    if (typeof isAdmin !== "boolean") {
        logger.error("setResidencialAdminStatus: Missing or invalid 'isAdmin'.", request.body);
        response
            .status(400)
            .send("Bad Request: Missing or invalid 'isAdmin' (must be boolean).");
        return;
    }
    if (isAdmin && (!residencialId || typeof residencialId !== "string")) {
        logger.error("setResidencialAdminStatus: 'residencialId' is required and must be a string when 'isAdmin' is true.", request.body);
        response
            .status(400)
            .send("Bad Request: 'residencialId' is required when 'isAdmin' is true.");
        return;
    }
    try {
        let claimsToSet;
        if (isAdmin) {
            claimsToSet = {
                managedResidencialId: residencialId, // residencialId aquí es el que viene del request.body
                isResidencialAdmin: true
            };
        }
        else {
            claimsToSet = {
                managedResidencialId: null,
                isResidencialAdmin: false
            };
        }
        await admin.auth().setCustomUserClaims(targetUid, claimsToSet);
        logger.info(`Successfully set residencial admin status for user ${targetUid} by super admin ${callingUid}. Claims:`, claimsToSet);
        response.status(200).send({
            message: `Successfully set residencial admin status for user ${targetUid}. New claims: ${JSON.stringify(claimsToSet)}`,
        });
    }
    catch (error) {
        logger.error(`Error setting residencial admin status for user ${targetUid}:`, error);
        response.status(500).send({ error: "Internal Server Error", details: error });
    }
});
/**
 * Función para crear una cuenta de Stripe Connect Express y generar link de onboarding
 * (Esta se refactorizará después, por ahora la dejo como onRequest de v2 para que el logger funcione)
 */
exports.crearCuentaStripeResidencial = (0, https_1.onRequest)(// Temporalmente onRequest v2
async (request, response) => {
    var _a;
    // Permitir CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    // Asegurar método POST
    if (request.method !== "POST") {
        logger.warn("Attempted non-POST request to crearCuentaStripeResidencial");
        response.status(405).send("Method Not Allowed");
        return;
    }
    // Verificar autenticación
    const idToken = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
    if (!idToken) {
        logger.warn("crearCuentaStripeResidencial: Unauthorized - No token provided.");
        response.status(401).send("Unauthorized: No token provided.");
        return;
    }
    let callingUser;
    try {
        // Para onRequest, seguimos verificando el token manualmente
        // Para onCall, esto sería request.auth
        callingUser = await admin.auth().verifyIdToken(idToken);
        logger.info(`crearCuentaStripeResidencial: Called by user ${callingUser.uid}`);
    }
    catch (error) {
        logger.error("crearCuentaStripeResidencial: Error verifying auth token.", error);
        response.status(401).send("Unauthorized: Invalid token.");
        return;
    }
    // Para onRequest, los datos están en request.body
    // Para onCall, estarían en request.data
    const { residencialId, adminEmail } = request.body;
    if (!residencialId || typeof residencialId !== "string") {
        logger.error("crearCuentaStripeResidencial: Missing or invalid 'residencialId'.", request.body);
        response.status(400).send("Bad Request: Missing or invalid 'residencialId'.");
        return;
    }
    if (!adminEmail || typeof adminEmail !== "string") {
        logger.error("crearCuentaStripeResidencial: Missing or invalid 'adminEmail'.", request.body);
        response.status(400).send("Bad Request: Missing or invalid 'adminEmail'.");
        return;
    }
    try {
        // Verificar que Stripe esté inicializado
        if (!stripe) {
            logger.error("crearCuentaStripeResidencial: Stripe not initialized");
            response.status(500).send("Service Unavailable: Payment service not configured");
            return;
        }
        // Verificar si el residencial existe
        const residencialDoc = await admin.firestore().collection("residenciales").doc(residencialId).get();
        if (!residencialDoc.exists) {
            logger.error(`crearCuentaStripeResidencial: Residencial ${residencialId} not found.`);
            response.status(404).send("Not Found: Residencial not found.");
            return;
        }
        const residencialData = residencialDoc.data();
        // Verificar si ya tiene cuenta de Stripe
        if (residencialData === null || residencialData === void 0 ? void 0 : residencialData.stripeAccountId) {
            logger.info(`crearCuentaStripeResidencial: Residencial ${residencialId} already has Stripe account.`);
            // Verificar que Stripe esté inicializado
            if (!stripe) {
                logger.error("crearCuentaStripeResidencial: Stripe not initialized for existing account");
                response.status(500).send("Service Unavailable: Payment service not configured");
                return;
            }
            // Generar nuevo link de onboarding para cuenta existente
            const accountLink = await stripe.accountLinks.create({
                account: residencialData.stripeAccountId,
                refresh_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dashboard?stripe_refresh=true`, // Usar variable de entorno
                return_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dashboard?stripe_success=true`, // Usar variable de entorno
                type: "account_onboarding",
            });
            response.status(200).send({
                message: "Existing Stripe account found, new onboarding link generated.",
                onboardingUrl: accountLink.url,
                stripeAccountId: residencialData.stripeAccountId,
            });
            return;
        }
        // Crear nueva cuenta Express
        const account = await stripe.accounts.create({
            type: "express",
            country: "MX", // México
            email: adminEmail,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: "company",
            metadata: {
                residencialId: residencialId,
                adminEmail: adminEmail,
                createdBy: callingUser.uid,
            },
        });
        logger.info(`crearCuentaStripeResidencial: Created Stripe account ${account.id} for residencial ${residencialId}`);
        // Guardar stripeAccountId en Firestore
        await admin.firestore().collection("residenciales").doc(residencialId).update({
            stripeAccountId: account.id,
            stripeStatus: "pendiente",
            stripeCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastModified: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Generar link de onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dashboard?stripe_refresh=true`, // Usar variable de entorno
            return_url: `${process.env.APP_BASE_URL || "http://localhost:3000"}/dashboard?stripe_success=true`, // Usar variable de entorno
            type: "account_onboarding",
        });
        logger.info(`crearCuentaStripeResidencial: Generated onboarding link for account ${account.id}`);
        response.status(200).send({
            message: "Stripe account created successfully.",
            onboardingUrl: accountLink.url,
            stripeAccountId: account.id,
        });
    }
    catch (error) {
        logger.error("crearCuentaStripeResidencial: Error creating Stripe account or onboarding link.", error);
        response.status(500).send({ error: "Internal Server Error", details: error });
    }
});
/**
 * Webhook handler para eventos de Stripe
 * (Esta función permanece como onRequest, pero usando el import de v2)
 */
exports.stripeWebhookHandler = (0, https_1.onRequest)(async (request, response) => {
    // Solo aceptar POST
    if (request.method !== "POST") {
        logger.warn("Attempted non-POST request to stripeWebhookHandler");
        response.status(405).send("Method Not Allowed");
        return;
    }
    const sig = request.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Usar variable de entorno
    if (!sig || !endpointSecret) {
        logger.error("stripeWebhookHandler: Missing signature or endpoint secret");
        response.status(400).send("Bad Request: Missing signature or endpoint secret");
        return;
    }
    let event;
    try {
        // Verificar que Stripe esté inicializado
        if (!stripe) {
            logger.error("stripeWebhookHandler: Stripe not initialized");
            response.status(500).send("Service Unavailable: Payment service not configured");
            return;
        }
        // Verificar la firma del webhook
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    }
    catch (err) { // Asegurar que err es de tipo any o Error
        logger.error(`stripeWebhookHandler: Webhook signature verification failed: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    logger.info(`stripeWebhookHandler: Received event ${event.type} for account ${event.account || event.data.object.id}`);
    // Manejar evento de actualización de cuenta
    if (event.type === "account.updated") {
        const account = event.data.object;
        try {
            // Verificar si la cuenta está completamente verificada
            const isVerified = account.details_submitted &&
                account.charges_enabled &&
                account.payouts_enabled;
            if (isVerified) {
                // Buscar el residencial por stripeAccountId
                const residencialesQuery = await admin.firestore()
                    .collection("residenciales")
                    .where("stripeAccountId", "==", account.id)
                    .limit(1)
                    .get();
                if (!residencialesQuery.empty) {
                    const residencialDoc = residencialesQuery.docs[0];
                    await residencialDoc.ref.update({
                        stripeStatus: "verificado",
                        onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
                        lastModified: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    logger.info(`stripeWebhookHandler: Updated residencial ${residencialDoc.id} status to verificado`);
                }
                else {
                    logger.warn(`stripeWebhookHandler: No residencial found for Stripe account ${account.id}`);
                }
            }
            else {
                logger.info(`stripeWebhookHandler: Account ${account.id} not yet fully verified`);
            }
        }
        catch (error) {
            logger.error(`stripeWebhookHandler: Error updating residencial for account ${account.id}:`, error);
        }
    }
    response.status(200).send("OK");
});
/**
 * Obtiene el estado de una cuenta de Stripe Connect para un residencial.
 * Es una función onCall, por lo que la autenticación es manejada por el SDK.
 */
exports.obtenerEstadoCuentaStripe = (0, https_2.onCall)({ region: "us-central1" }, async (request) => {
    var _a;
    // La autenticación se verifica automáticamente.
    if (!request.auth) {
        throw new https_2.HttpsError("unauthenticated", "El usuario no está autenticado.");
    }
    const { residencialId } = request.data;
    if (!residencialId) {
        throw new https_2.HttpsError("invalid-argument", "El 'residencialId' es requerido.");
    }
    logger.info(`Buscando cuenta de Stripe para residencial: ${residencialId}`, { auth: request.auth });
    try {
        const residencialRef = admin.firestore().collection("residenciales").doc(residencialId);
        const residencialDoc = await residencialRef.get();
        if (!residencialDoc.exists) {
            throw new https_2.HttpsError("not-found", "El residencial no fue encontrado.");
        }
        const stripeAccountId = (_a = residencialDoc.data()) === null || _a === void 0 ? void 0 : _a.stripeAccountId;
        if (!stripeAccountId) {
            logger.info(`No se encontró stripeAccountId para el residencial ${residencialId}`);
            return { hasStripeAccount: false };
        }
        if (!stripe) {
            throw new https_2.HttpsError("internal", "El servicio de Stripe no está inicializado.");
        }
        const account = await stripe.accounts.retrieve(stripeAccountId);
        logger.info(`Cuenta de Stripe recuperada: ${account.id} para residencial ${residencialId}`);
        return {
            hasStripeAccount: true,
            stripeAccountId: account.id,
            onboardingCompleted: account.details_submitted,
            accountDetails: {
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
            },
        };
    }
    catch (error) {
        logger.error(`Error al obtener el estado de la cuenta de Stripe para ${residencialId}:`, error);
        if (error instanceof https_2.HttpsError) {
            throw error;
        }
        // Para errores de la API de Stripe u otros
        if (error instanceof stripe_1.default.errors.StripeError) {
            throw new https_2.HttpsError("internal", `Error de Stripe: ${error.message}`);
        }
        throw new https_2.HttpsError("internal", "Ocurrió un error inesperado al consultar la cuenta de Stripe.");
    }
});
// ===================================================================
// PLACEHOLDER FUNCTIONS - RELLENAR CON LÓGICA REAL
// ===================================================================
exports.createpaymentintent = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'createpaymentintent' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.createSecurityUserWeb = (0, https_2.onCall)(async (request) => {
    logger.info('=== INICIO createSecurityUserWeb ===');
    // Verificar autenticación
    if (!request.auth) {
        logger.error('Usuario no autenticado');
        throw new https_2.HttpsError("unauthenticated", "El usuario no está autenticado.");
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
        throw new https_2.HttpsError("permission-denied", "Solo los administradores pueden crear usuarios.");
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
        throw new https_2.HttpsError("invalid-argument", "Faltan campos obligatorios: email, password, role");
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
            throw new https_2.HttpsError("already-exists", "El correo electrónico ya está en uso");
        }
        else if (error.code === 'auth/invalid-email') {
            throw new https_2.HttpsError("invalid-argument", "El correo electrónico no es válido");
        }
        else if (error.code === 'auth/weak-password') {
            throw new https_2.HttpsError("invalid-argument", "La contraseña es muy débil");
        }
        throw new https_2.HttpsError("internal", `Error al crear usuario: ${error.message}`);
    }
});
exports.createtestusers = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'createtestusers' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.debugusers = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'debugusers' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.forcesetadminrole = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'forcesetadminrole' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.forcesetrole = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'forcesetrole' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.setresidencialadminstatus = (0, https_2.onCall)(async (request) => {
    logger.warn("Función 'setresidencialadminstatus' llamada pero no implementada.");
    throw new https_2.HttpsError("unimplemented", "Function not implemented.");
});
exports.setsecurityrole = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'setsecurityrole' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.stripewebhook = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'stripewebhook' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.stripewebhookhandler = (0, https_2.onCall)(async (request) => {
    logger.warn("Función 'stripewebhookhandler' llamada pero no implementada.");
    throw new https_2.HttpsError("unimplemented", "Function not implemented.");
});
exports.registerpayment = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'registerpayment' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
exports.verifypaymentstatus = (0, https_1.onRequest)(async (req, res) => {
    logger.warn("Función 'verifypaymentstatus' llamada pero no implementada.");
    res.status(501).send("Not Implemented");
});
//# sourceMappingURL=index_backup.js.map