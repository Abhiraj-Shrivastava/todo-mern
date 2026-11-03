import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, isToday, startOfDay } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import WeekStrip from '../components/WeekStrip.jsx';
import WeekSummary from '../components/WeekSummary.jsx';
import WeekCard from '../components/WeekCard.jsx';
import TaskList, { ErrorState } from '../components/TaskList.jsx';
import { tasksApi } from '../api/tasks.js';
import { useFetch } from '../hooks/useFetch.js';
import { useTaskActions } from '../context/TaskActionsContext.jsx';
import { isCurrentWeek, nextWeekStart, toDateInput, weekStartOf } from '../utils/dates.js';

export default function Home() {
  const navigate = useNavigate();
  const { version, openCreate } = useTaskActions();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [showWholeWeek, setShowWholeWeek] = useState(false);

  const from = weekStartOf(selectedDate).toISOString();
  const to = nextWeekStart(selectedDate).toISOString();
  const weekTasks = useFetch((signal) => tasksApi.list({ from, to }, signal), from, version);
  const weeks = useFetch((signal) => tasksApi.weeks(signal), 'weeks', version);

  const tasks = weekTasks.data;
  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === 'Completed').length ?? 0;
  const markedDays = new Set(tasks?.map((t) => toDateInput(new Date(t.dueDate))));
  const dayTasks = tasks?.filter((t) => isSameDay(new Date(t.dueDate), selectedDate)) ?? null;
  const thisWeek = isCurrentWeek(selectedDate);

  const listTitle = showWholeWeek
    ? thisWeek
      ? "This Week's Tasks"
      : 'Tasks This Week'
    : isToday(selectedDate)
      ? 'Tasks Today'
      : `Tasks · ${format(selectedDate, 'EEE, d MMM')}`;

  return (
    <>
      <div className="px-5 pt-6 pb-32">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex w-full items-center justify-between rounded-[4px] border border-line bg-white px-4 py-3 text-[12px] text-muted shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-brand-200"
        >
          Search for a task
          <Search className="size-[18px] text-ink" strokeWidth={1.8} />
        </button>

        <div className="mt-5">
          <WeekStrip
            selectedDate={selectedDate}
            onSelect={(day) => setSelectedDate(startOfDay(day))}
            markedDays={markedDays}
          />
        </div>

        <div className="mt-6">
          <WeekSummary completed={completed} total={total} caption={thisWeek ? 'This Week' : 'That Week'} />
        </div>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{listTitle}</h2>
            <button
              type="button"
              onClick={() => setShowWholeWeek((v) => !v)}
              className="text-[12px] font-medium text-brand-500 hover:underline"
            >
              {showWholeWeek ? 'Show Day' : 'View All'}
            </button>
          </div>
          <div className="mt-1">
            <TaskList
              tasks={showWholeWeek ? tasks : dayTasks}
              error={weekTasks.error}
              onRetry={weekTasks.reload}
              showDate={showWholeWeek}
              emptyText={showWholeWeek ? 'No tasks this week. Tap + to add one.' : 'Nothing planned for this day. Tap + to add a task.'}
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold">Weekly Overview</h2>
          <p className="mt-0.5 text-[11px] text-muted">Open and completed tasks per week (Mon – Sun). Tap a week to see its tasks.</p>
          <div className="mt-3 space-y-3">
            {weeks.error && !weeks.data ? (
              <ErrorState message={weeks.error.message} onRetry={weeks.reload} />
            ) : !weeks.data ? (
              [0, 1].map((i) => <div key={i} className="h-[92px] animate-pulse rounded-lg bg-line/60" />)
            ) : weeks.data.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-muted">Your weeks will show up here once you add tasks.</p>
            ) : (
              weeks.data.map((week) => <WeekCard key={week.weekStart} week={week} />)
            )}
          </div>
        </section>
      </div>

      <button
        type="button"
        aria-label="Add task"
        onClick={() => openCreate(selectedDate)}
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 z-40 grid size-14 -translate-x-1/2 place-items-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40 transition-transform hover:bg-brand-600 active:scale-95"
      >
        <Plus className="size-7" strokeWidth={1.8} />
      </button>
    </>
  );
}
