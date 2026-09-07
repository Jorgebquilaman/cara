import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CalendarDays, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#dbeafe', text: '#1e40af' },
  Approved: { bg: '#d1fae5', text: '#065f46' },
  Pending: { bg: '#fef3c7', text: '#92400e' },
  Returned: { bg: '#e0e7ff', text: '#3730a3' },
  Rejected: { bg: '#fce4ec', text: '#c62828' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [assetId, setAssetId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [status, setStatus] = useState('');

  const { start, end } = useMemo(() => {
    const d = new Date(date);
    return {
      start: addDays(new Date(d.getFullYear(), d.getMonth(), 1), -15).toISOString(),
      end: addDays(new Date(d.getFullYear(), d.getMonth() + 1, 0), 15).toISOString(),
    };
  }, [date]);

  const { data: assets } = useQuery({
    queryKey: ['assets', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/assets', { params: { pageSize: 500 } });
      return data.items ?? [];
    },
  });

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['calendar', start, end, assetId, typeId, status],
    queryFn: async () => {
      const params: Record<string, string> = { start, end };
      if (assetId) params.assetId = assetId;
      if (typeId) params.typeId = typeId;
      if (status) params.eventStatus = status;
      const { data } = await api.get('/calendar', { params });
      return (data as any[]).map((e) => ({
        id: e.id,
        title: `${e.title} - ${e.userName}`,
        start: new Date(e.start),
        end: new Date(e.end),
        typeId: e.typeId,
        status: e.status,
      }));
    },
  });

  const eventPropGetter = (event: any) => {
    const isLoan = event.typeId === 'Loan';
    const colors = statusColors[event.status] || { bg: '#3b82f6', text: '#fff' };
    return {
      style: {
        backgroundColor: isLoan ? '#2563EB' : '#059669',
        borderRadius: '4px',
        border: 'none',
        color: '#fff',
        fontSize: '11px',
        padding: '1px 4px',
        display: 'block',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },
    };
  };

  const navigate = (dir: number) => {
    const d = new Date(date);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setDate(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cara-100 dark:bg-cara-900/40 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-cara-600 dark:text-cara-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cara-900 dark:text-white">Calendario</h1>
            <p className="text-sm text-cara-500 dark:text-cara-400 mt-0.5">Disponibilidad de activos, reservas y préstamos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setDate(new Date())}>
            Hoy
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[140px] text-center text-cara-800 dark:text-cara-200 select-none">
              {format(date, view === 'day' ? "d 'de' MMMM" : 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <button
                key={v}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-cara-900 text-white shadow-sm'
                    : 'text-cara-600 dark:text-cara-400 hover:bg-cara-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setView(v)}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Préstamo
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Reserva
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-cara-400" />
            <div className="w-44">
              <Select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                options={[
                  { value: '', label: 'Todos los activos' },
                  ...(assets ?? []).map((a: any) => ({
                    value: a.id,
                    label: a.name,
                  })),
                ]}
              />
            </div>
            <div className="w-36">
              <Select
                value={typeId}
                onChange={(e) => { setTypeId(e.target.value); setStatus(''); }}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  { value: 'Loan', label: 'Préstamo' },
                  { value: 'Reservation', label: 'Reserva' },
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={
                  typeId === 'Loan'
                    ? [
                        { value: '', label: 'Todos los estados' },
                        { value: 'Pendiente', label: 'Pendiente' },
                        { value: 'Aprobado', label: 'Aprobado' },
                        { value: 'Activo', label: 'Activo' },
                        { value: 'Vencido', label: 'Vencido' },
                        { value: 'Devuelto', label: 'Devuelto' },
                        { value: 'Rechazado', label: 'Rechazado' },
                      ]
                    : typeId === 'Reservation'
                    ? [
                        { value: '', label: 'Todos los estados' },
                        { value: 'Pendiente', label: 'Pendiente' },
                        { value: 'Confirmada', label: 'Confirmada' },
                        { value: 'Cancelada', label: 'Cancelada' },
                        { value: 'Completada', label: 'Completada' },
                      ]
                    : [
                        { value: '', label: 'Todos los estados' },
                        { value: 'Pendiente', label: 'Pendiente' },
                        { value: 'Aprobado', label: 'Aprobado' },
                        { value: 'Activo', label: 'Activo' },
                        { value: 'Vencido', label: 'Vencido' },
                        { value: 'Devuelto', label: 'Devuelto' },
                        { value: 'Rechazado', label: 'Rechazado' },
                        { value: 'Confirmada', label: 'Confirmada' },
                        { value: 'Cancelada', label: 'Cancelada' },
                        { value: 'Completada', label: 'Completada' },
                      ]
                }
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-cara-500 border-t-transparent" />
            <span className="ml-3 text-sm text-cara-500">Cargando eventos...</span>
          </div>
        )}

        {!isLoading && (
          <div style={{ height: view === 'month' ? 680 : 550 }}>
            <Calendar
              localizer={localizer}
              events={rawEvents}
              startAccessor="start"
              endAccessor="end"
              date={date}
              view={view}
              onView={setView}
              onNavigate={(d) => setDate(d)}
              eventPropGetter={eventPropGetter}
              formats={{
                weekdayFormat: (date: Date) => format(date, 'EEE', { locale: es }),
              }}
              components={{
                event: ({ event }) => {
                  const e = event as any;
                  const colors = statusColors[e.status] || { bg: '#3b82f6', text: '#fff' };
                  return (
                    <div
                      className="rbc-event-content"
                      title={`${e.title} (${e.status})`}
                    >
                      {view !== 'day' && (
                        <span style={{ fontWeight: 600, marginRight: 3 }}>
                          {format(e.start, 'HH:mm')}
                        </span>
                      )}
                      <span>{e.title}</span>
                    </div>
                  );
                },
              }}
              popup
              messages={{
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay eventos',
                showMore: (count: number) => `+${count} más`,
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
