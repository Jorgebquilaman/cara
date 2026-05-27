import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FileText, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types';

interface UserHistory {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  institutionalEmail: string;
  role: string;
  isActive: boolean;
  loans: {
    id: string;
    assetName: string;
    startDate: string;
    dueDate: string;
    status: string;
    requestedAt: string;
    returnedAt?: string;
  }[];
  incidents: {
    id: string;
    description: string;
    reportedAt: string;
    isResolved: boolean;
  }[];
  sanctions: {
    id: string;
    reason: string;
    issuedAt: string;
    resolvedAt?: string;
    isActive: boolean;
  }[];
}

const reports = [
  { title: 'Préstamos Activos', description: 'Listado de todos los préstamos actualmente activos', endpoint: 'loans/csv', filename: 'prestamos-activos.csv' },
  { title: 'Activos por Categoría', description: 'Inventario de activos agrupados por categoría', endpoint: 'assets/by-category/csv', filename: 'activos-por-categoria.csv' },
  { title: 'Usuarios con Sanciones', description: 'Usuarios que poseen sanciones activas', endpoint: 'sanctions/active/csv', filename: 'sanciones-activas.csv' },
  { title: 'Historial de Auditoría', description: 'Registro de cambios en el sistema', endpoint: 'audit/csv', filename: 'auditoria.csv' },
];

export default function ReportsPage() {
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });

  const { data: userHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['user-history', selectedUserId],
    queryFn: async () => {
      const { data } = await api.get<UserHistory>(`/reports/user-history/${selectedUserId}`);
      return data;
    },
    enabled: !!selectedUserId,
  });

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(`/reports/${endpoint}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte descargado');
    } catch {
      toast.error('Error al generar el reporte');
    }
  };

  const handleExportUserHistory = async () => {
    if (!selectedUserId) return;
    const user = users?.find((u) => u.id === selectedUserId);
    await handleExport(`user-history/${selectedUserId}/csv`, `historial-${user?.fullName ?? selectedUserId}.csv`);
  };

  const userOptions = (users ?? []).map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.institutionalEmail})`,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-cara-900">Reportes</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} title={report.title} subtitle={report.description}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cara-100 p-2">
                <FileText className="h-5 w-5 text-cara-600" />
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleExport(report.endpoint, report.filename)}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </Card>
        ))}

        <Card title="Historial de Usuario" subtitle="Préstamos, incidentes y sanciones de un usuario">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cara-100 p-2">
              <Search className="h-5 w-5 text-cara-600" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setHistoryModalOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Ver Historial
            </Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={historyModalOpen} onClose={() => { setHistoryModalOpen(false); setSelectedUserId(''); }} title="Historial de Usuario" size="lg">
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Select
                label="Seleccioná un usuario"
                options={userOptions}
                placeholder="Buscar usuario..."
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              />
            </div>
            {selectedUserId && (
              <Button variant="secondary" size="sm" onClick={handleExportUserHistory}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            )}
          </div>

          {historyLoading && <p className="text-sm text-cara-500">Cargando historial...</p>}

          {userHistory && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="rounded-lg border border-cara-200 bg-cara-50 p-4">
                <h3 className="font-semibold text-cara-900">{userHistory.fullName}</h3>
                <p className="text-sm text-cara-600">{userHistory.institutionalEmail} · {userHistory.role}</p>
              </div>

              <div>
                <h4 className="font-semibold text-cara-900 mb-2">Préstamos ({userHistory.loans.length})</h4>
                {userHistory.loans.length === 0 ? (
                  <p className="text-sm text-cara-500">Sin préstamos</p>
                ) : (
                  <div className="space-y-2">
                    {userHistory.loans.map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded-lg border border-cara-200 p-3 text-sm">
                        <div>
                          <p className="font-medium text-cara-900">{l.assetName}</p>
                          <p className="text-cara-500">{new Date(l.startDate).toLocaleDateString()} → {new Date(l.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge status={l.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-cara-900 mb-2">Incidentes ({userHistory.incidents.length})</h4>
                {userHistory.incidents.length === 0 ? (
                  <p className="text-sm text-cara-500">Sin incidentes</p>
                ) : (
                  <div className="space-y-2">
                    {userHistory.incidents.map((i) => (
                      <div key={i.id} className="flex items-center justify-between rounded-lg border border-cara-200 p-3 text-sm">
                        <div>
                          <p className="text-cara-900">{i.description}</p>
                          <p className="text-cara-500">{new Date(i.reportedAt).toLocaleDateString()}</p>
                        </div>
                        <Badge status={i.isResolved ? 'Completed' : 'Pending'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-cara-900 mb-2">Sanciones ({userHistory.sanctions.length})</h4>
                {userHistory.sanctions.length === 0 ? (
                  <p className="text-sm text-cara-500">Sin sanciones</p>
                ) : (
                  <div className="space-y-2">
                    {userHistory.sanctions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-cara-200 p-3 text-sm">
                        <div>
                          <p className="text-cara-900">{s.reason}</p>
                          <p className="text-cara-500">{new Date(s.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <Badge status={s.isActive ? 'Overdue' : 'Completed'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
