import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Eye, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phoneNumber: string | null;
  careerId: string | null;
  attachmentUrl: string | null;
  requestedRole: string;
  reason: string;
  requestedAt: string;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason: string | null;
  notified: boolean;
}

export default function AccountRequestsPage() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });
  const [rejectReason, setRejectReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['account-requests'],
    queryFn: async () => {
      const { data } = await api.get<AccountRequest[]>('/account-requests');
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/account-requests/${id}/approve`);
      return data as { tempPassword: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Usuario creado. Contraseña temporal: ${data.tempPassword}`, { duration: 10000 });
    },
    onError: () => toast.error('Error al aprobar solicitud'),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.post(`/account-requests/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      setRejectModal({ id: '', open: false });
      setRejectReason('');
      toast.success('Solicitud rechazada');
    },
    onError: () => toast.error('Error al rechazar solicitud'),
  });

  const notifyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/account-requests/${id}/notify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-requests'] });
      toast.success('Notificación enviada al usuario');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al notificar'),
  });

  const roleLabels: Record<string, string> = { Student: 'Estudiante', Teacher: 'Docente', Staff: 'Staff', Admin: 'Admin' };

  const columns = [
    {
      key: 'name',
      header: 'Solicitante',
      render: (r: AccountRequest) => `${r.firstName} ${r.lastName}`,
    },
    { key: 'email', header: 'Email' },
    { key: 'dni', header: 'DNI' },
    {
      key: 'phoneNumber',
      header: 'Teléfono',
      render: (r: AccountRequest) => r.phoneNumber || <span className="text-cara-400">—</span>,
    },
    {
      key: 'careerId',
      header: 'Carrera',
      render: (r: AccountRequest) => r.careerId
        ? <span className="text-xs text-cara-500">ID: {r.careerId.slice(0, 8)}...</span>
        : <span className="text-cara-400">—</span>,
    },
    {
      key: 'requestedRole',
      header: 'Rol',
      render: (r: AccountRequest) => roleLabels[r.requestedRole] || r.requestedRole,
    },
    { key: 'reason', header: 'Motivo' },
    {
      key: 'attachment',
      header: 'Archivo',
      render: (r: AccountRequest) =>
        r.attachmentUrl ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewUrl(r.attachmentUrl)}
              className="inline-flex items-center gap-1 text-sm text-cara-600 hover:underline"
            >
              <Eye className="h-3 w-3" />
              Ver
            </button>
            <a
              href={r.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cara-400 hover:text-cara-600"
              title="Abrir en nueva pestaña"
            >
              ↗
            </a>
          </div>
        ) : (
          <span className="text-xs text-cara-400">—</span>
        ),
    },
    {
      key: 'requestedAt',
      header: 'Solicitado',
      render: (r: AccountRequest) => new Date(r.requestedAt).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r: AccountRequest) => {
        if (r.isRejected) return <Badge status="Rejected" />;
        if (r.isApproved) return <Badge status="ApprovedRequest" />;
        return <Badge status="Pending" />;
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (r: AccountRequest) => (
        <div className="flex items-center gap-2">
          {!r.isApproved && !r.isRejected && (
            <>
              <Button size="sm" onClick={() => approveMutation.mutate(r.id)} isLoading={approveMutation.isPending}>
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => { setRejectModal({ id: r.id, open: true }); setRejectReason(''); }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rechazar
              </Button>
            </>
          )}
          {r.isApproved && !r.notified && (
            <Button size="sm" variant="secondary" onClick={() => notifyMutation.mutate(r.id)} isLoading={notifyMutation.isPending}>
              Notificar
            </Button>
          )}
          {r.isApproved && r.notified && (
            <span className="text-xs text-cara-500">Notificado</span>
          )}
          {r.isRejected && (
            <span className="text-xs text-danger" title={r.rejectionReason ?? ''}>Rechazado</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cara-900">Solicitudes de Alta</h1>
        <p className="text-sm text-cara-500 mt-1">Revisá y aprobá las solicitudes de nuevos usuarios</p>
      </div>

      <div className="card-surface overflow-hidden">
        <Table
          columns={columns}
          data={requests ?? []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No hay solicitudes pendientes"
        />
      </div>

      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ id: '', open: false })} title="Rechazar solicitud">
        <div className="space-y-4">
          <p className="text-sm text-cara-600">Motivo del rechazo:</p>
          <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Indicá el motivo..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRejectModal({ id: '', open: false })}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
              isLoading={rejectMutation.isPending}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(null)} title="Archivo adjunto" size="lg">
        {previewUrl && (
          <div className="flex justify-center">
            {previewUrl.match(/\.(jpg|jpeg|png)$/i) ? (
              <img src={previewUrl} alt="Adjunto" className="max-h-[70vh] w-full rounded-lg object-contain" />
            ) : (
              <iframe src={previewUrl} className="h-[70vh] w-full rounded-lg border" title="Archivo" />
            )}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <a
            href={previewUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cara-600 hover:underline"
          >
            Abrir en nueva pestaña ↗
          </a>
        </div>
      </Modal>
    </div>
  );
}
