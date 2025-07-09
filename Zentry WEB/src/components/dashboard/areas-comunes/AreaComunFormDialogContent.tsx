import React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserClaims } from "@/contexts/AuthContext"; // Asumiendo que UserClaims se usa
import { Residencial, AreaComun } from "@/lib/firebase/firestore"; // Asumiendo tipos

interface AreaComunFormData {
  nombre: string;
  descripcion: string;
  capacidad: number;
  horario: {
    apertura: string;
    cierre: string;
  };
  reservable: boolean;
}

interface AreaComunFormDialogContentProps {
  currentArea: AreaComun | null;
  formData: AreaComunFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AreaComunFormData>>; // Para horario
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  setOpenDialog: (open: boolean) => void;
  loading: boolean;
  userClaims: UserClaims | null; // Ajustar si es necesario
  esAdminDeResidencial: boolean;
  selectedResidencialId: string;
  setSelectedResidencialId: (id: string) => void;
  residenciales: Residencial[];
  // opcionesHora: Array<{ valor: string; etiqueta: string }>; // Si viene de props
}

// Definición temporal de opcionesHora, ajustar si es una prop
const generarOpcionesHora = () => {
  const opciones = [];
  for (let i = 0; i < 24; i++) {
    const hora = i.toString().padStart(2, '0');
    opciones.push({ valor: `${hora}:00`, etiqueta: `${hora}:00` });
    opciones.push({ valor: `${hora}:30`, etiqueta: `${hora}:30` });
  }
  return opciones;
};
const opcionesHora = generarOpcionesHora();

const AreaComunFormDialogContent: React.FC<AreaComunFormDialogContentProps> = ({
  currentArea,
  formData,
  handleInputChange,
  setFormData,
  handleSelectChange,
  handleSubmit,
  setOpenDialog,
  loading,
  userClaims,
  esAdminDeResidencial,
  selectedResidencialId,
  setSelectedResidencialId,
  residenciales,
  // opcionesHora,
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{currentArea ? "Editar Área Común" : "Añadir Área Común"}</DialogTitle>
        <DialogDescription>
          {currentArea ? "Modifica los detalles." : `Añadiendo para ${selectedResidencialId ? (residenciales.find(r=>r.id === selectedResidencialId)?.nombre || 'residencial sel.') : 'selecciona un residencial'}`}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {userClaims?.isGlobalAdmin && !esAdminDeResidencial && !currentArea && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="residencialParaCrear" className="text-right">Residencial</Label>
                <Select 
                    value={selectedResidencialId} 
                    onValueChange={(value) => setSelectedResidencialId(value)} 
                >
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecciona un residencial" /></SelectTrigger>
                    <SelectContent>
                        {residenciales.filter(r => r.id).map(r => (<SelectItem key={r.id!} value={r.id!}>{r.nombre}</SelectItem>))}
                    </SelectContent>
                </Select>
             </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nombre" className="text-right">Nombre</Label>
          <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="descripcion" className="text-right">Descripción</Label>
          <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="capacidad" className="text-right">Capacidad</Label>
          <Input id="capacidad" name="capacidad" type="number" value={formData.capacidad} onChange={handleInputChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="horario" className="text-right">Horario</Label>
          <div className="col-span-3 flex gap-4">
            <div className="flex-1">
              <Label>Apertura</Label>
              <Select value={formData.horario.apertura} onValueChange={(value) => setFormData(prev => ({ ...prev, horario: { ...prev.horario, apertura: value } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{opcionesHora.map(opc => <SelectItem key={opc.valor} value={opc.valor}>{opc.etiqueta}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Cierre</Label>
              <Select value={formData.horario.cierre} onValueChange={(value) => setFormData(prev => ({ ...prev, horario: { ...prev.horario, cierre: value } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{opcionesHora.map(opc => <SelectItem key={opc.valor} value={opc.valor}>{opc.etiqueta}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reservable" className="text-right">Requiere Reservación</Label>
          <Select value={formData.reservable ? "true" : "false"} onValueChange={(value) => handleSelectChange("reservable", value)}>
            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => { console.log('[DialogFooter-EditarCrear] Botón Cancelar clickeado'); setOpenDialog(false); }}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || (!currentArea && userClaims?.isGlobalAdmin && !esAdminDeResidencial && !selectedResidencialId)}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AreaComunFormDialogContent; 