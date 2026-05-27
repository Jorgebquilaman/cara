import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from '@/types';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  bookedRanges?: DateRange[];
  value?: { start: Date; end: Date };
  onChange?: (range: { start: Date; end: Date }) => void;
  minDate?: Date;
}

export default function Calendar({ bookedRanges = [], value, onChange, minDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<Date | null>(value?.start ?? null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const bookedSet = useMemo(() => {
    const set = new Set<string>();
    for (const range of bookedRanges) {
      const s = new Date(range.start);
      const e = new Date(range.end);
      const days = eachDayOfInterval({ start: s, end: e });
      for (const d of days) set.add(format(d, 'yyyy-MM-dd'));
    }
    return set;
  }, [bookedRanges]);

  const dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  const handleDayClick = (day: Date) => {
    if (minDate && day < minDate) return;
    if (selecting === 'start') {
      setTempStart(day);
      setSelecting('end');
      if (value) {
        onChange?.({ start: day, end: day });
      }
    } else {
      if (tempStart && day < tempStart) {
        onChange?.({ start: day, end: tempStart });
        setTempStart(day);
      } else {
        onChange?.({ start: tempStart ?? day, end: day });
        setTempStart(null);
        setSelecting('start');
      }
    }
  };

  const selectedStart = selecting === 'end' ? tempStart : value?.start ?? null;
  const selectedEnd = selecting === 'end' ? null : value?.end ?? null;

  const isInRange = (day: Date) => {
    if (!selectedStart && !selectedEnd) return false;
    if (selectedStart && selectedEnd) {
      return day >= selectedStart && day <= selectedEnd;
    }
    if (selectedStart && selecting === 'end') {
      return isSameDay(day, selectedStart);
    }
    return false;
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-cara-100 text-cara-600"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-cara-800">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-cara-100 text-cara-600"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-xs mb-1">
        {dayLabels.map((label) => (
          <div key={label} className="text-cara-400 font-medium py-1">{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isBooked = bookedSet.has(dateStr);
          const inRange = isInRange(day);
          const sameMonth = isSameMonth(day, currentMonth);
          const isStart = selectedStart && isSameDay(day, selectedStart);
          const isEnd = selectedEnd && isSameDay(day, selectedEnd);
          const isMin = minDate && isSameDay(day, minDate);
          const isPast = minDate ? day < minDate : false;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!sameMonth || isPast}
              onClick={() => handleDayClick(day)}
              className={`
                relative h-8 w-full text-xs rounded-md font-medium transition-colors
                ${!sameMonth ? 'text-cara-200 cursor-default' : ''}
                ${isPast ? 'text-cara-200 cursor-not-allowed' : ''}
                ${sameMonth && !isPast && !inRange && !isBooked ? 'text-cara-700 hover:bg-cara-100' : ''}
                ${sameMonth && !isPast && isBooked && !inRange ? 'text-red-400 line-through cursor-not-allowed' : ''}
                ${inRange && !isStart && !isEnd ? 'bg-cara-200 text-cara-800' : ''}
                ${isStart || isEnd ? 'bg-cara-600 text-white rounded-md' : ''}
                ${isToday(day) && !isStart && !isEnd ? 'border border-cara-400' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-cara-500">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded bg-cara-600" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded bg-red-300" />
          <span>Ocupado</span>
        </div>
        {selectedStart && selecting === 'end' && (
          <span className="text-cara-400">Seleccioná la fecha de fin</span>
        )}
      </div>
    </div>
  );
}
