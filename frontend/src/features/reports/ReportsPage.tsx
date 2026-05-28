import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { FileText, Download, Search, Users, Package, BookOpen, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import ReactStars from 'react-stars';
import clsx from 'clsx';

interface UserHistory {
  id: string; fullName: string; institutionalEmail: string; role: string; isActive: boolean;
  loans: any[]; incidents: any[]; sanctions: any[];
}

interface ReportStats {
    kpIs: { totalAssets: number; activeLoans: number; totalUsers: number; totalSurveys: number; avgOverallRating: number; avgServiceRating: number; avgRequestTimeRating: number; avgAssetQualityRating: number };
    mostRequested: { name: string; count: number }[];
    departmentStats: { department: string; count: number }[];
    careerStats: { career: string; count: number }[];
    usageTime: { asset: string; averageHours: number }[];
    surveyByAsset: { asset: string; count: number; avgRating: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const reports = [
  { title: 'Préstamos Activos', description: 'Listado de todos los préstamos actualmente activos', endpoint: 'loans/csv', filename: 'prestamos-activos.csv' },
  { title: 'Activos por Categoría', description: 'Inventario de activos agrupados por categoría', endpoint: 'assets/by-category/csv', filename: 'activos-por-categoria.csv' },
  { title: 'Usuarios con Sanciones', description: 'Usuarios que poseen sanciones activas', endpoint: 'sanctions/active/csv', filename: 'sanciones-activas.csv' },
  { title: 'Historial de Auditoría', description: 'Registro de cambios en el sistema', endpoint: 'audit/csv', filename: 'auditoria.csv' },
  { title: 'Encuestas de Satisfacción', description: 'Resultados de encuestas completadas por usuarios', endpoint: 'surveys/csv', filename: 'encuestas.csv' },
];

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [activeTab, setActiveTab] = useState<'graphics' | 'csv'>('graphics');

  const { data: stats } = useQuery<ReportStats>({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/statistics');
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data } = await api.get<User[]>('/users');
        return data;
      } catch {
        return [];
      }
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cara-900">Reportes y Estadísticas</h1>
        {isAdmin && (
          <Button variant="secondary" size="sm" onClick={() => setHistoryModalOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Historial de Usuario
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
            {['graphics', 'csv'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'graphics' | 'csv')}
                    className={clsx(
                        "py-3 px-4 border-b-2 font-medium text-sm transition-colors capitalize",
                        activeTab === tab ? "border-cara-600 text-cara-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    {tab === 'graphics' ? 'Estadísticas' : 'Reportes CSV'}
                </button>
            ))}
        </nav>
      </div>

      {activeTab === 'graphics' ? (
        <div className="space-y-8">
            {/* KPI Cards */}
            {stats && stats.kpIs && (
                <div className="grid gap-6 md:grid-cols-4">
                    <StatCard label="Total Activos" value={stats.kpIs.totalAssets} icon={Package} color="text-blue-600 bg-blue-50" />
                    <StatCard label="Préstamos Activos" value={stats.kpIs.activeLoans} icon={BookOpen} color="text-amber-600 bg-amber-50" />
                    <StatCard label="Usuarios Totales" value={stats.kpIs.totalUsers} icon={Users} color="text-green-600 bg-green-50" />
                    <StatCard label="Encuestas Realizadas" value={stats.kpIs.totalSurveys} icon={ThumbsUp} color="text-purple-600 bg-purple-50" />
                </div>
            )}

            {/* Survey KPIs */}
            {stats && stats.kpIs.totalSurveys > 0 && (
              <Card title="Valoraciones de Encuestas">
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'General', value: stats.kpIs.avgOverallRating },
                    { label: 'Atención', value: stats.kpIs.avgServiceRating },
                    { label: 'Tiempo Solicitud', value: stats.kpIs.avgRequestTimeRating },
                    { label: 'Calidad Activo', value: stats.kpIs.avgAssetQualityRating },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl font-bold text-cara-700">{value}</p>
                      <div className="flex justify-center my-1">
                        <ReactStars
                          count={5}
                          value={value}
                          size={20}
                          color1="#d1d5db"
                          color2="#facc15"
                          edit={false}
                          half
                        />
                      </div>
                      <p className="text-xs text-cara-500">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Charts */}
            {stats && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card title="Activos más solicitados" subtitle="Top 10">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.mostRequested}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Préstamos por Carrera">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.careerStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="career" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    {stats.surveyByAsset && stats.surveyByAsset.length > 0 && (
                      <Card title="Encuestas por Activo" subtitle="Cantidad y valoración promedio">
                          <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={stats.surveyByAsset}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="asset" />
                                  <YAxis yAxisId="left" />
                                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                                  <Tooltip />
                                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Cantidad" />
                                  <Bar yAxisId="right" dataKey="avgRating" fill="#82ca9d" name="Promedio" />
                              </BarChart>
                          </ResponsiveContainer>
                      </Card>
                    )}
                </div>
            )}
        </div>
      ) : (
        /* Export Reports Tab */
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
        </div>
      )}

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

              {/* Préstamos */}
              <div>
                <h4 className="font-semibold text-cara-800 mb-2">Préstamos ({userHistory.loans.length})</h4>
                <div className="space-y-2">
                  {userHistory.loans.map((loan: any) => (
                    <div key={loan.id} className="rounded-lg border border-cara-200 p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-cara-900">{loan.assetName} ({loan.assetCode})</p>
                          <p className="text-cara-500">
                            {new Date(loan.startDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} → {new Date(loan.dueDate).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                          </p>
                          {loan.approvedAt && <p className="text-cara-500">Aprobado: {new Date(loan.approvedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>}
                          {loan.returnedAt && <p className="text-cara-500">Devuelto: {new Date(loan.returnedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>}
                          {loan.rejectionReason && <p className="text-danger">Rechazo: {loan.rejectionReason}</p>}
                        </div>
                        <Badge status={loan.status} />
                      </div>
                    </div>
                  ))}
                  {userHistory.loans.length === 0 && <p className="text-sm text-cara-400 italic">Sin préstamos</p>}
                </div>
              </div>

              {/* Incidentes */}
              <div>
                <h4 className="font-semibold text-cara-800 mb-2">Incidentes ({userHistory.incidents.length})</h4>
                <div className="space-y-2">
                  {userHistory.incidents.map((inc: any) => (
                    <div key={inc.id} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                      <p className="font-medium text-red-800">{inc.description}</p>
                      <p className="text-red-600 text-xs">
                        {new Date(inc.reportedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                        {inc.isResolved && inc.resolvedAt && ` · Resuelto: ${new Date(inc.resolvedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`}
                      </p>
                    </div>
                  ))}
                  {userHistory.incidents.length === 0 && <p className="text-sm text-cara-400 italic">Sin incidentes</p>}
                </div>
              </div>

              {/* Sanciones */}
              <div>
                <h4 className="font-semibold text-cara-800 mb-2">Sanciones ({userHistory.sanctions.length})</h4>
                <div className="space-y-2">
                  {userHistory.sanctions.map((san: any) => (
                    <div key={san.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
                      <p className="font-medium text-yellow-800">{san.reason}</p>
                      <p className="text-yellow-600 text-xs">{new Date(san.issuedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>
                    </div>
                  ))}
                  {userHistory.sanctions.length === 0 && <p className="text-sm text-cara-400 italic">Sin sanciones</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
