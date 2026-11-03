import { CircleAlert } from 'lucide-react';
import TaskRow from './TaskRow.jsx';

function Skeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line py-4 last:border-b-0">
          <div className="size-[18px] animate-pulse rounded-[3px] bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-line" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <CircleAlert className="size-6 text-pending-ink" />
      <p className="max-w-xs text-[13px] text-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[4px] border border-brand-500 px-4 py-1.5 text-[12px] font-medium text-brand-500 hover:bg-brand-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export default function TaskList({ tasks, error, onRetry, emptyText, showDate = false, highlight = '' }) {
  if (error && !tasks) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!tasks) return <Skeleton />;
  if (tasks.length === 0) return <p className="py-8 text-center text-[13px] text-muted">{emptyText}</p>;

  return (
    <div>
      {tasks.map((task) => (
        <TaskRow key={task._id} task={task} showDate={showDate} highlight={highlight} />
      ))}
    </div>
  );
}
