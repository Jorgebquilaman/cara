import { usePastDueLoans, useSendOverdueAlert } from '@/hooks/useLoans';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Bell, Clock } from 'lucide-react';
import { Loan } from '@/types';

export default function OverdueLoansPage() {
  const { data: loans, isLoading } = usePastDueLoans();
  const sendAlert = useSendOverdueAlert();

  const pastDueLoans = loans ?? [];

  const columns = [
    { key: 'assetName', header: 'Activo' },
    { key: 'assetCode', header: 'Código' },
    { key: 'userName', header: 'Usuario' },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (l: Loan) => {
        const daysOverdue = Math.floor((Date.now() - new Date(l.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-danger" />
            <span>{new Date(l.dueDate).toLocaleDateString()}</span>
            <span className="text-xs text-danger font-medium">({daysOverdue}d atrasado)</span>
          </div>
        );
      },
    },
    { key: 'status', header: 'Estado', render: (l: Loan) => <Badge status={l.status} /> },
    {
      key: 'actions',
      header: 'Acciones',
      render: (l: Loan) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => sendAlert.mutate(l.id)}
          title="Enviar alerta de vencimiento"
          isLoading={sendAlert.isPending && sendAlert.variables === l.id}
        >
          <Bell className="h-4 w-4 text-danger" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-danger" />
        <h1 className="text-2xl font-bold text-cara-900">Préstamos Vencidos</h1>
      </div>

      <Card
        title="Préstamos con devolución atrasada"
        subtitle={isLoading ? '...' : `${pastDueLoans.length} préstamos vencidos`}
      >
        <Table
          columns={columns}
          data={pastDueLoans}
          keyExtractor={(l) => l.id}
          isLoading={isLoading}
          emptyMessage="No hay préstamos vencidos"
        />
      </Card>

      {pastDueLoans.length > 0 && (
        <Card title="Acciones masivas">
          <p className="text-sm text-cara-600 mb-4">
            Enviar alerta de vencimiento a todos los usuarios con préstamos atrasados.
          </p>
          <Button
            onClick={() => {
              pastDueLoans.forEach((loan) => sendAlert.mutate(loan.id));
            }}
            isLoading={sendAlert.isPending}
          >
            <Bell className="h-4 w-4 mr-2" />
            Enviar alertas a todos ({pastDueLoans.length})
          </Button>
        </Card>
      )}
    </div>
  );
}
