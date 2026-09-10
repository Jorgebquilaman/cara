import { useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useApproveLoan, usePickUpLoanWithContract, useRejectLoan, useReturnLoan, useCreateLoan, useSendReminder } from '@/hooks/useLoans';
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
import { Search, CheckCircle, XCircle, Undo2, Plus, Bell, FileSpreadsheet, FileText, Star } from 'lucide-react';
import { Loan, User, Contract } from '@/types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactStars from 'react-stars';
import ReactMarkdown from 'react-markdown';

const loanSchema = z.object({
  userId: z.string().min(1, 'Seleccioná un usuario'),
  assetId: z.string().min(1, 'Seleccioná un activo'),
  startDate: z.string().min(1, 'Requerido'),
  dueDate: z.string().min(1, 'Requerido'),
  observations: z.string().max(1000).optional(),
  prenda: z.string().optional(),
});

type LoanForm = z.infer<typeof loanSchema>;

const statusFilterOptions = [
  { value: '', label: 'Todos' },
  { value: 'Pending', label: 'Pendientes' },
  { value: 'Approved', label: 'Aprobados (Listos para retirar)' },
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
  const pickUpLoan = usePickUpLoanWithContract();
  const rejectLoan = useRejectLoan();
  const returnLoan = useReturnLoan();
  const createLoan = useCreateLoan();
  const sendReminder = useSendReminder();
  const { data: assetsData } = useAssets({ pageSize: 1000 });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data } = await api.get<User[]>('/users');
        return data;
      } catch {
        return [];
      }
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
  const [userRating, setUserRating] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [contractData, setContractData] = useState<Contract | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
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
    const rating = userRating > 0 ? userRating : undefined;
    await returnLoan.mutateAsync({ id: returnModal.id, incidentDescription: desc, incidentPhotoUrl: photo, userRating: rating, userRatingComment: desc });
    setReturnModal({ id: '', open: false });
    setIncidentDescription('');
    setIncidentPhotoUrl('');
    setUserRating(0);
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

  const openCreateModal = () => {
    setSelectedUserId('');
    setUserSearch('');
    setShowUserDropdown(false);
    setSelectedAssetId('');
    setAssetSearch('');
    setShowAssetDropdown(false);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setSelectedUserId('');
    setUserSearch('');
    setShowUserDropdown(false);
    setSelectedAssetId('');
    setAssetSearch('');
    setShowAssetDropdown(false);
    setIsCreateOpen(false);
    form.reset();
  };

  const onCreateSubmit = async (data: LoanForm) => {
    const selectedAsset = activeAssets.find((a) => a.id === data.assetId);
    const start = new Date(data.startDate);
    const end = new Date(data.dueDate);
    if (selectedAsset && end.getTime() - start.getTime() > selectedAsset.maxLoanDays * 24 * 60 * 60 * 1000) {
      form.setError('dueDate', { message: `El período máximo de este activo es de ${selectedAsset.maxLoanDays} días` });
      return;
    }
    try {
      await createLoan.mutateAsync({
        userId: data.userId,
        assetId: data.assetId,
        startDate: data.startDate,
        dueDate: data.dueDate,
        observations: data.observations || undefined,
        prenda: parseFloat(data.prenda || '0'),
      });
      closeCreateModal();
      setIsCreateOpen(false);
    } catch { /* el interceptor muestra el mensaje del backend */ }
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
  const filteredUserOptions = userOptions.filter((opt) =>
    opt.label.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredAssetOptions = assetOptions.filter((opt) =>
    opt.label.toLowerCase().includes(assetSearch.toLowerCase())
  );

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
    if (sortKey) {
      const sorted = [...result].sort((a, b) => {
        const aVal = String((a as any)[sortKey] ?? '');
        const bVal = String((b as any)[sortKey] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
      return sorted;
    }
    return result;
  }, [allLoans, statusFilter, search, sortKey, sortDir]);

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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
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
        new Date(l.startDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
        new Date(l.dueDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
        l.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('prestamos.pdf');
  };

  const columns = [
    { key: 'assetName', header: 'Activo', sortable: true },
    { key: 'userName', header: 'Usuario', sortable: true },
    {
      key: 'startDate',
      header: 'Inicio',
      sortable: true,
      render: (l: Loan) => new Date(l.startDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      sortable: true,
      render: (l: Loan) => new Date(l.dueDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    },
    { key: 'status', header: 'Estado', sortable: true, render: (l: Loan) => <Badge status={l.status} /> },
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
            <Button variant="ghost" size="sm" onClick={async () => {
              try {
                const contract = await pickUpLoan.mutateAsync(l.id);
                setContractData(contract);
              } catch { /* handled by hook */ }
            }}>
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

      <div className="card-surface overflow-hidden">
        <Table
          columns={columns}
          data={paged}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron préstamos"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <Pagination
          pageNumber={page}
          totalPages={totalPages}
          totalCount={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} title="Nuevo Préstamo" size="lg">
        <form onSubmit={form.handleSubmit(onCreateSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                <input
                  type="text"
                  placeholder="Buscá por nombre o email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500"
                />
                {showUserDropdown && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700 shadow-lg">
                    {filteredUserOptions.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-cara-400">Sin resultados</p>
                    ) : (
                      filteredUserOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-cara-50 transition-colors ${
                            selectedUserId === opt.value ? 'bg-cara-100 font-medium' : ''
                          }`}
                          onClick={() => {
                            setSelectedUserId(opt.value);
                            setUserSearch(opt.label);
                            setShowUserDropdown(false);
                            form.setValue('userId', opt.value, { shouldValidate: true });
                          }}
                        >
                          {opt.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {form.formState.errors.userId?.message && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.userId?.message}</p>
                )}
                <input type="hidden" name="userId" value={selectedUserId} />
              </div>
              {selectedUser?.hasActiveSanctions && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  <strong className="block mb-1">Usuario suspendido</strong>
                  Este usuario tiene sanciones activas y no está autorizado para solicitar préstamos ni hacer reservas.
                </div>
              )}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activo</label>
                <input
                  type="text"
                  placeholder="Buscá por código o nombre..."
                  value={assetSearch}
                  onChange={(e) => {
                    setAssetSearch(e.target.value);
                    setShowAssetDropdown(true);
                  }}
                  onFocus={() => setShowAssetDropdown(true)}
                  onBlur={() => setTimeout(() => setShowAssetDropdown(false), 200)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500"
                />
                {showAssetDropdown && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700 shadow-lg">
                    {filteredAssetOptions.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-cara-400">Sin resultados</p>
                    ) : (
                      filteredAssetOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-cara-50 transition-colors ${
                            selectedAssetId === opt.value ? 'bg-cara-100 font-medium' : ''
                          }`}
                          onClick={() => {
                            setSelectedAssetId(opt.value);
                            setAssetSearch(opt.label);
                            setShowAssetDropdown(false);
                            form.setValue('assetId', opt.value, { shouldValidate: true });
                          }}
                        >
                          {opt.label}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {form.formState.errors.assetId?.message && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.assetId?.message}</p>
                )}
                <input type="hidden" name="assetId" value={selectedAssetId} />
              </div>
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
            </div>

            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500"
                  rows={3}
                  {...form.register('observations')}
                />
              </div>
              <Input
                label="Prenda ($)"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                error={form.formState.errors.prenda?.message}
                {...form.register('prenda')}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" isLoading={createLoan.isPending}>Crear</Button>
              </div>
            </div>
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
        onClose={() => { setReturnModal({ id: '', open: false }); setIncidentDescription(''); setIncidentPhotoUrl(''); setUserRating(0); }}
        title="Devolver Préstamo"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-cara-700">Valoración del préstamo</p>
            <ReactStars
              count={5}
              value={userRating}
              onChange={(val: number) => setUserRating(val)}
              size={32}
              color2="#facc15"
              color1="#d1d5db"
              half={false}
            />
          </div>
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
            <Button variant="secondary" onClick={() => { setReturnModal({ id: '', open: false }); setIncidentDescription(''); setIncidentPhotoUrl(''); setUserRating(0); }}>
              Cancelar
            </Button>
            <Button onClick={handleReturn} isLoading={returnLoan.isPending}>
              Devolver
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!contractData} onClose={() => setContractData(null)} title="Contrato de Préstamo" size="lg">
        {contractData && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-cara-500 border-b border-cara-200 pb-3">
              <span><strong>Código:</strong> {contractData.code}</span>
              <span><strong>Estado:</strong> <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">Activo</span></span>
            </div>
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-white/10 p-6 max-h-96 overflow-y-auto text-sm text-gray-800 dark:text-gray-200 leading-relaxed" id="contract-content">
              <ReactMarkdown>{contractData.content || ''}</ReactMarkdown>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`<!DOCTYPE html><html><head><title>${contractData.code}</title><style>body{font-family:serif;padding:2cm;line-height:1.6}table{border-collapse:collapse;width:100%;margin:1em 0}td,th{border:1px solid #ccc;padding:8px}th{background:#f5f5f5}</style></head><body>${document.getElementById('contract-content')?.innerHTML || ''}</body></html>`);
                  printWindow.document.close();
                  printWindow.print();
                }
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button onClick={() => {
                const doc = new jsPDF();
                const content = document.getElementById('contract-content');
                if (content) {
                  doc.html(content.innerHTML, {
                    callback: (d) => d.save(`${contractData.code}.pdf`),
                    x: 10, y: 10,
                    width: 190,
                    windowWidth: 800,
                  });
                }
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
