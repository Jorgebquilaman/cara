import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { Search, Plus, Trash2, Eye, Pencil, FileSpreadsheet, FileText, Image, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '@/types';
import api from '@/services/api';
import { assetService } from '@/services/assetService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const assetSchema = z.object({
  code: z.string().min(1, 'Requerido').max(50),
  name: z.string().min(1, 'Requerido').max(200),
  category: z.string().min(1, 'Requerido').max(100),
  department: z.string().min(1, 'Requerido').max(100),
  location: z.string().min(1, 'Requerido').max(200),
  description: z.string().optional(),
  maxLoanDays: z.coerce.number().min(1).max(365),
});

type AssetForm = z.infer<typeof assetSchema>;

const editAssetSchema = z.object({
  name: z.string().min(1, 'Requerido').max(200),
  category: z.string().min(1, 'Requerido').max(100),
  department: z.string().min(1, 'Requerido').max(100),
  location: z.string().min(1, 'Requerido').max(200),
  description: z.string().optional(),
  maxLoanDays: z.coerce.number().min(1).max(365),
});

type EditAssetForm = z.infer<typeof editAssetSchema>;

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'Available', label: 'Disponible' },
  { value: 'InUse', label: 'En Uso' },
  { value: 'Maintenance', label: 'Mantenimiento' },
  { value: 'Decommissioned', label: 'De Baja' },
];

export default function AssetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useAssets({
    searchTerm: search || undefined,
    status: statusFilter || undefined,
    pageNumber: page,
    pageSize: 10,
  });
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const form = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: { maxLoanDays: 7 },
  });

  const handleFileUpload = async (file: File | null): Promise<string | null> => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post<{ url: string }>('/assets/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.url;
    } catch {
      toast.error('Error al subir imagen');
      return null;
    }
  };

  const onSubmit = async (formData: AssetForm) => {
    let imageUrl: string | undefined;
    if (selectedFile) {
      imageUrl = (await handleFileUpload(selectedFile)) ?? undefined;
    }
    await createAsset.mutateAsync({ ...formData, imageUrl } as AssetForm & { imageUrl?: string });
    setSelectedFile(null);
    setIsCreateOpen(false);
    form.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditSelectedFile(file);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    editForm.reset({
      name: asset.name,
      category: asset.category,
      department: asset.department,
      location: asset.location,
      description: asset.description ?? '',
      maxLoanDays: asset.maxLoanDays,
    });
    setEditSelectedFile(null);
    setIsEditOpen(true);
  };

  const editForm = useForm<EditAssetForm>({
    resolver: zodResolver(editAssetSchema),
  });

  const onEditSubmit = async (formData: EditAssetForm) => {
    if (!editingAsset) return;
    let imageUrl: string | undefined;
    if (editSelectedFile) {
      imageUrl = (await handleFileUpload(editSelectedFile)) ?? undefined;
    }
    await updateAsset.mutateAsync({ id: editingAsset.id, ...formData, imageUrl });
    setEditSelectedFile(null);
    setIsEditOpen(false);
    setEditingAsset(null);
  };

  const handleSearch = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      setSelectedIds(new Set());
    }, 400);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data?.items) return;
    if (selectedIds.size === data.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.items.map(a => a.id)));
    }
  };

  const downloadZpl = async (assetIds: string[]) => {
    try {
      const blob = await assetService.getZpl(assetIds, window.location.origin);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = assetIds.length === 1 ? 'etiqueta.zpl' : 'etiquetas.zpl';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Etiqueta(s) generada(s) correctamente');
    } catch {
      toast.error('Error al generar etiquetas');
    }
  };

  const exportExcel = () => {
    if (!data?.items) return;
    const ws = XLSX.utils.json_to_sheet(
      data.items.map((a) => ({
        Código: a.code,
        Nombre: a.name,
        Categoría: a.category,
        Departamento: a.department,
        Ubicación: a.location,
        Estado: a.status,
        'Días máx.': a.maxLoanDays,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activos');
    XLSX.writeFile(wb, 'activos.xlsx');
  };

  const exportPdf = () => {
    if (!data?.items) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Activos - CARA', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Código', 'Nombre', 'Categoría', 'Departamento', 'Ubicación', 'Estado']],
      body: data.items.map((a) => [a.code, a.name, a.category, a.department, a.location, a.status]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('activos.pdf');
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={data?.items ? data.items.length > 0 && selectedIds.size === data.items.length : false}
          onChange={toggleSelectAll}
          className="h-4 w-4 rounded border-cara-300 text-cara-600 focus:ring-cara-500"
        />
      ),
      render: (a: Asset) => (
        <input
          type="checkbox"
          checked={selectedIds.has(a.id)}
          onChange={() => toggleSelect(a.id)}
          className="h-4 w-4 rounded border-cara-300 text-cara-600 focus:ring-cara-500"
        />
      ),
    },
    {
      key: 'image',
      header: '',
      render: (a: Asset) =>
        a.imageUrl ? (
          <img src={a.imageUrl} alt={a.name} className="h-10 w-10 rounded-lg object-cover border" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-cara-100 flex items-center justify-center">
            <Image className="h-5 w-5 text-cara-400" />
          </div>
        ),
    },
    { key: 'code', header: 'Código' },
    { key: 'name', header: 'Nombre' },
    { key: 'category', header: 'Categoría' },
    { key: 'department', header: 'Departamento' },
    { key: 'status', header: 'Estado', render: (a: Asset) => <Badge status={a.status} /> },
    { key: 'location', header: 'Ubicación' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (a: Asset) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/assets/${a.id}`)} title="Ver detalle">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(a)} title="Editar">
            <Pencil className="h-4 w-4 text-cara-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => deleteAsset.mutate(a.id)} title="Eliminar">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => downloadZpl([a.id])} title="Imprimir etiqueta">
            <Printer className="h-4 w-4 text-cara-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Activos</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná los activos del inventario</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="secondary" onClick={exportPdf}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="secondary" onClick={() => downloadZpl(Array.from(selectedIds))}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir ({selectedIds.size})
            </Button>
          )}
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Activo
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              className="w-full rounded-lg border border-cara-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500 focus:border-transparent transition-shadow"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-48"
          />
        </div>
      </Card>

      <div className="rounded-lg border border-cara-200 bg-white overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={data?.items ?? []}
          keyExtractor={(a) => a.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron activos"
        />
        <Pagination
          pageNumber={data?.pageNumber ?? 1}
          totalPages={data?.totalPages ?? 1}
          totalCount={data?.totalCount ?? 0}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setSelectedFile(null); }} title="Nuevo Activo">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Código" error={form.formState.errors.code?.message} {...form.register('code')} />
            <Input label="Nombre" error={form.formState.errors.name?.message} {...form.register('name')} />
            <Input label="Categoría" error={form.formState.errors.category?.message} {...form.register('category')} />
            <Input label="Departamento" error={form.formState.errors.department?.message} {...form.register('department')} />
            <Input label="Ubicación" error={form.formState.errors.location?.message} {...form.register('location')} />
            <Input
              label="Días máx. préstamo"
              type="number"
              error={form.formState.errors.maxLoanDays?.message}
              {...form.register('maxLoanDays')}
            />
          </div>
          <Input label="Descripción" error={form.formState.errors.description?.message} {...form.register('description')} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-cara-700">Imagen (JPG)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-sm text-cara-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cara-50 file:text-cara-700 hover:file:bg-cara-100"
            />
            {selectedFile && (
              <p className="text-xs text-cara-500 mt-1">{selectedFile.name}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsCreateOpen(false); setSelectedFile(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={createAsset.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingAsset(null); setEditSelectedFile(null); }} title="Editar Activo" size="lg">
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" error={editForm.formState.errors.name?.message} {...editForm.register('name')} />
            <Input label="Categoría" error={editForm.formState.errors.category?.message} {...editForm.register('category')} />
            <Input label="Departamento" error={editForm.formState.errors.department?.message} {...editForm.register('department')} />
            <Input label="Ubicación" error={editForm.formState.errors.location?.message} {...editForm.register('location')} />
            <Input
              label="Días máx. préstamo"
              type="number"
              error={editForm.formState.errors.maxLoanDays?.message}
              {...editForm.register('maxLoanDays')}
            />
          </div>
          <Input label="Descripción" error={editForm.formState.errors.description?.message} {...editForm.register('description')} />
          {editingAsset?.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-cara-700 mb-1">Imagen actual</label>
              <img src={editingAsset.imageUrl} alt={editingAsset.name} className="h-24 w-24 rounded-lg object-cover border" />
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-cara-700">
              {editingAsset?.imageUrl ? 'Cambiar imagen (JPG/PNG)' : 'Imagen (JPG/PNG)'}
            </label>
            <input
              ref={editFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleEditFileChange}
              className="block w-full text-sm text-cara-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cara-50 file:text-cara-700 hover:file:bg-cara-100"
            />
            {editSelectedFile && (
              <p className="text-xs text-cara-500 mt-1">{editSelectedFile.name}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsEditOpen(false); setEditingAsset(null); setEditSelectedFile(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={updateAsset.isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
