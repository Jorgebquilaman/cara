import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { Search, Plus, CheckCircle, ShieldAlert, Download } from 'lucide-react';
import { Sanction, User } from '@/types';
import toast from 'react-hot-toast';

const sanctionSchema = z.object({
  userId: z.string().min(1, 'Seleccioná un usuario'),
  reason: z.string().min(1, 'La razón es requerida').max(500),
  expiresAt: z.string().min(1, 'Seleccioná una fecha de expiración'),
});

type SanctionForm = z.infer<typeof sanctionSchema>;

export default function SanctionsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pageSize = 10;
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sanctions, isLoading: sanctionsLoading } = useQuery({
    queryKey: ['sanctions'],
    queryFn: async () => {
      const { data } = await api.get<Sanction[]>('/sanctions');
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: SanctionForm & { attachmentUrl?: string }) => {
      await api.post('/sanctions', {
        userId: form.userId,
        reason: form.reason,
        expiresAt: form.expiresAt,
        attachmentUrl: form.attachmentUrl,
      });
    },
    onSuccess: () => {
      form.reset();
      setSelectedFile(null);
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sanctions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Sanción creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear sanción');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/sanctions/${id}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanctions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Sanción resuelta');
    },
    onError: () => {
      toast.error('Error al resolver sanción');
    },
  });

  const form = useForm<SanctionForm>({
    resolver: zodResolver(sanctionSchema),
  });

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post<{ url: string }>('/sanctions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.url;
    } catch {
      toast.error('Error al subir archivo');
      return null;
    }
  };

  const onSubmit = async (formData: SanctionForm) => {
    let attachmentUrl: string | undefined;
    if (selectedFile) {
      attachmentUrl = (await handleFileUpload(selectedFile)) ?? undefined;
    }
    await createMutation.mutateAsync({ ...formData, attachmentUrl });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const allSanctions = sanctions ?? [];

  const filtered = useMemo(() => {
    let result = allSanctions;
    if (statusFilter === 'active') {
      result = result.filter((s) => s.isActive);
    } else if (statusFilter === 'resolved') {
      result = result.filter((s) => !s.isActive);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.userName.toLowerCase().includes(q) ||
          s.reason.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allSanctions, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const userOptions = (users ?? [])
    .filter((u) => u.isActive)
    .map((u) => ({ value: u.id, label: `${u.fullName} (${u.institutionalEmail})` }));

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'active', label: 'Activas' },
    { value: 'resolved', label: 'Resueltas' },
  ];

  const columns = [
    { key: 'userName', header: 'Usuario' },
    { key: 'reason', header: 'Razón' },
    {
      key: 'issuedAt',
      header: 'Emitida',
      render: (s: Sanction) => new Date(s.issuedAt).toLocaleDateString(),
    },
    {
      key: 'expiresAt',
      header: 'Expira',
      render: (s: Sanction) => new Date(s.expiresAt).toLocaleDateString(),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (s: Sanction) => {
        if (!s.isActive) return <Badge status="Returned" />;
        const expired = new Date(s.expiresAt) < new Date();
        if (expired) return <Badge status="Overdue" />;
        return <Badge status="Active" />;
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (s: Sanction) => (
        <div className="flex items-center gap-2">
          {s.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resolveMutation.mutate(s.id)}
              isLoading={resolveMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolver
            </Button>
          )}
          {s.attachmentUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(s.attachmentUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" />
              Archivo
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Sanciones</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná las sanciones a usuarios</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sanción
        </Button>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o razón..."
              className="w-full rounded-lg border border-cara-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500 focus:border-transparent transition-shadow"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-44"
          />
        </div>
      </Card>

      <div className="rounded-lg border border-cara-200 bg-white overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={paged}
          keyExtractor={(s) => s.id}
          isLoading={sanctionsLoading}
          emptyMessage="No se encontraron sanciones"
        />
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setSelectedFile(null); }} title="Nueva Sanción" size="lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Usuario"
            options={userOptions}
            placeholder="Seleccioná un usuario"
            error={form.formState.errors.userId?.message}
            {...form.register('userId')}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-cara-700">Razón</label>
            <textarea
              className="block w-full rounded-lg border border-cara-300 px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cara-500"
              rows={3}
              placeholder="Motivo de la sanción..."
              {...form.register('reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-danger">{form.formState.errors.reason.message}</p>
            )}
          </div>
          <Input
            label="Fecha de expiración"
            type="datetime-local"
            error={form.formState.errors.expiresAt?.message}
            {...form.register('expiresAt')}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-cara-700">Archivo adjunto (opcional)</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-cara-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cara-50 file:text-cara-700 hover:file:bg-cara-100"
            />
            {selectedFile && (
              <p className="text-xs text-cara-500 mt-1">Seleccionado: {selectedFile.name}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsCreateOpen(false); setSelectedFile(null); }}>Cancelar</Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Aplicar Sanción
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
