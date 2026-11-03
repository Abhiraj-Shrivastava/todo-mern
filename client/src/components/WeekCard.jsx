import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import TaskList from './TaskList.jsx';
import { tasksApi } from '../api/tasks.js';
import { useFetch } from '../hooks/useFetch.js';
import { useTaskActions } from '../context/TaskActionsContext.jsx';
import { formatWeekRange, relativeWeekLabel } from '../utils/dates.js';

function WeekTasks({ week }) {
  const { version } = useTaskActions();
  const { data, error, reload } = useFetch(
    (signal) => tasksApi.list({ from: week.weekStart, to: week.weekEnd }, signal),
    week.weekStart,
    version
  );
  return (
    <div className="border-t border-line px-4">
      <TaskList tasks={data} error={error} onRetry={reload} showDate emptyText="No tasks in this week" />
    </div>
  );
}

/** A Monday–Sunday week with its open/completed counts; tap to expand its tasks. */
export default function WeekCard({ week }) {
  const [expanded, setExpanded] = useState(false);
  const label = relativeWeekLabel(week.weekStart);
  const percent = week.total ? Math.round((week.completed / week.total) * 100) : 0;
  const panelId = `week-${week.weekStart}`;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white transition-shadow ${
        expanded ? 'shadow-md shadow-brand-500/5' : ''
      } ${label === 'This week' ? 'border-brand-200' : 'border-line'}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#fafbff]"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold">{formatWeekRange(week.weekStart)}</span>
            {label && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-500">{label}</span>
            )}
          </div>
          <div className="mt-2 flex gap-2 text-[11px] font-medium">
            <span className="rounded-[3px] bg-pending px-2 py-1 text-pending-ink">{week.open} Open</span>
            <span className="rounded-[3px] bg-brand-50 px-2 py-1 text-brand-600">{week.completed} Completed</span>
          </div>
        </div>
        <ChevronDown className={`size-5 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div className="h-1 bg-track" aria-hidden="true">
        <div className="h-full bg-navy transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      {expanded && (
        <div id={panelId}>
          <WeekTasks week={week} />
        </div>
      )}
    </div>
  );
}
