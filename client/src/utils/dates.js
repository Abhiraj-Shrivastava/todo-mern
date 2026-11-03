import {
  addDays,
  addWeeks,
  differenceInCalendarWeeks,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfWeek,
} from 'date-fns';

const WEEK_OPTIONS = { weekStartsOn: 1 };

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const weekStartOf = (date) => startOfWeek(date, WEEK_OPTIONS);

export const nextWeekStart = (date) => addWeeks(weekStartOf(date), 1);

export const daysOfWeek = (date) => {
  const start = weekStartOf(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  if (!isSameYear(start, end)) return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
  if (!isSameMonth(start, end)) return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
  return `${format(start, 'd')} – ${format(end, 'd MMM yyyy')}`;
}

export function relativeWeekLabel(weekStart) {
  const diff = differenceInCalendarWeeks(new Date(weekStart), new Date(), WEEK_OPTIONS);
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  return null;
}

export const isCurrentWeek = (date) => isSameDay(weekStartOf(date), weekStartOf(new Date()));

export function formatTimeRange(task) {
  const start = format(new Date(task.dueDate), 'h:mm a');
  return task.endDate ? `${start} – ${format(new Date(task.endDate), 'h:mm a')}` : start;
}

export const toDateInput = (date) => format(date, 'yyyy-MM-dd');
export const toTimeInput = (date) => format(date, 'HH:mm');
export const fromInputs = (dateValue, timeValue) => new Date(`${dateValue}T${timeValue}`);

export function defaultStartTime(day) {
  const now = new Date();
  if (isSameDay(day, now) && now.getHours() < 23) return `${String(now.getHours() + 1).padStart(2, '0')}:00`;
  return '09:00';
}
