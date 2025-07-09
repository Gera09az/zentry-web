import React, { memo, useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Usuario } from '@/lib/firebase/firestore';
import { Eye, RefreshCcw, RefreshCw, Trash2, Users, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TablaUsuariosProps {
  usuarios: Usuario[];
  titulo: string;
  isLoading: boolean;
  onVerDetalles: (usuario: Usuario) => void;
  onEliminarUsuario: (usuario: Usuario) => void;
  onEliminarMultiplesUsuarios?: (usuarios: Usuario[]) => void;
  actualizacionEnTiempoReal: boolean;
  getRolBadge: (rol: Usuario['role']) => React.ReactNode;
  getResidencialNombre: (id: string) => string;
  getEstadoBadge: (estado: Usuario['status']) => React.ReactNode;
}

const TablaUsuarios: React.FC<TablaUsuariosProps> = memo(({
  usuarios,
  titulo,
  isLoading,
  onVerDetalles,
  onEliminarUsuario,
  onEliminarMultiplesUsuarios,
  actualizacionEnTiempoReal,
  getRolBadge,
  getResidencialNombre,
  getEstadoBadge
}) => {
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<Set<string>>(new Set());
  const [mostrarDialogoEliminarMultiples, setMostrarDialogoEliminarMultiples] = useState(false);

  const usuariosOrdenados = useMemo(() => {
    return [...usuarios].sort((a, b) => {
      const nombreA = a.fullName?.toLowerCase() || '';
      const nombreB = b.fullName?.toLowerCase() || '';
      return nombreA.localeCompare(nombreB);
    });
  }, [usuarios]);

  // Manejar selección individual
  const handleSeleccionarUsuario = useCallback((usuarioId: string, seleccionado: boolean) => {
    setUsuariosSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (seleccionado) {
        nuevo.add(usuarioId);
      } else {
        nuevo.delete(usuarioId);
      }
      return nuevo;
    });
  }, []);

  // Manejar seleccionar todos
  const handleSeleccionarTodos = useCallback((seleccionado: boolean) => {
    if (seleccionado) {
      const todosLosIds = new Set(usuariosOrdenados.map(u => u.id!).filter(Boolean));
      setUsuariosSeleccionados(todosLosIds);
    } else {
      setUsuariosSeleccionados(new Set());
    }
  }, [usuariosOrdenados]);

  // Verificar si todos están seleccionados
  const todosSonSeleccionados = useMemo(() => {
    return usuariosOrdenados.length > 0 && 
           usuariosOrdenados.every(u => u.id && usuariosSeleccionados.has(u.id));
  }, [usuariosOrdenados, usuariosSeleccionados]);

  // Verificar si algunos están seleccionados
  const algunosSonSeleccionados = useMemo(() => {
    return usuariosSeleccionados.size > 0 && !todosSonSeleccionados;
  }, [usuariosSeleccionados.size, todosSonSeleccionados]);

  // Obtener usuarios seleccionados
  const obtenerUsuariosSeleccionados = useCallback(() => {
    return usuariosOrdenados.filter(u => u.id && usuariosSeleccionados.has(u.id));
  }, [usuariosOrdenados, usuariosSeleccionados]);

  // Manejar eliminación múltiple
  const handleEliminarSeleccionados = useCallback(() => {
    setMostrarDialogoEliminarMultiples(true);
  }, []);

  const confirmarEliminarMultiples = useCallback(() => {
    const usuariosAEliminar = obtenerUsuariosSeleccionados();
    if (usuariosAEliminar.length > 0 && onEliminarMultiplesUsuarios) {
      onEliminarMultiplesUsuarios(usuariosAEliminar);
      setUsuariosSeleccionados(new Set()); // Limpiar selección
    }
    setMostrarDialogoEliminarMultiples(false);
  }, [obtenerUsuariosSeleccionados, onEliminarMultiplesUsuarios]);

  // Limpiar selección cuando cambian los usuarios
  React.useEffect(() => {
    setUsuariosSeleccionados(new Set());
  }, [usuarios]);

  return (
    <>
    <Card className="mb-6">
      <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div>
        <CardTitle className="text-xl">{titulo}</CardTitle>
        <CardDescription>
          {usuariosOrdenados.length} usuarios encontrados
                {usuariosSeleccionados.size > 0 && (
                  <span className="ml-2 text-blue-600 dark:text-blue-400">
                    • {usuariosSeleccionados.size} seleccionado{usuariosSeleccionados.size !== 1 ? 's' : ''}
                  </span>
                )}
          {actualizacionEnTiempoReal && (
            <span className="ml-2 inline-flex items-center text-xs text-green-600 dark:text-green-500">
              <RefreshCcw className="h-3 w-3 inline mr-1" />
              Actualización en tiempo real
            </span>
          )}
        </CardDescription>
            </div>
            
            {/* Controles de selección múltiple */}
            {usuariosSeleccionados.size > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEliminarSeleccionados}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar seleccionados ({usuariosSeleccionados.size})
                </Button>
              </div>
            )}
          </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : usuariosOrdenados.length === 0 ? (
          <div className="text-center py-10">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                    <th className="py-2 px-4 text-left w-12">
                      <Checkbox
                        checked={todosSonSeleccionados}
                        onCheckedChange={handleSeleccionarTodos}
                        ref={(ref) => {
                          if (ref) {
                            ref.indeterminate = algunosSonSeleccionados;
                          }
                        }}
                        aria-label="Seleccionar todos los usuarios"
                      />
                    </th>
                  <th className="py-2 px-4 text-left">Nombre</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Residencial</th>
                  <th className="py-2 px-4 text-left">Rol</th>
                  <th className="py-2 px-4 text-left">Estado</th>
                  <th className="py-2 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosOrdenados.map((usuario) => (
                  <tr key={usuario.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        <Checkbox
                          checked={usuario.id ? usuariosSeleccionados.has(usuario.id) : false}
                          onCheckedChange={(checked) => {
                            if (usuario.id) {
                              handleSeleccionarUsuario(usuario.id, checked as boolean);
                            }
                          }}
                          aria-label={`Seleccionar usuario ${usuario.fullName}`}
                        />
                      </td>
                    <td className="py-2 px-4">{usuario.fullName || "Sin nombre"}</td>
                    <td className="py-2 px-4">{usuario.email || "Sin email"}</td>
                    <td className="py-2 px-4">{getResidencialNombre(usuario.residencialID)}</td>
                    <td className="py-2 px-4">{getRolBadge(usuario.role)}</td>
                    <td className="py-2 px-4">{getEstadoBadge(usuario.status)}</td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onVerDetalles(usuario)}
                          className="p-1 hover:bg-muted rounded-full"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEliminarUsuario(usuario)}
                          className="p-1 hover:bg-muted rounded-full text-destructive"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>

      {/* Diálogo de confirmación para eliminación múltiple */}
      <AlertDialog open={mostrarDialogoEliminarMultiples} onOpenChange={setMostrarDialogoEliminarMultiples}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminación múltiple
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar {usuariosSeleccionados.size} usuario{usuariosSeleccionados.size !== 1 ? 's' : ''}?
              <br />
              <br />
              <strong>Usuarios a eliminar:</strong>
              <ul className="mt-2 space-y-1">
                {obtenerUsuariosSeleccionados().map(usuario => (
                  <li key={usuario.id} className="text-sm">
                    • {usuario.fullName || 'Sin nombre'} ({usuario.email || 'Sin email'})
                  </li>
                ))}
              </ul>
              <br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarEliminarMultiples}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar {usuariosSeleccionados.size} usuario{usuariosSeleccionados.size !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

export default TablaUsuarios; 