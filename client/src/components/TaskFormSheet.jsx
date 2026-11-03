import { useEffect, useId, useState } from 'react';
import { format, isSameYear, parseISO } from 'date-fns';
import { CalendarDays, Clock3, LoaderCircle } from 'lucide-react';
import BottomSheet from './BottomSheet.jsx';
import { PRIORITIES, PRIORITY_STYLES } from './PriorityBadge.jsx';
import { defaultStartTime, fromInputs, toDateInput, toTimeInput } from '../utils/dates.js';

const BOX =
  'w-full rounded-[4px] border bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15';

function initialForm(task, defaultDate) {
  if (task) {
    const start = new Date(task.dueDate);
    return {
      title: task.title,
      description: task.description ?? '',
      date: toDateInput(start),
      start: toTimeInput(start),
      end: task.endDate ? toTimeInput(new Date(task.endDate)) : '',
      priority: task.priority ?? '',
    };
  }
  const day = defaultDate ?? new Date();
  return { title: '', description: '', date: toDateInput(day), start: defaultStartTime(day), end: '', priority: '' };
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Please enter a task title';
  if (!form.date) errors.date = 'Please pick a date';
  if (!form.start) errors.start = 'Please set a start time';
  // "HH:mm" strings compare correctly as text.
  if (form.end && form.start && form.end <= form.start) errors.end = 'End time must be after the start';
  return errors;
}

// Server field names -> form field names
function mapServerErrors(details) {
  const map = { title: 'title', description: 'description', dueDate: 'start', endDate: 'end', priority: 'priority' };
  return Object.fromEntries(Object.entries(details).map(([field, message]) => [map[field] ?? 'form', message]));
}

function formatDateLabel(value) {
  const date = parseISO(value);
  return format(date, isSameYear(date, new Date()) ? 'EEEE d, MMMM' : 'EEEE d, MMMM yyyy');
}

// Open the native picker on click in browsers that support it (Chrome needs this
// for the date input, which is visually hidden behind a formatted label).
function openPicker(e) {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    /* not supported or not allowed: the browser's default behaviour still applies */
  }
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[12px] text-ink/80">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-pending-ink">{error}</p>}
    </div>
  );
}

function TimeBox({ id, label, value, onChange, error }) {
  return (
    <label
      htmlFor={id}
      className={`${BOX} flex cursor-pointer items-center gap-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15 ${
        error ? 'border-pending-ink' : 'border-line'
      }`}
    >
      <Clock3 className="size-4 shrink-0" strokeWidth={1.8} />
      <span className={value ? 'text-[11px] text-muted' : ''}>{label}</span>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        className="ml-auto w-full min-w-0 bg-transparent text-right text-[13px] outline-none [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </label>
  );
}

export default function TaskFormSheet({ open, task, defaultDate, onClose, onSave }) {
  const id = useId();
  const isEdit = Boolean(task);
  const [form, setForm] = useState(() => initialForm(task, defaultDate));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm(task, defaultDate));
    setErrors({});
    setSaving(false);
  }, [open, task, defaultDate]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] || e.form ? { ...e, [field]: undefined, form: undefined } : e));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: fromInputs(form.date, form.start).toISOString(),
      endDate: form.end ? fromInputs(form.date, form.end).toISOString() : null,
      priority: form.priority || null,
    };

    setSaving(true);
    try {
      await onSave(task, payload);
      onClose();
    } catch (err) {
      setErrors(err.details ? mapServerErrors(err.details) : { form: err.message });
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Add New Task'}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Task title" htmlFor={`${id}-title`} error={errors.title}>
          <input
            id={`${id}-title`}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Doing Homework"
            maxLength={120}
            autoComplete="off"
            className={`${BOX} ${errors.title ? 'border-pending-ink' : 'border-line'}`}
          />
        </Field>

        <div>
          <p className="mb-2 text-[12px] text-ink/80">Set Time</p>
          <div className="grid grid-cols-2 gap-4">
            <TimeBox id={`${id}-start`} label="Start" value={form.start} onChange={(v) => set('start', v)} error={errors.start} />
            <TimeBox id={`${id}-end`} label="Ends" value={form.end} onChange={(v) => set('end', v)} error={errors.end} />
          </div>
          {(errors.start || errors.end) && (
            <p className="mt-1.5 text-[11px] text-pending-ink">{errors.start || errors.end}</p>
          )}
        </div>

        <Field label="Set Date" htmlFor={`${id}-date`} error={errors.date}>
          <div
            className={`${BOX} relative flex items-center focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15 ${
              errors.date ? 'border-pending-ink' : 'border-line'
            }`}
          >
            <span className={form.date ? '' : 'text-muted'}>{form.date ? formatDateLabel(form.date) : 'Pick a date'}</span>
            <CalendarDays className="ml-auto size-4" strokeWidth={1.8} />
            <input
              id={`${id}-date`}
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              onClick={openPicker}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </Field>

        <div>
          <p className="mb-2 text-[12px] text-ink/80">
            Priority <span className="text-muted">(optional)</span>
          </p>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Priority">
            {PRIORITIES.map((p) => {
              const selected = form.priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set('priority', selected ? '' : p)}
                  className={`flex items-center justify-center gap-1.5 rounded-[4px] border py-2 text-[12px] font-medium transition-colors ${
                    selected ? PRIORITY_STYLES[p].chip : 'border-line text-muted hover:border-brand-200'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${PRIORITY_STYLES[p].dot}`} />
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Description" htmlFor={`${id}-description`} error={errors.description}>
          <textarea
            id={`${id}-description`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Add Description"
            rows={4}
            maxLength={1000}
            className={`${BOX} resize-none border-line`}
          />
        </Field>

        {errors.form && (
          <p role="alert" className="rounded-[4px] bg-pending px-3 py-2 text-[12px] text-pending-ink">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-brand-500 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-70"
        >
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </BottomSheet>
  );
}
