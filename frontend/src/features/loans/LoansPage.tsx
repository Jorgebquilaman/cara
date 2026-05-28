import { useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useApproveLoan, usePickUpLoan, useRejectLoan, useReturnLoan, useCreateLoan, useSendReminder } from '@/hooks/useLoans';
import { useAssets } from '@/hooks/useAssets';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import { Search, CheckCircle, XCircle, Undo2, Plus, Bell, FileSpreadsheet, FileText } from 'lucide-react';
import { Loan, User } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loanSchema = z.object({
  userId: z.string().min(1, 'Seleccioná un usuario'),
  assetId: z.string().min(1, 'Seleccioná un activo'),
  startDate: z.string().min(1, 'Requerido'),
  dueDate: z.string().min(1, 'Requerido'),
});

type LoanForm = z.infer<typeof loanSchema>;

const statusFilterOptions = [
  { value: '', label: 'Todos' },
  { value: 'Pending', label: 'Pendientes' },
  { value: 'Active', label: 'Activos' },
  { value: 'Overdue', label: 'Vencidos' },
  { value: 'Returned', label: 'Devueltos' },
  { value: 'Rejected', label: 'Rechazados' },
];

export default function LoansPage() {
  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans', 'managed'],
    queryFn: async () => {
      const { data } = await api.get<Loan[]>('/loans');
      return data;
    },
  });
  const approveLoan = useApproveLoan();
  const pickUpLoan = usePickUpLoan();
  const rejectLoan = useRejectLoan();
  const returnLoan = useReturnLoan();
  const createLoan = useCreateLoan();
  const sendReminder = useSendReminder();
  const { data: assetsData } = useAssets({ pageSize: 1000 });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [returnModal, setReturnModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentPhotoUrl, setIncidentPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const form = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
  });

  const handleReject = async () => {
    await rejectLoan.mutateAsync({ id: rejectModal.id, reason: rejectReason });
    setRejectModal({ id: '', open: false });
    setRejectReason('');
  };

  const handleReturn = async () => {
    const desc = incidentDescription.trim() || undefined;
    const photo = incidentPhotoUrl || undefined;
    await returnLoan.mutateAsync({ id: returnModal.id, incidentDescription: desc, incidentPhotoUrl: photo });
    setReturnModal({ id: '', open: false });
    setIncidentDescription('');
    setIncidentPhotoUrl('');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/loans/upload-incident-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIncidentPhotoUrl(data.url);
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onCreateSubmit = async (data: LoanForm) => {
    await createLoan.mutateAsync({
      userId: data.userId,
      assetId: data.assetId,
      startDate: data.startDate,
      dueDate: data.dueDate,
    });
    form.reset();
    setIsCreateOpen(false);
  };

  const activeAssets = (assetsData?.items ?? []).filter((a) => a.status !== 'Decommissioned');
  const assetOptions = activeAssets.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}${a.status !== 'Available' ? ` (${a.status === 'InUse' ? 'En uso' : a.status})` : ''}`,
  }));
  const selectedAsset = activeAssets.find((a) => a.id === selectedAssetId);
  const selectedUser = (users ?? []).find((u) => u.id === selectedUserId);
  const userOptions = (users ?? []).map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.institutionalEmail})`,
  }));

  const allLoans = loans ?? [];

  const filtered = useMemo(() => {
    let result = allLoans;
    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.assetName.toLowerCase().includes(q) ||
          l.assetCode.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allLoans, statusFilter, search]);

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
    if (!allLoans.length) return;
    const ws = XLSX.utils.json_to_sheet(
      allLoans.map((l) => ({
        Código: l.assetCode,
        Activo: l.assetName,
        Usuario: l.userName,
        Inicio: new Date(l.startDate).toLocaleDateString(),
        Vencimiento: new Date(l.dueDate).toLocaleDateString(),
        Estado: l.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Préstamos');
    XLSX.writeFile(wb, 'prestamos.xlsx');
  };

  const exportPdf = () => {
    if (!allLoans.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Préstamos - CARA', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Código', 'Activo', 'Usuario', 'Inicio', 'Vencimiento', 'Estado']],
      body: allLoans.map((l) => [
        l.assetCode,
        l.assetName,
        l.userName,
        new Date(l.startDate).toLocaleString('es-AR'),
        new Date(l.dueDate).toLocaleString('es-AR'),
        l.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('prestamos.pdf');
  };

  const columns = [
    { key: 'assetName', header: 'Activo' },
    { key: 'userName', header: 'Usuario' },
    {
      key: 'startDate',
      header: 'Inicio',
      render: (l: Loan) => new Date(l.startDate).toLocaleString('es-AR'),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (l: Loan) => new Date(l.dueDate).toLocaleString('es-AR'),
    },
    { key: 'status', header: 'Estado', render: (l: Loan) => <Badge status={l.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (l: Loan) => (
        <div className="flex gap-2">
          {l.status === 'Pending' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => approveLoan.mutate(l.id)}>
                <CheckCircle className="h-4 w-4 text-success" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRejectModal({ id: l.id, open: true })}>
                <XCircle className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
          {l.status === 'Approved' && (
            <Button variant="ghost" size="sm" onClick={() => pickUpLoan.mutate(l.id)}>
                <CheckCircle className="h-4 w-4 text-cara-600" />
            </Button>
          )}
          {(l.status === 'Active' || l.status === 'Overdue') && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setReturnModal({ id: l.id, open: true })}>
                <Undo2 className="h-4 w-4 mr-2" />
                Devolver
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => sendReminder.mutate(l.id)}
                title="Enviar recordatorio"
                isLoading={sendReminder.isPending && sendReminder.variables === l.id}
              >
                <Bell className="h-4 w-4 text-cara-500" />
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
          <h1 className="text-2xl font-bold text-cara-900">Préstamos</h1>
          <p className="text-sm text-cara-500 mt-1">Administrá los préstamos del sistema</p>
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
            Nuevo Préstamo
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por activo o usuario..."
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
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron préstamos"
        />
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo Préstamo">
        <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
          <Select
            label="Usuario"
            options={userOptions}
            placeholder="Seleccioná un usuario"
            error={form.formState.errors.userId?.message}
            {...form.register('userId', {
              onChange: (e) => setSelectedUserId(e.target.value),
            })}
          />
          {selectedUser?.hasActiveSanctions && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              <strong className="block mb-1">Usuario suspendido</strong>
              Este usuario tiene sanciones activas y no está autorizado para solicitar préstamos ni hacer reservas.
            </div>
          )}
          <Select
            label="Activo"
            options={assetOptions}
            placeholder="Seleccioná un activo"
            error={form.formState.errors.assetId?.message}
            {...form.register('assetId', {
              onChange: (e) => setSelectedAssetId(e.target.value),
            })}
          />
          {selectedAsset?.imageUrl && (
            <div className="flex justify-center">
              <img
                src={selectedAsset.imageUrl}
                alt={selectedAsset.name}
                className="h-32 w-32 rounded-xl object-cover border shadow-sm"
              />
            </div>
          )}
          {selectedAsset && (
            <p className="text-xs text-cara-500">Máximo {selectedAsset.maxLoanDays} días por préstamo</p>
          )}
          <Input
            label="Fecha y hora de inicio"
            type="datetime-local"
            error={form.formState.errors.startDate?.message}
            {...form.register('startDate')}
          />
          <Input
            label="Fecha y hora de devolución"
            type="datetime-local"
            error={form.formState.errors.dueDate?.message}
            {...form.register('dueDate')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={createLoan.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ id: '', open: false })}
        title="Rechazar Préstamo"
      >
        <div className="space-y-4">
          <Input
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ id: '', open: false })}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleReject} isLoading={rejectLoan.isPending}>
              Rechazar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={returnModal.open}
        onClose={() => { setReturnModal({ id: '', open: false }); setIncidentDescription(''); setIncidentPhotoUrl(''); }}
        title="Devolver Préstamo"
      >
        <div className="space-y-4">
          <p className="text-sm text-cara-600">¿Hubo algún daño o novedad en la devolución?</p>
          <textarea
            className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm focus:border-cara-500 focus:outline-none"
            rows={3}
            placeholder="Describí el incidente (opcional)..."
            value={incidentDescription}
            onChange={(e) => setIncidentDescription(e.target.value)}
          />
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => photoInputRef.current?.click()}
              isLoading={uploadingPhoto}
            >
              {incidentPhotoUrl ? 'Cambiar foto' : 'Agregar foto'}
            </Button>
            {incidentPhotoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={incidentPhotoUrl}
                  alt="Foto del incidente"
                  className="h-20 w-20 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => setIncidentPhotoUrl('')}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setReturnModal({ id: '', open: false }); setIncidentDescription(''); setIncidentPhotoUrl(''); }}>
              Cancelar
            </Button>
            <Button onClick={handleReturn} isLoading={returnLoan.isPending}>
              Devolver
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
