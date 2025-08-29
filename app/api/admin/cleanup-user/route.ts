import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin si no está inicializado
if (getApps().length === 0) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no está configurada');
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
    });
  } catch (error) {
    console.error('Error inicializando Firebase Admin:', error);
    // No lanzar error aquí para permitir build
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Cleanup User] Iniciando diagnóstico y limpieza de usuario');
    
    const { email, action } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    console.log(`🔍 [Cleanup User] Procesando email: ${email}, acción: ${action}`);

    const auth = getAuth();
    const firestore = getFirestore();
    const storage = getStorage();
    const bucket = storage.bucket();

    let authUser = null;
    let firestoreUser = null;
    let storageFiles: string[] = [];

    // 1. Verificar en Firebase Authentication
    try {
      authUser = await auth.getUserByEmail(email);
      console.log(`✅ [Cleanup User] Usuario encontrado en Auth: ${authUser.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`ℹ️ [Cleanup User] Usuario NO encontrado en Auth`);
      } else {
        console.error(`❌ [Cleanup User] Error verificando Auth:`, error);
      }
    }

    // 2. Verificar en Firestore (colección usuarios)
    if (authUser) {
      try {
        const userDoc = await firestore.collection('usuarios').doc(authUser.uid).get();
        if (userDoc.exists) {
          firestoreUser = { id: userDoc.id, ...userDoc.data() };
          console.log(`✅ [Cleanup User] Usuario encontrado en Firestore: ${authUser.uid}`);
        } else {
          console.log(`ℹ️ [Cleanup User] Usuario NO encontrado en Firestore`);
        }
      } catch (error) {
        console.error(`❌ [Cleanup User] Error verificando Firestore:`, error);
      }
    }

    // 3. Buscar archivos en Storage
    try {
      const [files] = await bucket.getFiles({
        prefix: 'public_registration/',
      });
      
      for (const file of files) {
        const metadata = await file.getMetadata();
        const customMetadata = metadata[0]?.metadata;
        
        if (customMetadata?.email === email) {
          storageFiles.push(file.name);
        }
      }
      
      console.log(`🗂️ [Cleanup User] Archivos encontrados en Storage: ${storageFiles.length}`);
    } catch (error) {
      console.error(`❌ [Cleanup User] Error verificando Storage:`, error);
    }

    // Si solo es diagnóstico, retornar información
    if (action === 'diagnose' || !action) {
      return NextResponse.json({
        success: true,
        diagnosis: {
          email,
          authUser: authUser ? {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            emailVerified: authUser.emailVerified,
            disabled: authUser.disabled,
            creationTime: authUser.metadata.creationTime,
          } : null,
          firestoreUser: firestoreUser ? {
            uid: (firestoreUser as any).uid,
            role: (firestoreUser as any).role,
            status: (firestoreUser as any).status,
          } : null,
          storageFiles: storageFiles,
          canCleanup: !!(authUser || firestoreUser || storageFiles.length > 0)
        }
      });
    }

    // Si es limpieza, proceder a eliminar
    if (action === 'cleanup') {
      const results = {
        authDeleted: false,
        firestoreDeleted: false,
        storageFilesDeleted: 0,
        errors: [] as string[]
      };

      // Eliminar de Authentication
      if (authUser) {
        try {
          await auth.deleteUser(authUser.uid);
          results.authDeleted = true;
          console.log(`🗑️ [Cleanup User] Usuario eliminado de Auth: ${authUser.uid}`);
        } catch (error: any) {
          const errorMsg = `Error eliminando de Auth: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(`❌ [Cleanup User] ${errorMsg}`);
        }
      }

      // Eliminar de Firestore
      if (firestoreUser) {
        try {
          await firestore.collection('usuarios').doc(authUser!.uid).delete();
          results.firestoreDeleted = true;
          console.log(`🗑️ [Cleanup User] Usuario eliminado de Firestore: ${authUser!.uid}`);
        } catch (error: any) {
          const errorMsg = `Error eliminando de Firestore: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(`❌ [Cleanup User] ${errorMsg}`);
        }
      }

      // Eliminar archivos de Storage
      for (const fileName of storageFiles) {
        try {
          await bucket.file(fileName).delete();
          results.storageFilesDeleted++;
          console.log(`🗑️ [Cleanup User] Archivo eliminado: ${fileName}`);
        } catch (error: any) {
          const errorMsg = `Error eliminando archivo ${fileName}: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(`❌ [Cleanup User] ${errorMsg}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Limpieza completada',
        results
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida. Use "diagnose" o "cleanup"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [Cleanup User] Error general:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
} 