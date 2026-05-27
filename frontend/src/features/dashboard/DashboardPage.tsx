import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { DashboardData, Loan, Reservation, UserDashboardData } from '@/types';
import {
  Package, BookOpen, AlertTriangle, Clock, CheckCircle,
  BarChart3, RotateCcw, Hourglass, TrendingUp
} from 'lucide-react';

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
    const activeLoansCount = dashboard?.activeLoans ?? 0;
    const overdueLoansCount = dashboard?.overdueLoans ?? 0;
    const pendingApprovals = dashboard?.pendingApprovals ?? 0;
    const upcomingDueLoans = dashboard?.upcomingDueLoans ?? [];
    const overdueLoansList = dashboard?.overdueLoansList ?? [];

    const adminStats = [
      { label: 'Préstamos Activos', value: activeLoansCount, icon: BookOpen, color: 'text-amber-600 bg-amber-100' },
      { label: 'Vencidos', value: overdueLoansCount, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
      { label: 'Pendientes', value: pendingApprovals, icon: Clock, color: 'text-purple-600 bg-purple-100' },
    ];

    const adminReservationStats = [
      { label: 'Reservas', value: dashboard?.totalReservations ?? 0, icon: Clock, color: 'text-cyan-600 bg-cyan-100' },
      { label: 'Confirmadas', value: dashboard?.confirmedReservations ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      { label: 'Completadas', value: dashboard?.completedReservations ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
      { label: 'Canceladas', value: dashboard?.cancelledReservations ?? 0, icon: RotateCcw, color: 'text-gray-600 bg-gray-100' },
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Dashboard</h1>
          <p className="text-cara-500 mt-1">Bienvenido, {user?.firstName}. Panel de administración</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminStats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cara-900">{stat.value}</p>
                  <p className="text-xs text-cara-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Préstamos por Vencer" subtitle="Próximas 24 horas">
            {upcomingDueLoans.length > 0 ? (
              <ul className="space-y-3">
                {upcomingDueLoans.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between text-sm">
                    <span className="text-cara-700">{loan.assetName}</span>
                    <span className="text-cara-500">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-cara-500">No hay préstamos próximos a vencer</p>
            )}
          </Card>

          <Card title="Vencidos">
            {overdueLoansList.length > 0 ? (
              <ul className="space-y-3">
                {overdueLoansList.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-cara-700 block">{loan.assetName}</span>
                      <span className="text-cara-500 text-xs">{loan.userName}</span>
                    </div>
                    <span className="text-cara-500">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-cara-500">No hay préstamos vencidos</p>
            )}
          </Card>

          <Card title="Aprobaciones Pendientes">
            {pendingApprovals > 0 ? (
              <p className="text-sm text-cara-500">Hay {pendingApprovals} solicitudes pendientes de aprobación</p>
            ) : (
              <p className="text-sm text-cara-500">No hay solicitudes pendientes</p>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-cara-600 uppercase tracking-wider mb-3">Reservas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminReservationStats.map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cara-900">{stat.value}</p>
                    <p className="text-xs text-cara-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card title="Reservas Recientes">
          <Table
            columns={adminReservationColumns}
            data={dashboard?.recentReservations ?? []}
            keyExtractor={(r: Reservation) => r.id}
            emptyMessage="No hay reservas registradas"
          />
        </Card>
      </div>
    );
  }

  const userStats = [
    { label: 'Total solicitados', value: myStats?.totalLoans ?? 0, icon: BarChart3, color: 'text-blue-600 bg-blue-100' },
    { label: 'Activos', value: myStats?.activeLoans ?? 0, icon: BookOpen, color: 'text-amber-600 bg-amber-100' },
    { label: 'Devueltos', value: myStats?.returnedLoans ?? 0, icon: RotateCcw, color: 'text-green-600 bg-green-100' },
    { label: 'Pendientes', value: myStats?.pendingLoans ?? 0, icon: Hourglass, color: 'text-purple-600 bg-purple-100' },
    { label: 'Vencidos', value: myStats?.overdueLoans ?? 0, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
  ];

  const reservationStats = [
    { label: 'Reservas', value: myStats?.totalReservations ?? 0, icon: Clock, color: 'text-cyan-600 bg-cyan-100' },
    { label: 'Confirmadas', value: myStats?.confirmedReservations ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { label: 'Completadas', value: myStats?.completedReservations ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
    { label: 'Canceladas', value: myStats?.cancelledReservations ?? 0, icon: RotateCcw, color: 'text-gray-600 bg-gray-100' },
  ];

  const loanColumns = [
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

  const reservationColumns = [
    { key: 'space', header: 'Espacio' },
    { key: 'assetName', header: 'Activo' },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cara-900">Dashboard</h1>
        <p className="text-cara-500 mt-1">Bienvenido, {user?.firstName}. Tus estadísticas</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-cara-600 uppercase tracking-wider mb-3">Préstamos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {userStats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cara-900">{stat.value}</p>
                  <p className="text-xs text-cara-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card title="Préstamos Recientes">
        <Table
          columns={loanColumns}
          data={myStats?.recentLoans ?? []}
          keyExtractor={(l) => l.id}
          emptyMessage="No tenés préstamos registrados"
        />
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-cara-600 uppercase tracking-wider mb-3">Reservas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reservationStats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cara-900">{stat.value}</p>
                  <p className="text-xs text-cara-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card title="Reservas Recientes">
        <Table
          columns={reservationColumns}
          data={myStats?.recentReservations ?? []}
          keyExtractor={(r) => r.id}
          emptyMessage="No tenés reservas registradas"
        />
      </Card>
    </div>
  );
}
