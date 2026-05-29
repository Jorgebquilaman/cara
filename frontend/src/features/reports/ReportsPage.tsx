import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { FileText, Download, Users, Package, BookOpen, ThumbsUp, Undo2, ArrowRightCircle, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import ReactStars from 'react-stars';
import clsx from 'clsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UserHistory {
  id: string; fullName: string; institutionalEmail: string; role: string; isActive: boolean;
  userAverageRating: number | null;
  loans: any[]; incidents: any[]; sanctions: any[];
}

interface ReportStats {
    kpIs: { totalAssets: number; activeLoans: number; totalUsers: number; totalSurveys: number; avgOverallRating: number; avgServiceRating: number; avgRequestTimeRating: number; avgAssetQualityRating: number };
    mostRequested: { name: string; count: number }[];
    departmentStats: { department: string; count: number }[];
    careerStats: { career: string; count: number }[];
    usageTime: { asset: string; averageHours: number }[];
    surveyByAsset: { asset: string; count: number; avgRating: number }[];
    incidentStats: { totalIncidents: number; unresolvedIncidents: number; assetsWithIncidents: number; topIncidentAssets: { asset: string; count: number }[] };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const reports = [
  { title: 'Préstamos Activos', description: 'Listado de todos los préstamos actualmente activos', endpoint: 'loans/csv', filename: 'prestamos-activos.csv' },
  { title: 'Activos por Categoría', description: 'Inventario de activos agrupados por categoría', endpoint: 'assets/by-category/csv', filename: 'activos-por-categoria.csv' },
  { title: 'Usuarios con Sanciones', description: 'Usuarios que poseen sanciones activas', endpoint: 'sanctions/active/csv', filename: 'sanciones-activas.csv' },
  { title: 'Historial de Auditoría', description: 'Registro de cambios en el sistema', endpoint: 'audit/csv', filename: 'auditoria.csv' },
  { title: 'Encuestas de Satisfacción', description: 'Resultados de encuestas completadas por usuarios', endpoint: 'surveys/csv', filename: 'encuestas.csv' },
];

const StatCard = ({ label, value, icon: Icon, color, accentColor }: { label: string, value: number, icon: any, color: string, accentColor?: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
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

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [selectedUserId, setSelectedUserId] = useState('');
  const historyRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'graphics' | 'csv' | 'prenda' | 'historial'>('graphics');

  const { data: stats } = useQuery<ReportStats>({
    queryKey: ['report-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/statistics');
      return data;
    },
  });

  const queryClient = useQueryClient();

  const { data: prendaStats } = useQuery({
    queryKey: ['prenda-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/prenda-stats');
      return data;
    },
  });

  const togglePrendaReturn = useMutation({
    mutationFn: async (params: { loanId: string; returned: boolean }) => {
      const endpoint = params.returned ? 'prenda-return' : 'prenda-unreturn';
      await api.post(`/loans/${params.loanId}/${endpoint}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prenda-stats'] });
      toast.success('Estado de prenda actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar la prenda');
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

  const handleExportUserHistoryPdf = async () => {
    if (!userHistory || !historyRef.current) return;
    try {
      toast.loading('Generando PDF...');
      const canvas = await html2canvas(historyRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight() - 20;
      }

      const fileName = `historial-${userHistory.fullName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      toast.dismiss();
      toast.success('PDF descargado');
    } catch {
      toast.dismiss();
      toast.error('Error al generar el PDF');
    }
  };

  const userOptions = (users ?? []).map((u) => ({
    value: u.id,
    label: `${u.fullName} (${u.institutionalEmail})`,
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cara-900">Reportes y Estadísticas</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
            {(isAdmin ? (['graphics', 'prenda', 'historial', 'csv'] as const) : (['graphics', 'prenda', 'csv'] as const)).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                        "py-3 px-4 border-b-2 font-medium text-sm transition-colors capitalize",
                        activeTab === tab ? "border-cara-600 text-cara-600" : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    {tab === 'graphics' ? 'Estadísticas' : tab === 'prenda' ? 'Prendas' : tab === 'historial' ? 'Historial de Usuarios' : 'Reportes CSV'}
                </button>
            ))}
        </nav>
      </div>

      {activeTab === 'graphics' ? (
        <div className="space-y-8">
            {/* KPI Cards */}
            {stats && stats.kpIs && (
                <div className="grid gap-6 md:grid-cols-4">
                    <StatCard label="Total Activos" value={stats.kpIs.totalAssets} icon={Package} color="text-blue-600 bg-blue-50" accentColor="bg-blue-500" />
                    <StatCard label="Préstamos Activos" value={stats.kpIs.activeLoans} icon={BookOpen} color="text-amber-600 bg-amber-50" accentColor="bg-amber-500" />
                    <StatCard label="Usuarios Totales" value={stats.kpIs.totalUsers} icon={Users} color="text-green-600 bg-green-50" accentColor="bg-green-500" />
                    <StatCard label="Encuestas Realizadas" value={stats.kpIs.totalSurveys} icon={ThumbsUp} color="text-purple-600 bg-purple-50" accentColor="bg-purple-500" />
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

            {/* Incident Stats */}
            {stats && stats.incidentStats && (
              <Card title="Incidentes / Instrumentos Rotos">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cara-700">{stats.incidentStats.totalIncidents}</p>
                    <p className="text-xs text-cara-500">Total Incidentes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-danger">{stats.incidentStats.unresolvedIncidents}</p>
                    <p className="text-xs text-cara-500">Sin Resolver</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cara-700">{stats.incidentStats.assetsWithIncidents}</p>
                    <p className="text-xs text-cara-500">Activos Afectados</p>
                  </div>
                </div>
                {stats.incidentStats.topIncidentAssets.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-cara-700 mb-2">Activos con más incidentes</p>
                    <div className="space-y-2">
                      {stats.incidentStats.topIncidentAssets.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-cara-800">{item.asset}</span>
                          <span className="font-semibold text-cara-600">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
      ) : activeTab === 'prenda' ? (
        /* Prendas Tab */
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <p className="text-3xl font-extrabold text-gray-900">${prendaStats?.totalPrenda.toFixed(2) ?? '0.00'}</p>
              <p className="text-sm text-gray-500 font-medium">Total en Prendas</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
              <p className="text-3xl font-extrabold text-gray-900">{prendaStats?.totalWithPrenda ?? 0}</p>
              <p className="text-sm text-gray-500 font-medium">Préstamos con Prenda</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
              <p className="text-3xl font-extrabold text-gray-900">${prendaStats?.averagePrenda.toFixed(2) ?? '0.00'}</p>
              <p className="text-sm text-gray-500 font-medium">Promedio por Prenda</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className={clsx('absolute left-0 top-0 bottom-0 w-1', (prendaStats?.saldoPendiente ?? 0) > 0 ? 'bg-amber-500' : 'bg-green-500')} />
              <p className={clsx('text-3xl font-extrabold', (prendaStats?.saldoPendiente ?? 0) > 0 ? 'text-amber-600' : 'text-green-600')}>
                ${prendaStats?.saldoPendiente.toFixed(2) ?? '0.00'}
              </p>
              <p className="text-sm text-gray-500 font-medium">Saldo Pendiente</p>
            </div>
          </div>

          <Card title="Últimos préstamos con prenda">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cara-200">
                <thead className="bg-cara-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Activo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Prenda</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Retiro</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-cara-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cara-100">
                  {(prendaStats?.recent ?? []).map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-cara-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-cara-800">{r.assetCode} - {r.assetName}</td>
                      <td className="px-4 py-3 text-sm text-cara-800">{r.userName}</td>
                      <td className="px-4 py-3 text-sm text-cara-800 font-medium">${r.prenda.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {r.prendaReturned ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Undo2 className="h-3 w-3" />
                            Devuelta
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <ArrowRightCircle className="h-3 w-3" />
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-cara-500">{new Date(r.requestedAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge status={r.status} />
                          <button
                            onClick={() => togglePrendaReturn.mutate({ loanId: r.id, returned: !r.prendaReturned })}
                            className="text-xs text-cara-500 hover:text-cara-700 underline"
                            title={r.prendaReturned ? 'Marcar como no devuelta' : 'Marcar como devuelta'}
                          >
                            {r.prendaReturned ? 'Anular' : 'Retirar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!prendaStats?.recent || prendaStats.recent.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-cara-400">Sin préstamos con prenda</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'historial' ? (
        /* Historial de Usuarios Tab */
        <div className="space-y-4">
          <Card>
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
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleExportUserHistory}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportUserHistoryPdf} disabled={!userHistory}>
                    <File className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {historyLoading && <p className="text-sm text-cara-500">Cargando historial...</p>}

          {userHistory && (
            <div className="space-y-6" ref={historyRef}>
              <div className="rounded-lg border border-cara-200 bg-cara-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-cara-900">{userHistory.fullName}</h3>
                    <p className="text-sm text-cara-600">{userHistory.institutionalEmail} · {userHistory.role}</p>
                    {userHistory.userAverageRating != null && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-cara-600">Calificación promedio:</span>
                        <ReactStars
                          count={5}
                          value={userHistory.userAverageRating}
                          size={20}
                          color2="#f59e0b"
                          color1="#d1d5db"
                          edit={false}
                          half
                        />
                        <span className="text-xs text-cara-500">({userHistory.userAverageRating.toFixed(1)})</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-cara-700 mb-2">Duración de préstamos (horas)</h4>
                    {(() => {
                      const chartData = userHistory.loans
                        .filter((l: any) => l.startDate && (l.returnedAt || l.dueDate))
                        .map((l: any) => {
                          const end = l.returnedAt || l.dueDate;
                          const diff = Math.round((new Date(end).getTime() - new Date(l.startDate).getTime()) / (1000 * 60 * 60));
                          return { name: l.assetName?.length > 20 ? l.assetName.slice(0, 18) + '...' : l.assetName || 'N/A', días: Math.max(diff, 0) };
                        });
                      const mean = chartData.reduce((s: number, d: any) => s + d.días, 0) / chartData.length;
                      return chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={30} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ fontSize: 12 }} />
                            <Bar dataKey="días" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                            <ReferenceLine y={mean} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Media: ${mean.toFixed(1)}h`, position: 'right', fontSize: 10, fill: '#ef4444' }} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-xs text-cara-400 italic">Sin datos</p>
                      );
                    })()}
                  </div>
                </div>
              </div>

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

    </div>
  );
}
