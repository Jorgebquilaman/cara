import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import { Incident } from '@/types';
import { CheckCircle, Eye, Plus, AlertTriangle, Camera, X, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [incidentAssetId, setIncidentAssetId] = useState('');
  const [incidentAssetSearch, setIncidentAssetSearch] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data } = await api.get<Incident[]>('/incidents');
      return data;
    },
  });

  const { data: assetsData } = useAssets({ pageSize: 1000 });
  const activeAssets = (assetsData?.items ?? []).filter((a) => a.status !== 'Decommissioned');
  const incidentAssetOptions = activeAssets.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));
  const filteredIncidentAssetOptions = incidentAssetOptions.filter((opt) =>
    opt.label.toLowerCase().includes(incidentAssetSearch.toLowerCase())
  );
  const selectedIncidentAsset = activeAssets.find((a) => a.id === incidentAssetId);

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/incidents/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente resuelto');
    },
    onError: () => toast.error('Error al resolver el incidente'),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/incidents', {
        assetId: incidentAssetId,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
      });
    },
    onSuccess: () => {
      setIsCreateOpen(false);
      setDescription('');
      setPhotoUrl(null);
      setPhotoPreview(null);
      setIncidentAssetId('');
      setIncidentAssetSearch('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Incidente reportado');
    },
    onError: () => toast.error('Error al reportar el incidente'),
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Solo se permiten fotos JPG o PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no puede superar los 5 MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ url: string }>('/incidents/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoUrl(data.url);
      setPhotoPreview(data.url);
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const columns = [
    {
      key: 'asset',
      header: 'Activo',
      render: (i: Incident) => (
        <div className="flex items-center gap-3">
          {i.assetImageUrl && (
            <img src={i.assetImageUrl} alt={i.assetName} className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div>
            <p className="font-medium text-cara-900">{i.assetName}</p>
            <p className="text-xs text-cara-500">{i.assetCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'description', header: 'Descripción' },
    {
      key: 'photoUrl',
      header: 'Evidencia',
      render: (i: Incident) => i.photoUrl ? (
        <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(i.photoUrl!)}>
            <Eye className="h-4 w-4" />
        </Button>
      ) : <span className="text-cara-400">—</span>,
    },
    {
      key: 'reportedAt',
      header: 'Reportado',
      render: (i: Incident) => new Date(i.reportedAt).toLocaleDateString(),
    },
    {
      key: 'isResolved',
      header: 'Estado',
      render: (i: Incident) => <Badge status={i.isResolved ? 'Completed' : 'Pending'} />,
    },
    ...(isAdminOrStaff ? [{
      key: 'actions',
      header: 'Acciones',
      render: (i: Incident) =>
        !i.isResolved ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resolveMutation.mutate(i.id)}
            isLoading={resolveMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 text-success" />
          </Button>
        ) : null,
    }] : []),
  ];

  const exportExcel = () => {
    const rows = (incidents ?? []).map((i) => ({
      'Activo': i.assetName,
      'Código': i.assetCode,
      'Descripción': i.description,
      'Reportado': new Date(i.reportedAt).toLocaleDateString(),
      'Estado': i.isResolved ? 'Resuelto' : 'Pendiente',
      'Resuelto': i.resolvedAt ? new Date(i.resolvedAt).toLocaleDateString() : '',
      'Evidencia': i.photoUrl ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Incidentes');
    XLSX.writeFile(wb, `incidentes-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Excel exportado');
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Activo', 'Código', 'Descripción', 'Reportado', 'Estado']],
      body: (incidents ?? []).map((i) => [
        i.assetName,
        i.assetCode,
        i.description.length > 80 ? `${i.description.slice(0, 80)}…` : i.description,
        new Date(i.reportedAt).toLocaleDateString(),
        i.isResolved ? 'Resuelto' : 'Pendiente',
      ]),
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [11, 79, 87] },
    });
    doc.save(`incidentes-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Incidentes</h1>
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
            Reportar incidente
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={incidents ?? []}
          keyExtractor={(i) => i.id}
          isLoading={isLoading}
          emptyMessage="No hay incidentes reportados"
        />
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Reportar incidente" size="lg">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-warning" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Reportá daños o novedades del activo, por ejemplo: <em>"se rompió con el tiempo que está guardado"</em>.
              El personal administrativo revisará el reporte.
            </p>
          </div>

          <div className="relative">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Activo</label>
            <input
              type="text"
              placeholder="Buscá por código o nombre..."
              value={incidentAssetSearch}
              onChange={(e) => {
                setIncidentAssetSearch(e.target.value);
                setShowAssetDropdown(true);
              }}
              onFocus={() => setShowAssetDropdown(true)}
              onBlur={() => setTimeout(() => setShowAssetDropdown(false), 200)}
              className="w-full h-11 rounded-full border border-transparent bg-[var(--surface)] px-4 text-sm text-ink shadow-[var(--shadow-inset)] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory"
            />
            {showAssetDropdown && (
              <div className="absolute z-50 mt-2 w-full max-h-56 overflow-y-auto rounded-2xl bg-[var(--surface)] border border-[var(--border-card)] shadow-float">
                {filteredIncidentAssetOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : (
                  filteredIncidentAssetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cara-50 transition-colors ${
                        incidentAssetId === opt.value ? 'bg-cara-50 font-medium' : ''
                      }`}
                      onClick={() => {
                        setIncidentAssetId(opt.value);
                        setIncidentAssetSearch(opt.label);
                        setShowAssetDropdown(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción *</label>
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Contá qué pasó con el activo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-transparent bg-[var(--surface)] px-4 py-3 text-sm text-ink shadow-[var(--shadow-inset)] focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Foto de la evidencia <span className="text-xs font-normal text-gray-500">(opcional)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              id="incident-photo"
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById('incident-photo')?.click()}
              isLoading={uploadingPhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              {photoUrl ? 'Cambiar foto' : 'Agregar foto'}
            </Button>
            {photoPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img src={photoPreview} alt="Evidencia" className="h-20 w-20 rounded-lg object-cover border" />
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() => { setPhotoUrl(null); setPhotoPreview(null); }}
                >
                  <X className="h-3 w-3 inline mr-1" />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              disabled={!incidentAssetId || !description.trim()}
            >
              Reportar incidente
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Evidencia del incidente">
        {previewUrl && (
          <img src={previewUrl} alt="Evidencia" className="max-h-[70vh] w-full rounded-lg object-contain" />
        )}
      </Modal>
    </div>
  );
}
