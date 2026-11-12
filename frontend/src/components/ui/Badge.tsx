import clsx from 'clsx';
import { AssetStatus, LoanStatus } from '@/types';

interface BadgeProps {
  status: AssetStatus | LoanStatus | string;
  size?: 'sm' | 'md';
}

/* Chips Calm Kit: fondo mist + texto ink; estados semánticos con tintes suaves */
const statusStyles: Record<string, string> = {
  Available: 'bg-mist text-sage',
  InUse: 'bg-[var(--ivory)] text-ink',
  Maintenance: 'bg-[var(--ivory)] text-ink-muted',
  Decommissioned: 'bg-[var(--ivory)] text-ink-muted',
  Pending: 'bg-[var(--ivory)] text-ink-muted',
  Active: 'bg-mist text-ink',
  Overdue: 'bg-danger/15 text-danger',
  Returned: 'bg-mist text-sage',
  Rejected: 'bg-danger/15 text-danger',
  ApprovedRequest: 'bg-mist text-sage',
  Confirmed: 'bg-info/15 text-info',
  Cancelled: 'bg-[var(--ivory)] text-ink-muted',
  Completed: 'bg-mist text-sage',
  LoanOverdue: 'bg-danger text-ivory',
  LoanApproved: 'bg-mist text-sage',
  LoanRejected: 'bg-danger/15 text-danger',
  LoanDueReminder: 'bg-warning/15 text-warning',
  SanctionIssued: 'bg-danger/15 text-danger',
  ReservationCreated: 'bg-info/15 text-info',
  ReservationConfirmed: 'bg-mist text-sage',
  ReservationCancelled: 'bg-[var(--ivory)] text-ink-muted',
  IncidentReported: 'bg-warning/15 text-warning',
  LoanReturned: 'bg-sage text-ivory',
  AccountRequestCreated: 'bg-info/15 text-info',
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
        'inline-flex items-center rounded-full font-medium',
        statusStyles[status] || 'bg-[var(--ivory)] text-ink-muted',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
