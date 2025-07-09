"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  getTags, 
  getResidenciales, 
  getUsuariosPorResidencial,
  crearTag, 
  actualizarTag, 
  cambiarEstadoTag,
  Tag,
  Residencial,
  Usuario
} from "@/lib/firebase/firestore";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tag as TagIcon, 
  User,
  Home,
  Car,
  PersonStanding,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TagFormData {
  codigo: string;
  tipo: 'vehicular' | 'peatonal';
  usuarioId: string;
  residencialId: string;
  casa: string;
  estado: 'activo' | 'inactivo';
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [residenciales, setResidenciales] = useState<Residencial[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [residencialFilter, setResidencialFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    codigo: "",
    tipo: 'vehicular',
    usuarioId: "",
    residencialId: "",
    casa: "",
    estado: 'activo',
  });
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener todos los tags sin filtrar por residencial
        const tagsData = await getTags("");
        const residencialesData = await getResidenciales();
        
        // Obtener usuarios de todos los residenciales
        let todosUsuarios: Usuario[] = [];
        for (const residencial of residencialesData) {
          if (residencial.id) {
            const usuariosResidencial = await getUsuariosPorResidencial(residencial.id);
            todosUsuarios = [...todosUsuarios, ...usuariosResidencial];
          }
        }
        
        setTags(tagsData);
        setResidenciales(residencialesData);
        setUsuarios(todosUsuarios);
        setUsuariosFiltrados(todosUsuarios);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrar usuarios cuando cambia el residencial seleccionado en el formulario
    if (formData.residencialId) {
      const usuariosFiltrados = usuarios.filter(
        u => u.residencialID === formData.residencialId
      );
      setUsuariosFiltrados(usuariosFiltrados);
      
      // Si el usuario seleccionado no pertenece al residencial, resetear
      if (formData.usuarioId) {
        const usuarioExiste = usuariosFiltrados.some(u => u.id === formData.usuarioId);
        if (!usuarioExiste) {
          setFormData(prev => ({
            ...prev,
            usuarioId: usuariosFiltrados.length > 0 ? usuariosFiltrados[0].id || "" : ""
          }));
        }
      } else if (usuariosFiltrados.length > 0) {
        // Seleccionar el primer usuario si no hay ninguno seleccionado
        setFormData(prev => ({
          ...prev,
          usuarioId: usuariosFiltrados[0].id || ""
        }));
      }
    }
  }, [formData.residencialId, usuarios]);

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setCurrentTag(tag);
      setFormData({
        codigo: tag.codigo,
        tipo: tag.tipo,
        usuarioId: tag.usuarioId,
        residencialId: tag.residencialId,
        casa: tag.casa,
        estado: tag.estado,
      });
    } else {
      setCurrentTag(null);
      setFormData({
        codigo: generateRandomCode(),
        tipo: 'vehicular',
        usuarioId: "",
        residencialId: residenciales.length > 0 ? residenciales[0].id || "" : "",
        casa: "",
        estado: 'activo',
      });
    }
    setOpenDialog(true);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleToggleEstado = async (tag: Tag) => {
    try {
      const nuevoEstado = tag.estado === 'activo' ? 'inactivo' : 'activo';
      await cambiarEstadoTag(tag.id || "", nuevoEstado);
      
      // Actualizar el estado local
      setTags(tags.map(t => 
        t.id === tag.id ? { ...t, estado: nuevoEstado } : t
      ));
      
      toast.success(`Tag ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error("Error al cambiar estado del tag:", error);
      toast.error("Error al cambiar el estado del tag");
    }
  };

  const handleSubmit = async () => {
    try {
      if (currentTag) {
        // Actualizar tag existente
        const updatedTag = await actualizarTag(currentTag.id || "", formData);
        // Convertir el resultado a tipo Tag para evitar errores de tipo
        const updatedTagTyped = updatedTag as unknown as Tag;
        setTags(tags.map(t => 
          t.id === currentTag.id ? { ...t, ...updatedTagTyped } : t
        ));
        toast.success("Tag actualizado correctamente");
      } else {
        // Añadir nuevo tag
        const newTag = await crearTag(formData);
        // Convertir el resultado a tipo Tag para evitar errores de tipo
        const newTagTyped = newTag as unknown as Tag;
        setTags([...tags, newTagTyped]);
        toast.success("Tag añadido correctamente");
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al guardar tag:", error);
      toast.error("Error al guardar el tag");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'tipo') {
      setFormData({
        ...formData,
        [name]: value as 'vehicular' | 'peatonal'
      });
    } else if (name === 'estado') {
      setFormData({
        ...formData,
        [name]: value as 'activo' | 'inactivo'
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tag.casa.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResidencial = residencialFilter === "todos" || tag.residencialId === residencialFilter;
    const matchesTipo = tipoFilter === "todos" || tag.tipo === tipoFilter;
    const matchesEstado = estadoFilter === "todos" || tag.estado === estadoFilter;
    
    return matchesSearch && matchesResidencial && matchesTipo && matchesEstado;
  });

  const getResidencialNombre = (id: string) => {
    const residencial = residenciales.find(r => r.id === id);
    return residencial ? residencial.nombre : "Desconocido";
  };

  const getUsuarioNombre = (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    return usuario ? `${usuario.fullName} ${usuario.paternalLastName} ${usuario.maternalLastName}` : "Desconocido";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tags de Acceso</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Tag
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tags</CardTitle>
          <CardDescription>
            Administra los tags de acceso vehicular y peatonal para los residenciales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por código o casa..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select
                  value={residencialFilter}
                  onValueChange={(value) => setResidencialFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Residencial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los residenciales</SelectItem>
                    {residenciales.map((residencial) => (
                      <SelectItem key={residencial.id} value={residencial.id || `residencial_${Date.now()}`}>
                        {residencial.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={tipoFilter}
                  onValueChange={(value) => setTipoFilter(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="vehicular">Vehicular</SelectItem>
                    <SelectItem value="peatonal">Peatonal</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={estadoFilter}
                  onValueChange={(value) => setEstadoFilter(value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Residencial</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Casa</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No se encontraron tags
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTags.map((tag) => (
                        <TableRow key={tag.id}>
                          <TableCell className="font-medium">{tag.codigo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {tag.tipo === 'vehicular' ? (
                                <Car className="h-4 w-4 text-blue-500" />
                              ) : (
                                <PersonStanding className="h-4 w-4 text-green-500" />
                              )}
                              <span className="capitalize">{tag.tipo}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getResidencialNombre(tag.residencialId)}</TableCell>
                          <TableCell>{getUsuarioNombre(tag.usuarioId)}</TableCell>
                          <TableCell>{tag.casa}</TableCell>
                          <TableCell>
                            <Badge variant={tag.estado === 'activo' ? "success" : "warning"}>
                              {tag.estado === 'activo' ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleToggleEstado(tag)}
                                title={tag.estado === 'activo' ? "Desactivar" : "Activar"}
                              >
                                {tag.estado === 'activo' ? (
                                  <ToggleRight className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenDialog(tag)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para añadir/editar tag */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentTag ? "Editar Tag" : "Añadir Tag"}
            </DialogTitle>
            <DialogDescription>
              {currentTag
                ? "Modifica los detalles del tag seleccionado."
                : "Completa los detalles para añadir un nuevo tag de acceso."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                {!currentTag && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setFormData({...formData, codigo: generateRandomCode()})}
                    title="Generar código aleatorio"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleSelectChange("tipo", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vehicular">Vehicular</SelectItem>
                  <SelectItem value="peatonal">Peatonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="residencialId" className="text-right">
                Residencial
              </Label>
              <Select
                value={formData.residencialId}
                onValueChange={(value) => handleSelectChange("residencialId", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar residencial" />
                </SelectTrigger>
                <SelectContent>
                  {residenciales
                    .filter(residencial => residencial.id) // Filtrar residenciales sin ID válido
                    .map((residencial) => (
                    <SelectItem key={residencial.id} value={residencial.id!}>
                      {residencial.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usuarioId" className="text-right">
                Usuario
              </Label>
              <Select
                value={formData.usuarioId}
                onValueChange={(value) => handleSelectChange("usuarioId", value)}
                disabled={usuariosFiltrados.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={usuariosFiltrados.length === 0 ? "No hay usuarios disponibles" : "Seleccionar usuario"} />
                </SelectTrigger>
                <SelectContent>
                  {usuariosFiltrados
                    .filter(usuario => usuario.id) // Filtrar usuarios sin ID válido
                    .map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.id!}>
                      {`${usuario.fullName} ${usuario.paternalLastName} ${usuario.maternalLastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="casa" className="text-right">
                Casa
              </Label>
              <Input
                id="casa"
                name="casa"
                value={formData.casa}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Ej: Casa 123, Depto 45B"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estado" className="text-right">
                Estado
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleSelectChange("estado", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 