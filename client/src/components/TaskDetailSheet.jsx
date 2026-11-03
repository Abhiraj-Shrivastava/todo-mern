import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays, CircleCheck, Clock3, Flag, LoaderCircle, RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import BottomSheet from './BottomSheet.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { useTaskActions } from '../context/TaskActionsContext.jsx';
import { formatTimeRange } from '../utils/dates.js';

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-[4px] bg-brand-50 text-brand-500">
        <Icon className="size-4" strokeWidth={1.8} />
      </span>
      <div>
        <dt className="text-[11px] text-muted">{label}</dt>
        <dd className="text-[13px] font-medium">{children}</dd>
      </div>
    </div>
  );
}

export default function TaskDetailSheet({ task, onClose }) {
  const { openEdit, requestDelete, setStatus } = useTaskActions();
  const [busy, setBusy] = useState(false);

  const completed = task?.status === 'Completed';

  const toggle = async () => {
    setBusy(true);
    try {
      await setStatus(task, completed ? 'In Progress' : 'Completed');
    } catch {} finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet open={Boolean(task)} onClose={onClose} title="Task Details">
      {task && (
        <>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                completed ? 'bg-brand-50 text-brand-600' : 'bg-pending text-pending-ink'
              }`}
            >
              {task.status}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>

          <h3 className={`mt-3 text-lg font-semibold break-words ${completed ? 'text-muted line-through' : ''}`}>
            {task.title}
          </h3>

          <dl className="mt-5 space-y-3">
            <DetailRow icon={CalendarDays} label="Date">
              {format(new Date(task.dueDate), 'EEEE, d MMMM yyyy')}
            </DetailRow>
            <DetailRow icon={Clock3} label="Time">
              {formatTimeRange(task)}
            </DetailRow>
            <DetailRow icon={Flag} label="Priority">
              {task.priority ?? 'None'}
            </DetailRow>
          </dl>

          <div className="mt-5">
            <p className="mb-1.5 text-[12px] text-ink/80">Description</p>
            <p className="min-h-16 whitespace-pre-wrap break-words rounded-[4px] border border-line bg-[#fafbfe] p-3 text-[13px] text-ink/90">
              {task.description || <span className="text-muted">No description</span>}
            </p>
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[4px] bg-brand-500 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-70"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : completed ? (
              <RotateCcw className="size-4" />
            ) : (
              <CircleCheck className="size-4" />
            )}
            {completed ? 'Mark as in progress' : 'Mark as completed'}
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => openEdit(task)}
              className="flex items-center justify-center gap-2 rounded-[4px] border border-brand-500 py-3 text-[13px] font-medium text-brand-500 hover:bg-brand-50"
            >
              <SquarePen className="size-4" /> Edit
            </button>
            <button
              type="button"
              onClick={() => requestDelete(task)}
              className="flex items-center justify-center gap-2 rounded-[4px] border border-pending-ink py-3 text-[13px] font-medium text-pending-ink hover:bg-pending/50"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
