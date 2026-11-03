import { addWeeks, format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { daysOfWeek, toDateInput } from '../utils/dates.js';

export default function WeekStrip({ selectedDate, onSelect, markedDays }) {
  const today = new Date();
  const days = daysOfWeek(selectedDate);

  return (
    <section aria-label="Choose a day">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => onSelect(addWeeks(selectedDate, -1))}
          className="rounded p-1 text-muted hover:bg-brand-50 hover:text-brand-500"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold">{format(selectedDate, 'MMMM yyyy')}</span>
          {!isSameDay(selectedDate, today) && (
            <button
              type="button"
              onClick={() => onSelect(today)}
              className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-brand-500 hover:bg-brand-100"
            >
              Today
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Next week"
          onClick={() => onSelect(addWeeks(selectedDate, 1))}
          className="rounded p-1 text-muted hover:bg-brand-50 hover:text-brand-500"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const hasTasks = markedDays.has(toDateInput(day));
          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={selected}
              aria-label={`${format(day, 'EEEE d MMMM')}${hasTasks ? ', has tasks' : ''}`}
              onClick={() => onSelect(day)}
              className={`flex flex-col items-center gap-1 rounded-[3px] pt-2 pb-1.5 transition-colors ${
                selected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : isToday
                    ? 'text-brand-500 hover:bg-brand-50'
                    : 'text-muted hover:bg-brand-50'
              }`}
            >
              <span className="text-[10px] leading-none">{format(day, 'EEE')}</span>
              <span className={`text-[15px] leading-tight ${selected || isToday ? 'font-semibold' : ''}`}>
                {format(day, 'dd')}
              </span>
              <span
                className={`size-1 rounded-full ${
                  hasTasks ? (selected ? 'bg-white' : 'bg-brand-500/70') : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
