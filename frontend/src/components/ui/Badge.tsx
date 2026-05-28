import clsx from 'clsx';
import { AssetStatus, LoanStatus } from '@/types';

interface BadgeProps {
  status: AssetStatus | LoanStatus | string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  Available: 'bg-green-100 text-green-800',
  InUse: 'bg-amber-100 text-amber-800',
  Maintenance: 'bg-gray-100 text-gray-800',
  Decommissioned: 'bg-gray-100 text-gray-500',
  Pending: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-amber-100 text-amber-800',
  Overdue: 'bg-red-100 text-red-800',
  Returned: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  ApprovedRequest: 'bg-green-100 text-green-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-gray-100 text-gray-600',
  Completed: 'bg-green-100 text-green-800',
  LoanOverdue: 'bg-red-600 text-white',
  LoanApproved: 'bg-green-100 text-green-800',
  LoanRejected: 'bg-red-100 text-red-800',
  LoanDueReminder: 'bg-amber-100 text-amber-800',
  SanctionIssued: 'bg-red-100 text-red-800',
  ReservationCreated: 'bg-blue-100 text-blue-800',
  ReservationConfirmed: 'bg-green-100 text-green-800',
  ReservationCancelled: 'bg-gray-100 text-gray-600',
  IncidentReported: 'bg-orange-100 text-orange-800',
  LoanReturned: 'bg-green-600 text-white',
  AccountRequestCreated: 'bg-purple-100 text-purple-800',
};

const statusLabels: Record<string, string> = {
  Available: 'Disponible',
  InUse: 'En Uso',
  Maintenance: 'Mantenimiento',
  Decommissioned: 'De Baja',
  Pending: 'Pendiente',
  Approved: 'Aprobado (Listo para retirar)',
  Active: 'Activo (En poder del usuario)',
  Overdue: 'Vencido',
  Returned: 'Devuelto',
  Rejected: 'Rechazado',
  ApprovedRequest: 'Aprobado',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  Completed: 'Completada',
  LoanOverdue: 'Vencido',
  LoanApproved: 'Aprobado',
  LoanRejected: 'Rechazado',
  LoanDueReminder: 'Recordatorio',
  SanctionIssued: 'Sanción',
  ReservationCreated: 'Creada',
  ReservationConfirmed: 'Confirmada',
  ReservationCancelled: 'Cancelada',
  IncidentReported: 'Incidente',
  LoanReturned: 'Devuelto',
  AccountRequestCreated: 'Solicitud Alta',
};

export function Badge({ status, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold',
        statusStyles[status] || 'bg-gray-100 text-gray-800',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
