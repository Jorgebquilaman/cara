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

  const StatCard = ({ label, value, icon: Icon, color, accentColor }: { label: string, value: number, icon: any, color: string, accentColor?: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor || 'bg-transparent'}`} />
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );

  if (isAdminOrStaff) {
    const adminStats = [
      { label: 'Préstamos Activos', value: dashboard?.activeLoans ?? 0, icon: BookOpen, color: 'text-amber-600 bg-amber-50', accentColor: 'bg-amber-500' },
      { label: 'Vencidos', value: dashboard?.overdueLoans ?? 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50', accentColor: 'bg-red-500' },
      { label: 'Pendientes', value: (dashboard?.pendingApprovals ?? 0) + (dashboard?.pendingReservations ?? 0), icon: Clock, color: 'text-purple-600 bg-purple-50', accentColor: 'bg-purple-500' },
    ];

    const adminReservationStats = [
      { label: 'Total', value: dashboard?.totalReservations ?? 0, icon: Clock, color: 'text-cyan-600 bg-cyan-50', accentColor: 'bg-cyan-500' },
      { label: 'Confirmadas', value: dashboard?.confirmedReservations ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50', accentColor: 'bg-green-500' },
      { label: 'Completadas', value: dashboard?.completedReservations ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-50', accentColor: 'bg-blue-500' },
      { label: 'Canceladas', value: dashboard?.cancelledReservations ?? 0, icon: RotateCcw, color: 'text-gray-600 bg-gray-50', accentColor: 'bg-gray-400' },
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
          <h1 className="text-3xl font-extrabold text-gray-900">Panel de Control</h1>
          <p className="text-gray-500 mt-1">Resumen general de actividad y gestión.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {adminStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Próximos a Vencer" subtitle="Próximas 24 horas">
            {dashboard?.upcomingDueLoans?.length ? (
              <ul className="space-y-4">
                {dashboard.upcomingDueLoans.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{loan.assetName}</span>
                    <span className="text-sm text-gray-500">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400">Sin préstamos próximos.</p>}
          </Card>

          <Card title="Vencidos">
            {dashboard?.overdueLoansList?.length ? (
              <ul className="space-y-4">
                {dashboard.overdueLoansList.slice(0, 5).map((loan) => (
                  <li key={loan.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-semibold text-red-700 block">{loan.assetName}</span>
                      <span className="text-red-500">{loan.userName}</span>
                    </div>
                    <span className="text-sm text-red-600 font-bold">{new Date(loan.dueDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-400">Todo al día.</p>}
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Gestión de Reservas</h3>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

  const userStats = [
    { label: 'Solicitados', value: myStats?.totalLoans ?? 0, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Activos', value: myStats?.activeLoans ?? 0, icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
    { label: 'Devueltos', value: myStats?.returnedLoans ?? 0, icon: RotateCcw, color: 'text-green-600 bg-green-50' },
    { label: 'Pendientes', value: (myStats?.pendingLoans ?? 0) + (myStats?.pendingReservations ?? 0), icon: Hourglass, color: 'text-purple-600 bg-purple-50' },
    { label: 'Vencidos', value: myStats?.overdueLoans ?? 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Hola, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1">Este es tu panel de actividad.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Mis Préstamos</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {userStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      </div>

      <Card title="Préstamos Recientes">
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
