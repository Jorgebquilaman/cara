import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Calendar from '@/components/ui/Calendar';
import Pagination from '@/components/ui/Pagination';
import { Search, Plus, CheckCircle, XCircle, FileSpreadsheet, FileText } from 'lucide-react';
import { Reservation, AssetAvailability } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reservationSchema = z.object({
  assetId: z.string().min(1, 'Seleccioná un activo'),
  startDate: z.string().min(1, 'Requerido'),
  endDate: z.string().min(1, 'Requerido'),
  space: z.string().min(1, 'Requerido'),
});

type ReservationForm = z.infer<typeof reservationSchema>;

const statusFilterOptions = [
  { value: '', label: 'Todos' },
  { value: 'Pending', label: 'Por confirmar' },
  { value: 'Confirmed', label: 'Confirmadas' },
  { value: 'Cancelled', label: 'Canceladas' },
  { value: 'Completed', label: 'Completadas' },
];

export default function ReservationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { data: assetsData } = useAssets({ pageSize: 1000 });

  const { data: availability } = useQuery({
    queryKey: ['asset-availability', selectedAssetId],
    queryFn: async () => {
      const { data } = await api.get<AssetAvailability>(
        `/assets/${selectedAssetId}/availability`,
        { params: { start: '2026-01-01', end: '2027-01-01' } }
      );
      return data;
    },
    enabled: !!selectedAssetId,
  });

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', user?.id],
    queryFn: async () => {
      const { data } = await api.get<Reservation[]>(`/reservations`);
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reservations/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reserva confirmada');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reservations/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reserva completada');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/reservations/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reserva cancelada');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: ReservationForm) => {
      await api.post('/reservations', { ...form, userId: user?.id });
    },
    onSuccess: () => {
      form.reset();
      setDateRange(null);
      setSelectedAssetId('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Reserva creada exitosamente');
    },
  });

  const form = useForm<ReservationForm>({
    resolver: zodResolver(reservationSchema),
  });

  const onSubmit = async (data: ReservationForm) => {
    await createMutation.mutateAsync(data);
  };

  const activeAssets = (assetsData?.items ?? []).filter((a) => a.status !== 'Decommissioned');
  const assetOptions = activeAssets.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}${a.status !== 'Available' ? ` (${a.status === 'InUse' ? 'En uso' : a.status})` : ''}`,
  }));

  const selectedAsset = activeAssets.find((a) => a.id === selectedAssetId);

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

  const allReservations = reservations ?? [];

  const filtered = useMemo(() => {
    let result = allReservations;
    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.space.toLowerCase().includes(q) ||
          (r.userName && r.userName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allReservations, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const exportExcel = () => {
    if (!allReservations.length) return;
    const ws = XLSX.utils.json_to_sheet(
      allReservations.map((r) => ({
        Espacio: r.space,
        Usuario: r.userName,
        Inicio: new Date(r.startDate).toLocaleDateString(),
        Fin: new Date(r.endDate).toLocaleDateString(),
        Estado: r.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    XLSX.writeFile(wb, 'reservas.xlsx');
  };

  const exportPdf = () => {
    if (!allReservations.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reservas - CARA', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Espacio', 'Usuario', 'Inicio', 'Fin', 'Estado']],
      body: allReservations.map((r) => [
        r.space,
        r.userName,
        new Date(r.startDate).toLocaleDateString(),
        new Date(r.endDate).toLocaleDateString(),
        r.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('reservas.pdf');
  };

  const columns = [
    { key: 'space', header: 'Espacio' },
    { key: 'assetName', header: 'Activo' },
    ...(isAdminOrStaff ? [{ key: 'userName' as string, header: 'Usuario' as string }] : []),
    {
      key: 'startDate',
      header: 'Inicio',
      render: (r: Reservation) => new Date(r.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      header: 'Fin',
      render: (r: Reservation) => new Date(r.endDate).toLocaleDateString(),
    },
    { key: 'status', header: 'Estado', render: (r: Reservation) => <Badge status={r.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (r: Reservation) => (
        <div className="flex gap-2">
          {r.status === 'Pending' && (
            <>
              {isAdminOrStaff && (
                <Button variant="ghost" size="sm" onClick={() => approveMutation.mutate(r.id)}>
                  <CheckCircle className="h-4 w-4 text-success" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutate(r.id)}>
                <XCircle className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
          {r.status === 'Confirmed' && (
            <>
              {isAdminOrStaff && (
                <Button variant="ghost" size="sm" onClick={() => completeMutation.mutate(r.id)}>
                  <CheckCircle className="h-4 w-4 text-success" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutate(r.id)}>
                <XCircle className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Reservas</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná las reservas de activos</p>
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
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por espacio o usuario..."
              className="w-full rounded-lg border border-cara-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500 focus:border-transparent transition-shadow"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-44"
          />
        </div>
      </Card>

      <div className="rounded-lg border border-cara-200 bg-white overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={paged}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron reservas"
        />
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); setDateRange(null); setSelectedAssetId(''); }} title="Nueva Reserva">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Activo"
            options={assetOptions}
            placeholder="Seleccioná un activo"
            error={form.formState.errors.assetId?.message}
            {...form.register('assetId', {
              onChange: (e) => {
                setSelectedAssetId(e.target.value);
                setDateRange(null);
              },
            })}
          />

          {selectedAssetId && selectedAsset?.imageUrl && (
            <div className="flex justify-center">
              <img
                src={selectedAsset.imageUrl}
                alt={selectedAsset.name}
                className="h-32 w-32 rounded-xl object-cover border shadow-sm"
              />
            </div>
          )}

          {selectedAssetId && (
            <div>
              {selectedAsset && (
                <p className="text-xs text-cara-500 mb-2 text-center">
                  Máximo {selectedAsset.maxLoanDays} días por reserva
                </p>
              )}
              <div className="flex justify-center">
                <Calendar
                  bookedRanges={availability?.bookedRanges}
                  value={dateRange ?? undefined}
                  onChange={(range) => {
                    const days = Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    if (selectedAsset && days > selectedAsset.maxLoanDays) {
                      setRangeError(`Supera el máximo de ${selectedAsset.maxLoanDays} días.`);
                      return;
                    }
                    setRangeError('');
                    setDateRange(range);
                    form.setValue('startDate', range.start.toISOString().split('T')[0]);
                    form.setValue('endDate', range.end.toISOString().split('T')[0]);
                    form.clearErrors(['startDate', 'endDate']);
                  }}
                  minDate={new Date()}
                />
              </div>
              {rangeError && (
                <p className="text-xs text-red-500 text-center mt-1">{rangeError}</p>
              )}
            </div>
          )}

          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => <input type="hidden" {...field} />}
          />
          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <Input
            label="Espacio"
            placeholder="Ej: Sala A, Auditorio, etc."
            error={form.formState.errors.space?.message}
            {...form.register('space')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsCreateOpen(false); setDateRange(null); setSelectedAssetId(''); }}>Cancelar</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
