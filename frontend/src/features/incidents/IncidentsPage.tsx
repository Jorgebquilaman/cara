import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Incident } from '@/types';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IncidentsPage() {
  const queryClient = useQueryClient();
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
    { key: 'description', header: 'Descripción' },
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
    </div>
  );
}
