import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUserLoans, useCreateLoan } from '@/hooks/useLoans';
import { useAssets } from '@/hooks/useAssets';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus } from 'lucide-react';
import { Loan } from '@/types';

const loanSchema = z.object({
  assetId: z.string().min(1, 'Seleccioná un activo'),
  startDate: z.string().min(1, 'Requerido'),
  dueDate: z.string().min(1, 'Requerido'),
});

type LoanForm = z.infer<typeof loanSchema>;

export default function MyLoansPage() {
  const { user } = useAuth();
  const { data: loans, isLoading } = useUserLoans(user?.id ?? '');
  const { data: assetsData } = useAssets({ pageSize: 1000 });
  const createLoan = useCreateLoan();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');

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
    await createLoan.mutateAsync(data);
    setIsCreateOpen(false);
    form.reset();
  };

  const columns = [
    { key: 'assetCode', header: 'Código' },
    { key: 'assetName', header: 'Activo' },
    {
      key: 'startDate',
      header: 'Inicio',
      render: (l: Loan) => new Date(l.startDate).toLocaleDateString(),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (l: Loan) => new Date(l.dueDate).toLocaleDateString(),
    },
    { key: 'status', header: 'Estado', render: (l: Loan) => <Badge status={l.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cara-900">Mis Préstamos</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Solicitar Préstamo
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={loans ?? []}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No tenés préstamos registrados"
        />
      </Card>

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
            label="Fecha de inicio"
            type="date"
            error={form.formState.errors.startDate?.message}
            {...form.register('startDate')}
          />
          <Input
            label="Fecha de devolución"
            type="date"
            error={form.formState.errors.dueDate?.message}
            {...form.register('dueDate')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={createLoan.isPending}>Solicitar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
