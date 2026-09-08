import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { DashboardData, Loan, Reservation, UserDashboardData } from '@/types';
import {
  Package, BookOpen, AlertTriangle, Clock, CalendarDays, CalendarPlus,
  BarChart3, RotateCcw, Hourglass, CheckCircle, Users, Search,
  MessageSquare, ShieldAlert,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
} from 'recharts';

const HOY = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

/* Paleta verde monocromática (inspiración dashboard inmobiliario) */
const GREEN_DARK = '#14482f';
const GREEN_MED = '#2E8B57';
const GREEN_LIGHT = '#8dd4ab';
const GREEN_LIGHTER = '#cfe8d8';

const AXIS_TICK = { fill: '#6B7280', fontSize: 12 };

/* ---------- KPI estilo imagen: chip circular + número + label upper ---------- */
function KpiCard({ value, label, icon: Icon, chipClass }: { value: number; label: string; icon: any; chipClass: string }) {
  return (
    <div className="card-surface p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
      <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm ${chipClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </div>
  );
}

/* ---------- Título de sección estilo imagen ---------- */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{children}</h3>
  );
}

/* ---------- Panel de barras horizontales (como "Furnishing Status") ---------- */
function BarList({ items, total }: { items: { label: string; count: number; color: string; icon: any }[]; total: number }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-cara-50 dark:bg-neutral-800 flex items-center justify-center">
            <item.icon className="h-4 w-4 text-cara-700 dark:text-cara-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{item.label}</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-50 tabular-nums">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${total > 0 ? Math.round((item.count / total) * 100) : 0}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-50">Total</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-50 tabular-nums">{total}</span>
      </div>
    </div>
  );
}

/* ---------- Donut con leyenda (como "Status of Number of Story Building") ---------- */
function DonutChart({ title, data, footer }: { title: string; data: { name: string; value: number; color: string }[]; footer?: string }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const filtered = data.filter((d) => d.value > 0);
  return (
    <div className="card-surface p-5">
      <SectionTitle>{title}</SectionTitle>
      {total === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-10 text-center">Sin datos</p>
      ) : (
        <>
          <div className="h-52 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="value"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                  label={({ percent }: any) => `${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {filtered.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [v, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 mt-2">
            {data.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                <span className="ml-auto font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {d.value} {total > 0 && `(${Math.round((d.value / total) * 100)}%)`}
                </span>
              </li>
            ))}
          </ul>
          {footer && <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">{footer}</p>}
        </>
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

  /* ================= ADMIN / STAFF ================= */
  if (isAdminOrStaff) {
    const reservasData = [
      { name: 'Confirmadas', value: dashboard?.confirmedReservations ?? 0 },
      { name: 'Pendientes', value: dashboard?.pendingReservations ?? 0 },
      { name: 'Completadas', value: dashboard?.completedReservations ?? 0 },
      { name: 'Canceladas', value: dashboard?.cancelledReservations ?? 0 },
    ];
    const reservasColors = [GREEN_DARK, GREEN_MED, GREEN_LIGHT, GREEN_LIGHTER];
    const totalReservas = reservasData.reduce((a, d) => a + d.value, 0);

    const prestamosData = [
      { name: 'Activos', value: dashboard?.activeLoans ?? 0, color: GREEN_DARK },
      { name: 'Vencidos', value: dashboard?.overdueLoans ?? 0, color: '#c04646' },
      { name: 'Por aprobar', value: dashboard?.pendingApprovals ?? 0, color: GREEN_LIGHT },
    ];
    const disponibles = dashboard?.availableAssets ?? 0;
    const activosData = [
      { name: 'Disponibles', value: disponibles, color: GREEN_DARK },
      { name: 'En uso / Otros', value: Math.max(0, (dashboard?.totalAssets ?? 0) - disponibles), color: GREEN_LIGHT },
    ];

    const barData = reservasData.map((d, i) => ({ ...d, fill: reservasColors[i] }));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Panel de Control</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{HOY}</p>
        </div>

        {/* KPIs principales */}
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard value={dashboard?.totalAssets ?? 0} label="Activos Totales" icon={Package} chipClass="bg-gradient-to-br from-cara-800 to-cara-900" />
          <KpiCard value={dashboard?.activeLoans ?? 0} label="Préstamos Activos" icon={BookOpen} chipClass="bg-gradient-to-br from-cara-600 to-cara-800" />
          <KpiCard value={dashboard?.overdueLoans ?? 0} label="Vencidos" icon={AlertTriangle} chipClass="bg-gradient-to-br from-red-600 to-red-800" />
          <KpiCard value={(dashboard?.pendingApprovals ?? 0) + (dashboard?.pendingReservations ?? 0)} label="Pendientes" icon={Clock} chipClass="bg-gradient-to-br from-cara-500 to-cara-700" />
          <KpiCard value={dashboard?.totalReservations ?? 0} label="Reservas Totales" icon={CalendarDays} chipClass="bg-gradient-to-br from-cara-400 to-cara-600" />
        </div>

        {/* KPIs secundarios */}
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard value={dashboard?.totalUsers ?? 0} label="Usuarios" icon={Users} chipClass="bg-gradient-to-br from-blue-600 to-blue-800" />
          <KpiCard value={dashboard?.activeSanctions ?? 0} label="Sanciones Activas" icon={ShieldAlert} chipClass="bg-gradient-to-br from-rose-600 to-rose-800" />
          <KpiCard value={dashboard?.surveysCompleted ?? 0} label="Encuestas" icon={MessageSquare} chipClass="bg-gradient-to-br from-teal-600 to-teal-800" />
        </div>

        {/* Gráficos fila 1: barras + detalle */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card-surface p-5 lg:col-span-2">
            <SectionTitle>Reservas por Estado</SectionTitle>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
                  <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(46,139,87,0.08)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={72}>
                    <LabelList dataKey="value" position="top" style={{ fill: '#374151', fontSize: 12, fontWeight: 700 }} />
                    {barData.map((d) => <Cell key={d.name} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-5">
            <SectionTitle>Detalle de Reservas</SectionTitle>
            <div className="mt-4">
              <BarList
                total={totalReservas}
                items={[
                  { label: 'Confirmadas', count: dashboard?.confirmedReservations ?? 0, color: GREEN_DARK, icon: CheckCircle },
                  { label: 'Pendientes', count: dashboard?.pendingReservations ?? 0, color: GREEN_MED, icon: Hourglass },
                  { label: 'Completadas', count: dashboard?.completedReservations ?? 0, color: GREEN_LIGHT, icon: CheckCircle },
                  { label: 'Canceladas', count: dashboard?.cancelledReservations ?? 0, color: GREEN_LIGHTER, icon: RotateCcw },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Gráficos fila 2: donuts + listas */}
        <div className="grid gap-4 lg:grid-cols-3">
          <DonutChart title="Estado de Préstamos" data={prestamosData} />
          <DonutChart title="Disponibilidad de Activos" data={activosData} footer={`Total activos: ${dashboard?.totalAssets ?? 0}`} />

          <div className="space-y-4">
            <div className="card-surface p-5">
              <SectionTitle>Próximos a Vencer · 24hs</SectionTitle>
              <div className="mt-3 space-y-2">
                {dashboard?.upcomingDueLoans?.length ? (
                  dashboard.upcomingDueLoans.slice(0, 4).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-2.5 bg-cara-50 dark:bg-neutral-800 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{loan.assetName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">{new Date(loan.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Sin préstamos próximos.</p>}
              </div>
            </div>

            <div className="card-surface p-5">
              <SectionTitle>Vencidos</SectionTitle>
              <div className="mt-3 space-y-2">
                {dashboard?.overdueLoansList?.length ? (
                  dashboard.overdueLoansList.slice(0, 4).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 truncate">{loan.assetName}</p>
                        <p className="text-xs text-red-500 dark:text-red-400">{loan.userName}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0 ml-2">{new Date(loan.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))
                ) : <p className="text-sm text-gray-400 dark:text-gray-500 py-2">Todo al día.</p>}
              </div>
            </div>
          </div>
        </div>

        <Card title="Reservas Recientes">
          <Table
            columns={[
              { key: 'space', header: 'Espacio' },
              { key: 'assetName', header: 'Activo' },
              { key: 'userName', header: 'Usuario' },
              { key: 'startDate', header: 'Inicio', render: (r: Reservation) => new Date(r.startDate).toLocaleDateString() },
              { key: 'endDate', header: 'Fin', render: (r: Reservation) => new Date(r.endDate).toLocaleDateString() },
              { key: 'status', header: 'Estado', render: (r: Reservation) => <Badge status={r.status} /> },
            ]}
            data={dashboard?.recentReservations ?? []}
            keyExtractor={(r: Reservation) => r.id}
          />
        </Card>
      </div>
    );
  }

  /* ================= ESTUDIANTE / DOCENTE ================= */
  const misPrestamosData = [
    { name: 'Activos', value: myStats?.activeLoans ?? 0, color: GREEN_DARK },
    { name: 'Devueltos', value: myStats?.returnedLoans ?? 0, color: GREEN_MED },
    { name: 'Pendientes', value: myStats?.pendingLoans ?? 0, color: GREEN_LIGHT },
    { name: 'Vencidos', value: myStats?.overdueLoans ?? 0, color: '#c04646' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">Hola, {user?.firstName}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{HOY}</p>
      </div>

      {/* Banner destacado */}
      <div className="rounded-2xl bg-gradient-to-r from-cara-700 to-cara-500 text-white p-6 md:p-8 relative overflow-hidden shadow-card">
        <div className="absolute -right-8 -top-8 opacity-10">
          <Package className="h-44 w-44" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold">Reservá espacios y equipamiento</h2>
        <p className="text-cara-100 mt-1 text-sm md:text-base max-w-lg">
          Seguimiento en tiempo real de tus préstamos. Solicitá, reservá y hacé seguimiento fácilmente.
        </p>
        <button
          className="mt-4 rounded-full bg-white py-2.5 px-5 text-sm font-bold text-cara-700 transition-all hover:bg-cara-50 hover:scale-[1.02]"
          onClick={() => { window.location.href = '/reservations'; }}
        >
          <CalendarPlus className="h-4 w-4 inline mr-2 -mt-0.5" />
          Nueva reserva
        </button>
      </div>

      {/* KPIs personales */}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard value={myStats?.totalLoans ?? 0} label="Solicitados" icon={BarChart3} chipClass="bg-gradient-to-br from-blue-600 to-blue-800" />
        <KpiCard value={myStats?.activeLoans ?? 0} label="Activos" icon={BookOpen} chipClass="bg-gradient-to-br from-cara-800 to-cara-900" />
        <KpiCard value={myStats?.returnedLoans ?? 0} label="Devueltos" icon={RotateCcw} chipClass="bg-gradient-to-br from-cara-600 to-cara-800" />
        <KpiCard value={(myStats?.pendingLoans ?? 0) + (myStats?.pendingReservations ?? 0)} label="Pendientes" icon={Hourglass} chipClass="bg-gradient-to-br from-cara-500 to-cara-700" />
        <KpiCard value={myStats?.overdueLoans ?? 0} label="Vencidos" icon={AlertTriangle} chipClass="bg-gradient-to-br from-red-600 to-red-800" />
      </div>

      {/* Donut + tabla */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DonutChart title="Mis Préstamos" data={misPrestamosData} footer="Estado de tus solicitudes" />

        <Card title="Préstamos Recientes" className="lg:col-span-2">
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
    </div>
  );
}
