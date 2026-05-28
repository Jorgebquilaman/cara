import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Incident } from '@/types';
import { CheckCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data } = await api.get<Incident[]>('/incidents');
      return data;
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/incidents/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incidente resuelto');
    },
    onError: () => toast.error('Error al resolver el incidente'),
  });

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
    {
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
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-cara-900">Incidentes</h1>
      <Card>
        <Table
          columns={columns}
          data={incidents ?? []}
          keyExtractor={(i) => i.id}
          isLoading={isLoading}
          emptyMessage="No hay incidentes reportados"
        />
      </Card>

      <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Evidencia del incidente">
        {previewUrl && (
          <img src={previewUrl} alt="Evidencia" className="max-h-[70vh] w-full rounded-lg object-contain" />
        )}
      </Modal>
    </div>
  );
}
