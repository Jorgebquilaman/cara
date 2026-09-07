import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { DashboardData, Loan, Reservation, UserDashboardData } from '@/types';
import {
  Package, BookOpen, AlertTriangle, Clock, CheckCircle,
  BarChart3, RotateCcw, Hourglass, TrendingUp, CalendarPlus, Users,
  MessageSquare, ShieldAlert, Search,
} from 'lucide-react';

const HOY = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

/* Textura de puntos sutil para fondos */
const DOT_PATTERN = "bg-[radial-gradient(circle,color-mix(in_srgb,currentColor_14%,transparent)_1px,transparent_1px)] [background-size:14px_14px]";

interface Stat {
  label: string;
  value: number;
  icon: any;
  chip: string;          // gradiente del ícono
  accentColor?: string;  // barra lateral
  subtitle?: string;     // texto secundario bajo el valor
  progress?: number;     // 0-100 barra de progreso
}

function StatCard({ label, value, icon: Icon, chip, accentColor, subtitle, progress }: Stat) {
  return (
    <div className="card-surface p-5 hover:shadow-card-hover transition-all relative overflow-hidden group">
      {/* barra de acento */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor || 'bg-cara-500'}`} />
      {/* blob decorativo */}
      <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-[0.07] bg-current ${chip.split(' ').find(c => c.startsWith('text-')) || 'text-cara-600'} transition-transform group-hover:scale-110`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tabular-nums">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-2.5 bg-gradient-to-br shadow-sm ${chip}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {typeof progress === 'number' && (
        <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cara-500 to-cara-400 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/dashboard');
      return data;
    },
    enabled: isAdminOrStaff,
  });

  const { data: myStats } = useQuery({
    queryKey: ['dashboard', 'user', user?.id],
    queryFn: async () => {
      const { data } = await api.get<UserDashboardData>('/dashboard/user');
      return data;
    },
    enabled: !isAdminOrStaff && !!user?.id,
  });

  if (isAdminOrStaff) {
    const availability = dashboard && dashboard.totalAssets > 0
      ? Math.round((dashboard.availableAssets / dashboard.totalAssets) * 100)
      : 0;

    const mainStats: Stat[] = [
      {
        label: 'Activos Totales', value: dashboard?.totalAssets ?? 0, icon: Package,
        chip: 'from-cara-500 to-cara-700', accentColor: 'bg-cara-500',
        subtitle: `${dashboard?.availableAssets ?? 0} disponibles (${availability}%)`, progress: availability,
      },
      {
        label: 'Préstamos Activos', value: dashboard?.activeLoans ?? 0, icon: BookOpen,
        chip: 'from-amber-500 to-amber-600', accentColor: 'bg-amber-500',
        subtitle: `${dashboard?.upcomingDueCount ?? 0} vencen en 24hs`,
      },
      {
        label: 'Vencidos', value: dashboard?.overdueLoans ?? 0, icon: AlertTriangle,
        chip: 'from-red-500 to-red-600', accentColor: 'bg-red-500',
        subtitle: 'requieren atención',
      },
      {
        label: 'Pendientes', value: (dashboard?.pendingApprovals ?? 0) + (dashboard?.pendingReservations ?? 0), icon: Clock,
        chip: 'from-purple-500 to-purple-600', accentColor: 'bg-purple-500',
        subtitle: `${dashboard?.pendingApprovals ?? 0} préstamos · ${dashboard?.pendingReservations ?? 0} reservas`,
      },
    ];

    const secondaryStats: Stat[] = [
      {
        label: 'Usuarios', value: dashboard?.totalUsers ?? 0, icon: Users,
        chip: 'from-blue-500 to-blue-600', accentColor: 'bg-blue-500',
      },
      {
        label: 'Sanciones Activas', value: dashboard?.activeSanctions ?? 0, icon: ShieldAlert,
        chip: 'from-rose-500 to-rose-600', accentColor: 'bg-rose-500',
      },
      {
        label: 'Encuestas Completadas', value: dashboard?.surveysCompleted ?? 0, icon: MessageSquare,
        chip: 'from-teal-500 to-teal-600', accentColor: 'bg-teal-500',
      },
      {
        label: 'Reservas Totales', value: dashboard?.totalReservations ?? 0, icon: TrendingUp,
        chip: 'from-cyan-500 to-cyan-600', accentColor: 'bg-cyan-500',
      },
    ];

    const adminReservationStats: Stat[] = [
      { label: 'Confirmadas', value: dashboard?.confirmedReservations ?? 0, icon: CheckCircle, chip: 'from-cara-500 to-cara-600', accentColor: 'bg-cara-500' },
      { label: 'Pendientes', value: dashboard?.pendingReservations ?? 0, icon: Hourglass, chip: 'from-amber-500 to-amber-600', accentColor: 'bg-amber-500' },
      { label: 'Completadas', value: dashboard?.completedReservations ?? 0, icon: TrendingUp, chip: 'from-blue-500 to-blue-600', accentColor: 'bg-blue-500' },
      { label: 'Canceladas', value: dashboard?.cancelledReservations ?? 0, icon: RotateCcw, chip: 'from-gray-400 to-gray-500', accentColor: 'bg-gray-400' },
    ];

    const adminReservationColumns = [
      { key: 'space', header: 'Espacio' },
      { key: 'assetName', header: 'Activo' },
      { key: 'userName', header: 'Usuario' },
      {
        key: 'startDate',
        header: 'Inicio',
        render: (r: Reservation) => new Date(r.startDate).toLocaleDateString(),
      },
      {
        key: 'endDate',
        header: 'Fin',
        render: (r: Reservation) => new Date(r.endDate).toLocaleDateString(),
      },
      { key: 'status', header: 'Estado', render: (r: Reservation) => <Badge status={r.status} /> },
    ];

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Panel de Control</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{HOY} · Resumen general de actividad y gestión.</p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {mainStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {secondaryStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card title="Próximos a Vencer" subtitle="Próximas 24 horas">
            {dashboard?.upcomingDueLoans?.length ? (
              <ul className="space-y-3">
                {dashboard.upcomingDueLoans.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{loan.assetName}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500">Sin préstamos próximos.</p>}
          </Card>

          <Card title="Vencidos">
            {dashboard?.overdueLoansList?.length ? (
              <ul className="space-y-3">
                {dashboard.overdueLoansList.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-sm">
                      <span className="font-semibold text-red-700 dark:text-red-300 block">{loan.assetName}</span>
                      <span className="text-red-500 dark:text-red-400">{loan.userName}</span>
                    </div>
                    <span className="text-sm text-red-600 dark:text-red-400 font-bold">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500">Todo al día.</p>}
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Gestión de Reservas</h3>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-4">
            {adminReservationStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </div>
        </div>

        <Card title="Reservas Recientes">
          <Table
            columns={adminReservationColumns}
            data={dashboard?.recentReservations ?? []}
            keyExtractor={(r: Reservation) => r.id}
          />
        </Card>
      </div>
    );
  }

  const userStats: Stat[] = [
    {
      label: 'Solicitados', value: myStats?.totalLoans ?? 0, icon: BarChart3,
      chip: 'from-blue-500 to-blue-600', accentColor: 'bg-blue-500',
    },
    {
      label: 'Activos', value: myStats?.activeLoans ?? 0, icon: BookOpen,
      chip: 'from-amber-500 to-amber-600', accentColor: 'bg-amber-500',
    },
    {
      label: 'Devueltos', value: myStats?.returnedLoans ?? 0, icon: RotateCcw,
      chip: 'from-cara-500 to-cara-700', accentColor: 'bg-cara-500',
    },
    {
      label: 'Pendientes', value: (myStats?.pendingLoans ?? 0) + (myStats?.pendingReservations ?? 0), icon: Hourglass,
      chip: 'from-purple-500 to-purple-600', accentColor: 'bg-purple-500',
    },
    {
      label: 'Vencidos', value: myStats?.overdueLoans ?? 0, icon: AlertTriangle,
      chip: 'from-red-500 to-red-600', accentColor: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Hola, {user?.firstName}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{HOY} · Este es tu panel de actividad.</p>
      </div>

      {/* Banner destacado con textura de puntos */}
      <div className="rounded-2xl bg-gradient-to-r from-cara-700 to-cara-500 text-white p-6 md:p-8 relative overflow-hidden shadow-card">
        <div className={`absolute inset-0 text-white ${DOT_PATTERN}`} />
        <div className="absolute -right-8 -top-8 opacity-10">
          <Package className="h-44 w-44" />
        </div>
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold">Reservá espacios y equipamiento</h2>
          <p className="text-cara-100 mt-1 text-sm md:text-base max-w-lg">
            Seguimiento en tiempo real de tus préstamos. Solicitá, reservá y hacé seguimiento fácilmente.
          </p>
          <Button
            variant="secondary"
            className="mt-4 bg-white text-cara-700 border-0 hover:bg-cara-50"
            onClick={() => { window.location.href = '/reservations'; }}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Nueva reserva
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Mis Préstamos</h3>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {userStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      </div>

      <Card
        title="Préstamos Recientes"
        action={
          <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/my-loans'; }}>
            <Search className="h-4 w-4 mr-1" />
            Ver todos
          </Button>
        }
      >
        <Table
          columns={[
            { key: 'assetCode', header: 'Código' },
            { key: 'assetName', header: 'Activo' },
            { key: 'startDate', header: 'Inicio', render: (l: Loan) => new Date(l.startDate).toLocaleDateString() },
            { key: 'dueDate', header: 'Vencimiento', render: (l: Loan) => new Date(l.dueDate).toLocaleDateString() },
            { key: 'status', header: 'Estado', render: (l: Loan) => <Badge status={l.status} /> },
          ]}
          data={myStats?.recentLoans ?? []}
          keyExtractor={(l) => l.id}
        />
      </Card>
    </div>
  );
}
