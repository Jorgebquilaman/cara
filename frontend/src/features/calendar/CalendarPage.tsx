import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [assetId, setAssetId] = useState('');

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
    queryKey: ['calendar', start, end, assetId],
    queryFn: async () => {
      const params: Record<string, string> = { start, end };
      if (assetId) params.assetId = assetId;
      const { data } = await api.get('/calendar', { params });
      return (data as any[]).map((e) => ({
        id: e.id,
        title: `${e.title} - ${e.userName}`,
        start: new Date(e.start),
        end: new Date(e.end),
        allDay: true,
        typeId: e.typeId,
        status: e.status,
      }));
    },
  });

  const eventPropGetter = () => ({
    style: {
      backgroundColor: '#3B82F6',
      borderRadius: '2px',
      border: 'none',
      color: '#fff',
      fontSize: '11px',
      padding: '1px 3px',
      display: 'block',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-cara-900">Calendario</h1>
          <p className="text-sm text-cara-500 mt-1">Disponibilidad de activos, reservas y préstamos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDate(new Date())}>
            Hoy
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => {
              const d = new Date(date);
              if (view === 'month') d.setMonth(d.getMonth() - 1);
              else if (view === 'week') d.setDate(d.getDate() - 7);
              else d.setDate(d.getDate() - 1);
              setDate(d);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[130px] text-center text-cara-800">
              {format(date, view === 'day' ? "d 'de' MMMM" : 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="ghost" size="sm" onClick={() => {
              const d = new Date(date);
              if (view === 'month') d.setMonth(d.getMonth() + 1);
              else if (view === 'week') d.setDate(d.getDate() + 7);
              else d.setDate(d.getDate() + 1);
              setDate(d);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex rounded-lg border overflow-hidden">
            {(['month', 'week', 'day'] as View[]).map((v) => (
              <button
                key={v}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === v ? 'bg-cara-900 text-white' : 'bg-white text-cara-600 hover:bg-cara-50'
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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600" /> Préstamo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600" /> Reserva
            </span>
          </div>
          <div className="ml-auto w-60">
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
        </div>
        <div style={{ height: view === 'month' ? 650 : 550 }}>
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
            components={{
              event: ({ event }) => (
                <div
                  style={{
                    backgroundColor: (event as any).typeId === 'Loan' ? '#2563EB' : '#059669',
                    borderRadius: '2px',
                    padding: '1px 3px',
                    color: '#fff',
                    fontSize: '11px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                  title={`${(event as any).title} (${(event as any).status})`}
                >
                  {(event as any).title}
                </div>
              ),
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
        <details className="mt-4 text-xs text-cara-400">
          <summary className="cursor-pointer hover:text-cara-600">Depuración ({rawEvents.length} eventos)</summary>
          <pre className="mt-2 max-h-40 overflow-auto bg-cara-50 p-2 rounded text-cara-600">
            {JSON.stringify(rawEvents.map((e: any) => ({ id: e.id, title: e.title, start: e.start?.toISOString(), end: e.end?.toISOString(), typeId: e.typeId })), null, 2)}
          </pre>
        </details>
      </Card>
    </div>
  );
}
