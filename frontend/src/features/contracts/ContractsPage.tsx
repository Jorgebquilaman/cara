import { useState, useMemo, useRef } from 'react';
import { useContracts, useCreateContract, useUpdateContract, useDeleteContract } from '@/hooks/useContracts';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search, Plus, Pencil, Trash2, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Contract } from '@/types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'Active', label: 'Activo' },
  { value: 'Expired', label: 'Vencido' },
  { value: 'Cancelled', label: 'Cancelado' },
  { value: 'Draft', label: 'Borrador' },
];

const statusBadgeMap: Record<string, string> = {
  Active: 'Activo',
  Expired: 'Vencido',
  Cancelled: 'Cancelado',
  Draft: 'Borrador',
};

export default function ContractsPage() {
  const { data: contracts = [], isLoading } = useContracts();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Create form state
  const [createCode, setCreateCode] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createContent, setCreateContent] = useState('');
  const [createProvider, setCreateProvider] = useState('');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');

  // Edit form state
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const openEdit = (c: Contract) => {
    setEditingContract(c);
    setEditCode(c.code);
    setEditTitle(c.title);
    setEditContent(c.content || '');
    setEditProvider(c.provider || '');
    setEditStartDate(c.startDate.slice(0, 16));
    setEditEndDate(c.endDate ? c.endDate.slice(0, 16) : '');
    setEditStatus(c.status);
    setIsEditOpen(true);
  };

  const resetCreate = () => {
    setCreateCode('');
    setCreateTitle('');
    setCreateContent('');
    setCreateProvider('');
    setCreateStartDate('');
    setCreateEndDate('');
  };

  const handleCreate = async () => {
    if (!createCode.trim() || !createTitle.trim() || !createStartDate) {
      toast.error('Completá los campos obligatorios');
      return;
    }
    try {
      await createContract.mutateAsync({
        code: createCode.trim(),
        title: createTitle.trim(),
        content: createContent.trim() || undefined,
        provider: createProvider.trim() || undefined,
        startDate: new Date(createStartDate).toISOString(),
        endDate: createEndDate ? new Date(createEndDate).toISOString() : undefined,
      });
      setIsCreateOpen(false);
      resetCreate();
    } catch { /* handled by hook */ }
  };

  const handleEdit = async () => {
    if (!editingContract || !editTitle.trim() || !editStartDate) {
      toast.error('Completá los campos obligatorios');
      return;
    }
    try {
      await updateContract.mutateAsync({
        id: editingContract.id,
        title: editTitle.trim(),
        content: editContent.trim() || undefined,
        provider: editProvider.trim() || undefined,
        startDate: new Date(editStartDate).toISOString(),
        endDate: editEndDate ? new Date(editEndDate).toISOString() : undefined,
        status: editStatus,
      });
      setIsEditOpen(false);
      setEditingContract(null);
    } catch { /* handled by hook */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContract.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch { /* handled by hook */ }
  };

  const handleSearch = (value: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(value), 400);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = contracts;
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.provider || '').toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String((a as any)[sortKey] ?? '');
        const bVal = String((b as any)[sortKey] ?? '');
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return result;
  }, [contracts, statusFilter, search, sortKey, sortDir]);

  const exportExcel = () => {
    if (!filtered.length) return;
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((c) => ({
        Código: c.code,
        Título: c.title,
        Proveedor: c.provider || '',
        Inicio: new Date(c.startDate).toLocaleDateString('es-AR'),
        Fin: c.endDate ? new Date(c.endDate).toLocaleDateString('es-AR') : '',
        Estado: statusBadgeMap[c.status] || c.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contratos');
    XLSX.writeFile(wb, 'contratos.xlsx');
  };

  const exportPdf = () => {
    if (!filtered.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Contratos - CARA', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 34,
      head: [['Código', 'Título', 'Proveedor', 'Inicio', 'Fin', 'Estado']],
      body: filtered.map((c) => [
        c.code,
        c.title,
        c.provider || '',
        new Date(c.startDate).toLocaleDateString('es-AR'),
        c.endDate ? new Date(c.endDate).toLocaleDateString('es-AR') : '',
        statusBadgeMap[c.status] || c.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
    doc.save('contratos.pdf');
  };

  const columns = [
    { key: 'code', header: 'Código', sortable: true },
    { key: 'title', header: 'Título', sortable: true },
    { key: 'provider', header: 'Proveedor', sortable: true, render: (c: Contract) => c.provider || <span className="text-cara-400">—</span> },
    {
      key: 'startDate',
      header: 'Inicio',
      sortable: true,
      render: (c: Contract) => new Date(c.startDate).toLocaleDateString('es-AR'),
    },
    {
      key: 'endDate',
      header: 'Fin',
      sortable: true,
      render: (c: Contract) => c.endDate ? new Date(c.endDate).toLocaleDateString('es-AR') : <span className="text-cara-400">—</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (c: Contract) => <Badge status={statusBadgeMap[c.status] || c.status} />,
    },
    {
      key: 'acciones',
      header: '',
      render: (c: Contract) => (
        <div className="flex gap-1">
          <button onClick={() => setViewContract(c)} className="rounded-lg p-2 text-cara-500 hover:bg-cara-100 hover:text-cara-700 transition-colors" title="Ver contenido">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-cara-500 hover:bg-cara-100 hover:text-cara-700 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-2 text-danger hover:bg-red-50 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Contratos</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná los contratos del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="secondary" onClick={exportPdf}>
            <FileText className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => { resetCreate(); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo Contrato
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cara-400" />
            <input
              type="text"
              placeholder="Buscar por código, título o proveedor..."
              className="w-full rounded-lg border border-cara-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cara-500 focus:border-transparent transition-shadow"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          />
        </div>
      </Card>

      <div className="card-surface overflow-hidden">
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron contratos"
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nuevo Contrato">
        <div className="space-y-4">
          <Input label="Código *" value={createCode} onChange={(e) => setCreateCode(e.target.value)} placeholder="Ej: CONT-001" />
          <Input label="Título *" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
          <Input label="Proveedor" value={createProvider} onChange={(e) => setCreateProvider(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Contenido (Markdown)</label>
            <textarea
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm font-mono focus:border-cara-500 focus:outline-none"
              placeholder="# Título del contrato&#10;&#10;Cuerpo del contrato en Markdown..."
            />
          </div>
          <Input label="Fecha de inicio *" type="datetime-local" value={createStartDate} onChange={(e) => setCreateStartDate(e.target.value)} />
          <Input label="Fecha de fin" type="datetime-local" value={createEndDate} onChange={(e) => setCreateEndDate(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} isLoading={createContract.isPending}>Crear</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingContract(null); }} title="Editar Contrato">
        <div className="space-y-4">
          <div className="text-sm text-cara-500">Código: <span className="font-mono font-semibold text-cara-800">{editCode}</span></div>
          <Input label="Título *" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <Input label="Proveedor" value={editProvider} onChange={(e) => setEditProvider(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-cara-700">Contenido (Markdown)</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-cara-200 px-3 py-2 text-sm font-mono focus:border-cara-500 focus:outline-none"
              placeholder="# Título del contrato&#10;&#10;Cuerpo del contrato en Markdown..."
            />
          </div>
          <Input label="Fecha de inicio *" type="datetime-local" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
          <Input label="Fecha de fin" type="datetime-local" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
          <Select
            label="Estado"
            options={[
              { value: 'Active', label: 'Activo' },
              { value: 'Expired', label: 'Vencido' },
              { value: 'Cancelled', label: 'Cancelado' },
              { value: 'Draft', label: 'Borrador' },
            ]}
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsEditOpen(false); setEditingContract(null); }}>Cancelar</Button>
            <Button onClick={handleEdit} isLoading={updateContract.isPending}>Guardar</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Eliminación">
        <p className="text-sm text-cara-600">
          ¿Estás seguro de que querés eliminar el contrato <strong>{deleteTarget?.title}</strong>?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={handleDelete} isLoading={deleteContract.isPending}>Eliminar</Button>
        </div>
      </Modal>

      <Modal isOpen={!!viewContract} onClose={() => setViewContract(null)} title={viewContract?.title || ''} size="lg">
        {viewContract && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-cara-500 border-b border-cara-200 pb-3">
              <span><strong>Código:</strong> {viewContract.code}</span>
              <span><strong>Proveedor:</strong> {viewContract.provider || '—'}</span>
              <span><strong>Estado:</strong> {statusBadgeMap[viewContract.status] || viewContract.status}</span>
            </div>
            {viewContract.content ? (
              <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-white/10 p-4 max-h-96 overflow-y-auto text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                <ReactMarkdown>{viewContract.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-cara-400 italic">Sin contenido</p>
            )}
            <div className="flex justify-end gap-2 text-sm text-cara-400">
              <span>Inicio: {new Date(viewContract.startDate).toLocaleDateString('es-AR')}</span>
              {viewContract.endDate && <span>Fin: {new Date(viewContract.endDate).toLocaleDateString('es-AR')}</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
