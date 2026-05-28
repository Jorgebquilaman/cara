import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUserLoans, useCreateLoan, useReturnLoan } from '@/hooks/useLoans';
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
import { Plus, Undo2 } from 'lucide-react';
import { Loan } from '@/types';
import { SatisfactionSurveyModal } from '@/components/ui/SatisfactionSurveyModal';
import toast from 'react-hot-toast';

const loanSchema = z.object({
  assetId: z.string().min(1, 'Seleccioná un activo'),
  startDate: z.string().min(1, 'Requerido'),
  dueDate: z.string().min(1, 'Requerido'),
  observations: z.string().max(1000).optional(),
  prenda: z.string().optional(),
});

type LoanForm = z.infer<typeof loanSchema>;

export default function MyLoansPage() {
  const { user } = useAuth();
  const { data: loans, isLoading } = useUserLoans(user?.id ?? '');
  const { data: pendingSurveys, refetch: refetchSurveys } = useQuery({
      queryKey: ['pending-surveys'],
      queryFn: async () => { const { data } = await api.get('/surveys/pending'); return data; },
      enabled: !!user
  });
  const { data: assetsData } = useAssets({ pageSize: 1000 });
  const createLoan = useCreateLoan();
  const returnLoan = useReturnLoan();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [surveyLoanId, setSurveyLoanId] = useState<string | null>(null);

  const form = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
  });

  const activeAssets = (assetsData?.items ?? []).filter((a) => a.status !== 'Decommissioned');
  const assetOptions = activeAssets.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}${a.status !== 'Available' ? ` (${a.status === 'InUse' ? 'En uso' : a.status})` : ''}`,
  }));

  const selectedAsset = activeAssets.find((a) => a.id === selectedAssetId);

  const onSubmit = async (data: LoanForm) => {
    await createLoan.mutateAsync({
      ...data,
      prenda: parseFloat(data.prenda || '0'),
    });
    setIsCreateOpen(false);
    form.reset();
  };

  const handleReturn = async (loanId: string) => {
    try {
        await returnLoan.mutateAsync({ id: loanId });
        toast.success('Activo devuelto correctamente');
        setSurveyLoanId(loanId);
        refetchSurveys();
    } catch {
        toast.error('Error al devolver el activo');
    }
  };

  const columns = [
    { key: 'assetCode', header: 'Código' },
    { key: 'assetName', header: 'Activo' },
    {
      key: 'startDate',
      header: 'Inicio',
      render: (l: Loan) => new Date(l.startDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (l: Loan) => new Date(l.dueDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    },
    { key: 'status', header: 'Estado', render: (l: Loan) => <Badge status={l.status} /> },
  ];

  return (
    <div className="space-y-6">
      {pendingSurveys && pendingSurveys.length > 0 && (
          <Card title="Encuestas Pendientes" subtitle="Por favor, ayudanos a mejorar completando estas encuestas">
              <div className="space-y-2">
                  {pendingSurveys.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                          <p className="text-sm text-yellow-800">Préstamo del activo: {s.name}</p>
                          <Button size="sm" variant="secondary" onClick={() => setSurveyLoanId(s.id)}>Completar encuesta</Button>
                      </div>
                  ))}
              </div>
          </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Mis Préstamos</h1>
          <p className="text-sm text-cara-500 mt-1">Gestioná tus préstamos activos y pasados</p>
        </div>
        {user?.role === 'Admin' || user?.role === 'Staff' ? (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Préstamo
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border border-cara-200 bg-white overflow-hidden shadow-sm">
        <Table
          columns={columns}
          data={loans ?? []}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No tenés préstamos registrados"
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Solicitar Préstamo">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={createLoan.isPending}>Solicitar</Button>
          </div>
        </form>
      </Modal>

      {surveyLoanId && (
          <SatisfactionSurveyModal
            loanId={surveyLoanId}
            isOpen={!!surveyLoanId}
            onClose={() => setSurveyLoanId(null)}
            onSuccess={() => { setSurveyLoanId(null); refetchSurveys(); }}
          />
      )}
    </div>
  );
}
