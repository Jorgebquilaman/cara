import clsx from 'clsx';
import { AssetStatus, LoanStatus } from '@/types';

interface BadgeProps {
  status: AssetStatus | LoanStatus | string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  Available: 'bg-cara-100 text-cara-800 dark:bg-cara-900/40 dark:text-cara-300',
  InUse: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Decommissioned: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  Active: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  Returned: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  ApprovedRequest: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  LoanOverdue: 'bg-red-600 text-white',
  LoanApproved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  LoanRejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  LoanDueReminder: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  SanctionIssued: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  ReservationCreated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  ReservationConfirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  ReservationCancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  IncidentReported: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  LoanReturned: 'bg-green-600 text-white',
  AccountRequestCreated: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
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
        statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
