import React from 'react';
import { Usuario } from '@/lib/firebase/firestore';
import TablaUsuarios from './TablaUsuarios'; // Ruta corregida

interface ContenidoPestanaSeguridadProps {
  usuarios: Usuario[];
  isLoading: boolean;
  onVerDetalles: (usuario: Usuario) => void;
  onEliminarUsuario: (usuario: Usuario) => void;
  onEliminarMultiplesUsuarios?: (usuarios: Usuario[]) => void;
  actualizacionEnTiempoReal: boolean;
  getRolBadge: (rol: Usuario['role']) => React.ReactNode;
  getResidencialNombre: (id: string) => string;
  getEstadoBadge: (estado: Usuario['status']) => React.ReactNode;
  renderPagination: () => React.ReactNode;
}

const ContenidoPestanaSeguridad: React.FC<ContenidoPestanaSeguridadProps> = ({
  usuarios,
  isLoading,
  onVerDetalles,
  onEliminarUsuario,
  onEliminarMultiplesUsuarios,
  actualizacionEnTiempoReal,
  getRolBadge,
  getResidencialNombre,
  getEstadoBadge,
  renderPagination
}) => {
  return (
    <>
      <TablaUsuarios
        usuarios={usuarios}
        titulo="Personal de Seguridad"
        isLoading={isLoading}
        onVerDetalles={onVerDetalles}
        onEliminarUsuario={onEliminarUsuario}
        onEliminarMultiplesUsuarios={onEliminarMultiplesUsuarios}
        actualizacionEnTiempoReal={actualizacionEnTiempoReal}
        getRolBadge={getRolBadge}
        getResidencialNombre={getResidencialNombre}
        getEstadoBadge={getEstadoBadge}
      />
      {renderPagination()}
    </>
  );
};

export default ContenidoPestanaSeguridad; 