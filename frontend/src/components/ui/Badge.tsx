import clsx from 'clsx';
import { AssetStatus, LoanStatus } from '@/types';

interface BadgeProps {
  status: AssetStatus | LoanStatus | string;
  size?: 'sm' | 'md';
}

/* Chips del styleguide: pill radius-full. Estados semánticos usan tinte
   claro + texto del color semántico; el resto gris claro + texto oscuro. */
const statusStyles: Record<string, string> = {
  Available: 'bg-success/10 text-success dark:bg-success/25',
  InUse: 'bg-warning/15 text-gray-800 dark:bg-warning/25 dark:text-warning',
  Maintenance: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Decommissioned: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  Pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Active: 'bg-warning/15 text-gray-800 dark:bg-warning/25 dark:text-warning',
  Overdue: 'bg-danger/10 text-danger dark:bg-danger/25',
  Returned: 'bg-success/10 text-success dark:bg-success/25',
  Rejected: 'bg-danger/10 text-danger dark:bg-danger/25',
  ApprovedRequest: 'bg-success/10 text-success dark:bg-success/25',
  Confirmed: 'bg-info/10 text-info dark:bg-info/25',
  Cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  Completed: 'bg-success/10 text-success dark:bg-success/25',
  LoanOverdue: 'bg-danger text-white',
  LoanApproved: 'bg-success/10 text-success dark:bg-success/25',
  LoanRejected: 'bg-danger/10 text-danger dark:bg-danger/25',
  LoanDueReminder: 'bg-warning/15 text-gray-800 dark:bg-warning/25 dark:text-warning',
  SanctionIssued: 'bg-danger/10 text-danger dark:bg-danger/25',
  ReservationCreated: 'bg-info/10 text-info dark:bg-info/25',
  ReservationConfirmed: 'bg-success/10 text-success dark:bg-success/25',
  ReservationCancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  IncidentReported: 'bg-warning/15 text-gray-800 dark:bg-warning/25 dark:text-warning',
  LoanReturned: 'bg-success text-white',
  AccountRequestCreated: 'bg-info/10 text-info dark:bg-info/25',
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
        statusStyles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
