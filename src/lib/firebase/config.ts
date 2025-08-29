import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Importaciones opcionales para servicios de cliente
let getMessaging: any;
let getAnalytics: any;

try {
  const messagingModule = require('firebase/messaging');
  getMessaging = messagingModule.getMessaging;
} catch (e) {
  console.warn('Firebase Messaging no disponible');
}

try {
  const analyticsModule = require('firebase/analytics');
  getAnalytics = analyticsModule.getAnalytics;
} catch (e) {
  console.warn('Firebase Analytics no disponible');
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAPKpz9Twt_n8Zgkk8mh4cFNuo4SipwG5c",
  authDomain: "zentryapp-949f4.firebaseapp.com",
  projectId: "zentryapp-949f4",
  storageBucket: "zentryapp-949f4.appspot.com",
  messagingSenderId: "905646843025",
  appId: "1:905646843025:web:9b23d5c6d6d6c78f93cb30",
  measurementId: "G-DK611Z8182"
};

console.log('=== CONFIGURACIÓN DE FIREBASE ===');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key:', firebaseConfig.apiKey);
console.log('Auth Domain:', firebaseConfig.authDomain);

// Inicializar Firebase
let app: any;
if (!getApps().length) {
      app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Inicializar servicios principales
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = (typeof window !== 'undefined') ? getStorage(app) : null;

// Inicializar Analytics con delay
let analytics: any = null;
if (getAnalytics) {
  setTimeout(() => {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn('[Firebase Config] Analytics no disponible:', e);
    }
  }, 2000);
    }

// Inicializar Messaging con delay
let messaging: any = null;
if (getMessaging) {
          setTimeout(() => {
            try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn('[Firebase Config] Messaging no disponible:', e);
    }
  }, 3000);
}

console.log('[Firebase Config] Inicialización completada');

// Exportar servicios
export { app, db, storage, functions };

// Exportación legacy para compatibilidad con archivos existentes
export const auth = {
  get currentUser() {
    // Esta es una implementación simplificada para compatibilidad
    // En archivos nuevos, usar getAuthSafe() directamente
    return null;
  }
};

// Para nuevos archivos, usar esta función async
export async function getAuthSafe() {
  if (typeof window === 'undefined') return null;
  try {
    const mod = await import('firebase/auth') as any;
    const getAuth = mod.getAuth || mod.default?.getAuth;
    return getAuth ? getAuth(app) : null;
  } catch (e) {
    return null;
  }
}

// Funciones de utilidad para operaciones de Auth
export async function signInWithEmailAndPasswordSafe(email: string, password: string) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no disponible');
    return await mod.signInWithEmailAndPassword(auth, email, password);
            } catch (e) {
    throw e;
            }
        }
        
export async function createUserWithEmailAndPasswordSafe(email: string, password: string) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
            try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no disponible');
    return await mod.createUserWithEmailAndPassword(auth, email, password);
            } catch (e) {
    throw e;
  }
}

export async function signOutSafe() {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no está disponible');
    return await mod.signOut(auth);
  } catch (e) {
    console.error('Error en signOutSafe:', e);
    throw e;
  }
}

export async function sendPasswordResetEmailSafe(email: string) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no disponible');
    return await mod.sendPasswordResetEmail(auth, email);
      } catch (e) {
    throw e;
  }
}

export async function signInWithPopupSafe(provider: any) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no disponible');
    return await mod.signInWithPopup(auth, provider);
  } catch (e) {
    throw e;
        }
      }

export async function createGoogleProvider() {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const provider = new mod.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    return provider;
  } catch (e) {
    throw e;
  }
}

export async function createAppleProvider() {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const provider = new mod.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    return provider;
  } catch (e) {
    throw e;
}
}

export async function onAuthStateChangedSafe(callback: (user: any) => void) {
  if (typeof window === 'undefined') return () => {};
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) return () => {};
    return mod.onAuthStateChanged(auth, callback);
  } catch (e) {
    return () => {};
  }
}

export async function updateProfileSafe(user: any, profile: { displayName?: string; photoURL?: string }) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    return await mod.updateProfile(user, profile);
  } catch (e) {
    throw e;
  }
}

export async function signInWithRedirectSafe(provider: any) {
  if (typeof window === 'undefined') throw new Error('Auth solo disponible en el cliente');
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) throw new Error('Firebase Auth no disponible');
    return await mod.signInWithRedirect(auth, provider);
  } catch (e) {
    throw e;
  }
}

export async function getRedirectResultSafe() {
  if (typeof window === 'undefined') return null;
  try {
    const mod = await import('firebase/auth') as any;
    const auth = await getAuthSafe();
    if (!auth) return null;
    return await mod.getRedirectResult(auth);
  } catch (e) {
    return null;
  }
} 