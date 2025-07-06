<!-- TODO: Implementar el dashboard web para el sistema de alertas siguiendo este plan. -->

# 📋 PLAN DE IMPLEMENTACIÓN: SISTEMA DE ALERTAS (WEB DASHBOARD)

Este documento detalla el plan de implementación del dashboard de administración y visualización para el sistema de alertas de seguridad en la aplicación web Zentry (Next.js).

---

## 🎯 **Objetivo**

Construir una interfaz web robusta para que los administradores puedan monitorear, gestionar y analizar las alertas de seguridad generadas por el sistema. Además, permitir a los usuarios (administradores y residentes) configurar sus preferencias de notificación.

---

## 🏗️ **FASE 1: Tipos de Datos y UI Foundation**

**Descripción:** Definir las estructuras de datos en TypeScript y preparar los componentes básicos de la UI que se reutilizarán en el dashboard.

### **Acciones:**

1.  **Definir Tipos de Datos para Alertas:**
    *   **Archivo:** `Zentry WEB/src/types/alerts.ts` (crear si no existe)
    *   **Propósito:** Asegurar la consistencia de los datos entre el frontend y el backend.
    *   **Código:**
        ```typescript
        // TODO: [ALERTAS-W-F1-1] Crear el archivo y definir los tipos de TypeScript para las alertas
        export type AlertType = 'CRITICAL' | 'MODERATE' | 'INFO';

        export type AlertCategory =
          | 'VEHICLE_CHANGE'
          | 'MISSING_VEHICLE'
          | 'FREQUENT_LOST_PASS'
          | 'SUSPICIOUS_EXIT_TIME'
          | 'EXCESSIVE_STAY'
          | 'OUT_OF_HOURS'
          | 'FORCED_EXIT'
          | 'INVALID_QR'
          | 'COMPROMISED_GUARD';

        export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

        export interface ExitAlert {
          id: string;
          type: AlertType;
          category: AlertCategory;
          title: string;
          message: string;
          timestamp: {
            seconds: number;
            nanoseconds: number;
          } | string; // Firebase a veces devuelve Timestamp, otras veces ISO string
          residencialId: string;
          ingresoId: string;
          metadata: Record<string, any>;
          suggestedActions: string[];
          status: AlertStatus;
          updatedBy?: string;
          updatedAt?: any;
        }

        export interface UserAlertPreferences {
          [key: string]: boolean; // La clave será una AlertCategory
        }
        ```

2.  **Crear Componentes de UI Genéricos (shadcn/ui):**
    *   **Archivos:** En `Zentry WEB/src/components/ui/`
    *   **Propósito:** Asegurarse de tener los bloques de construcción necesarios.
    *   **Verificar existencia de:** `Badge`, `Button`, `Card`, `Dialog`, `Select`, `Switch`. Si no existen, añadirlos con `npx shadcn-ui@latest add [component-name]`.

    ```bash
    # TODO: [ALERTAS-W-F1-2] Verificar y/o añadir los componentes de shadcn/ui necesarios
    npx shadcn-ui@latest add badge button card dialog select switch
    ```

---

## 🏗️ **FASE 2: API Endpoints**

**Descripción:** Crear los endpoints en Next.js para comunicar el frontend con Firebase de forma segura.

### **Acciones:**

1.  **Endpoint para Obtener Alertas:**
    *   **Archivo:** `Zentry WEB/src/app/api/alerts/exit-alerts/route.ts`
    *   **Propósito:** Proveer una lista de alertas con capacidad de filtrado y paginación.
    *   **Código:**
        ```typescript
        // TODO: [ALERTAS-W-F2-1] Implementar el endpoint GET para obtener alertas
        import { NextRequest, NextResponse } from 'next/server';
        import { getFirestore } from 'firebase-admin/firestore';
        import { initializeFirebaseAdmin } from '@/lib/firebase/admin'; // Asumiendo que tienes un helper así

        export async function GET(request: NextRequest) {
          try {
            initializeFirebaseAdmin(); // Asegura que Firebase Admin esté inicializado
            const db = getFirestore();
            
            // Lógica para verificar permisos de usuario (admin/seguridad) aquí...

            const { searchParams } = new URL(request.url);
            const residencialId = searchParams.get('residencialId');
            // Añadir más filtros como type, status, dateRange...

            let query: FirebaseFirestore.Query = db.collection('exit_alerts');

            if (residencialId) {
              query = query.where('residencialId', '==', residencialId);
            }
            query = query.orderBy('timestamp', 'desc').limit(50);
            
            const snapshot = await query.get();
            const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return NextResponse.json({ alerts });
          } catch (error) {
            console.error('Error fetching alerts:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
          }
        }
        ```

2.  **Endpoint para Actualizar Estado de Alerta:**
    *   **Archivo:** `Zentry WEB/src/app/api/alerts/[alertId]/action/route.ts`
    *   **Propósito:** Permitir que un administrador cambie el estado de una alerta (e.g., de `ACTIVE` a `RESOLVED`).
    *   **Código:**
        ```typescript
        // TODO: [ALERTAS-W-F2-2] Implementar el endpoint POST para actualizar una alerta
        import { NextRequest, NextResponse } from 'next/server';
        import { getFirestore } from 'firebase-admin/firestore';
        import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

        export async function POST(req: NextRequest, { params }: { params: { alertId: string } }) {
          try {
            initializeFirebaseAdmin();
            const db = getFirestore();
            const { alertId } = params;
            const { status, userId } = await req.json(); // userId del admin que realiza la acción

            if (!['ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'].includes(status.toUpperCase())) {
              return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            const alertRef = db.collection('exit_alerts').doc(alertId);
            await alertRef.update({
              status: status.toUpperCase(),
              updatedAt: new Date(),
              updatedBy: userId,
            });

            return NextResponse.json({ success: true, message: 'Alert updated' });
          } catch (error) {
            console.error(`Error updating alert ${params.alertId}:`, error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
          }
        }
        ```

3.  **Endpoint para Gestionar Preferencias de Alertas:**
    *   **Archivo:** `Zentry WEB/src/app/api/users/alert-preferences/route.ts`
    *   **Propósito:** Permitir a los usuarios (residentes/admins) leer y escribir su configuración de notificaciones.
    *   **Código:**
        ```typescript
        // TODO: [ALERTAS-W-F2-3] Implementar los endpoints GET y POST para las preferencias de usuario
        // GET: Devuelve las preferencias del usuario actual.
        // POST: Actualiza las preferencias del usuario actual.
        // Se necesitará verificar el token de autenticación del usuario.
        ```

---

## 🏗️ **FASE 3: Dashboard de Administración de Alertas**

**Descripción:** Construir la interfaz principal donde los administradores interactuarán con las alertas.

### **Acciones:**

1.  **Crear la Página Principal del Dashboard de Alertas:**
    *   **Archivo:** `Zentry WEB/src/app/dashboard/alertas/page.tsx`
    *   **Propósito:** Orquestar los componentes de estadísticas, filtros y la lista de alertas.
    *   **Código (Estructura):**
        ```typescript
        // TODO: [ALERTAS-W-F3-1] Crear la página principal de Alertas
        'use client';
        import { AlertCard } from '@/components/dashboard/alerts/AlertCard';
        // ... otros imports
        
        export default function AlertasPage() {
          // Hooks (useState, useEffect) para manejar el estado de las alertas, filtros y carga.
          // Lógica para llamar al API endpoint.
          // Lógica para manejar acciones de los componentes hijos (filtros, actualización de estado).

          return (
            // Layout con <AlertStats>, <AlertFilters> y la lista de <AlertCard>
          );
        }
        ```

2.  **Crear Componentes Reutilizables:**
    *   **Propósito:** Modularizar la UI para facilitar el mantenimiento.
    *   **Archivos a crear:**
        *   `Zentry WEB/src/components/dashboard/alerts/AlertStats.tsx`
            *   **TODO: [ALERTAS-W-F3-2]** Mostrará tarjetas con estadísticas: Total de alertas, Críticas, Activas, Resueltas hoy.
        *   `Zentry WEB/src/components/dashboard/alerts/AlertFilters.tsx`
            *   **TODO: [ALERTAS-W-F3-3]** Contendrá `Selects` para filtrar por tipo, estado, y un `DatePicker` para rango de fechas.
        *   `Zentry WEB/src/components/dashboard/alerts/AlertCard.tsx`
            *   **TODO: [ALERTAS-W-F3-4]** El componente más importante. Mostrará toda la información de una alerta individual, con colores según la severidad y botones para cambiar su estado.

---

## 🏗️ **FASE 4: UI para Preferencias de Alertas de Usuario**

**Descripción:** Darle a los usuarios (tanto administradores como residentes) una forma de controlar sus notificaciones desde la web.

### **Acciones:**

1.  **Crear Componente de Preferencias:**
    *   **Archivo:** `Zentry WEB/src/components/dashboard/settings/AlertPreferences.tsx`
    *   **Propósito:** Un formulario con `Switch` para cada categoría de alerta notificable.
    *   **Código (Estructura):**
        ```typescript
        // TODO: [ALERTAS-W-F4-1] Crear el componente AlertPreferences
        'use client';
        import { Switch } from '@/components/ui/switch';
        import { Label } from '@/components/ui/label';
        // ... otros imports

        export function AlertPreferences() {
          // Hooks para manejar el estado de las preferencias.
          // useEffect para cargar las preferencias actuales del usuario desde el API.
          // Función para guardar los cambios al API.

          return (
            // Layout con una lista de:
            <div className="flex items-center justify-between">
              <Label htmlFor="vehicle-change-switch">Alerta por Cambio de Vehículo</Label>
              <Switch id="vehicle-change-switch" />
            </div>
            // ... más switches ...
          );
        }
        ```

2.  **Integrar el Componente en la Página de Configuración:**
    *   **Archivo:** La página de configuración de cuenta de usuario que ya exista (e.g., `Zentry WEB/src/app/dashboard/settings/page.tsx` o similar).
    *   **TODO: [ALERTAS-W-F4-2]** Añadir el componente `<AlertPreferences />` dentro de un `Card` o sección en la página de ajustes del perfil de usuario.

---

Este plan proporciona una hoja de ruta clara para construir el lado web del sistema de alertas, complementando la implementación en la aplicación móvil. 