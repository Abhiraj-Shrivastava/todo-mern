import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { SquarePen, Trash2 } from 'lucide-react';
import Checkbox from './Checkbox.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { useTaskActions } from '../context/TaskActionsContext.jsx';
import { formatTimeRange } from '../utils/dates.js';

const ACTION_WIDTH = 84;

function Highlight({ text, query }) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  // With a capturing group, split() puts the matches at the odd indexes.
  return text.split(new RegExp(`(${words.join('|')})`, 'ig')).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="rounded-sm bg-yellow-100 text-inherit">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * One task in a list. Swipe left (touch or mouse drag) to reveal a Delete button,
 * as in the brief; the trash icon does the same with a confirmation step.
 */
export default function TaskRow({ task, showDate = false, highlight = '' }) {
  const { openView, openEdit, requestDelete, deleteTask, setStatus } = useTaskActions();
  const [optimisticStatus, setOptimisticStatus] = useState(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rowRef = useRef(null);
  const drag = useRef(null);
  const suppressClickUntil = useRef(0);

  // Fresh data from the server replaces the optimistic value.
  useEffect(() => setOptimisticStatus(null), [task.status, task.updatedAt]);

  // Tapping anywhere outside an open row closes it.
  const isOpen = offset !== 0 && !dragging;
  useEffect(() => {
    if (!isOpen) return;
    const close = (e) => {
      if (!rowRef.current?.contains(e.target)) setOffset(0);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [isOpen]);

  const completed = (optimisticStatus ?? task.status) === 'Completed';

  const toggleStatus = async (checked) => {
    const next = checked ? 'Completed' : 'In Progress';
    setOptimisticStatus(next);
    try {
      await setStatus(task, next);
    } catch {
      setOptimisticStatus(null);
    }
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, base: offset, active: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null; // vertical scroll, not a swipe
        return;
      }
      if (Math.abs(dx) < 8) return;
      d.active = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setOffset(Math.max(-ACTION_WIDTH * 1.4, Math.min(0, d.base + dx)));
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClickUntil.current = Date.now() + 300;
    setDragging(false);
    setOffset((o) => (o < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0));
  };

  const onClickCapture = (e) => {
    const justSwiped = Date.now() < suppressClickUntil.current;
    if (justSwiped || offset !== 0) {
      e.stopPropagation();
      e.preventDefault();
      if (!justSwiped) setOffset(0);
    }
  };

  const due = new Date(task.dueDate);

  return (
    <div ref={rowRef} className="relative overflow-hidden border-b border-line last:border-b-0">
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        onClick={() => deleteTask(task)}
        className="absolute inset-y-0 right-0 flex items-center justify-center gap-1.5 bg-pending-ink text-[13px] font-medium text-white"
        // Hidden at rest so its edges can't bleed through the row at fractional pixel offsets.
        style={{ width: ACTION_WIDTH, visibility: offset === 0 ? 'hidden' : 'visible' }}
      >
        <Trash2 className="size-4" />
        Delete
      </button>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        style={{ transform: `translateX(${offset}px)`, touchAction: 'pan-y' }}
        className={`relative flex select-none items-center gap-3 bg-white py-2.5 ${
          dragging ? '' : 'transition-transform duration-200 ease-out'
        }`}
      >
        <Checkbox
          checked={completed}
          onChange={toggleStatus}
          label={completed ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as completed`}
        />

        <button type="button" onClick={() => openView(task)} className="min-w-0 flex-1 py-0.5 text-left">
          <p
            className={`truncate text-[13px] font-medium ${
              completed ? 'text-muted line-through decoration-ink/60' : 'text-ink'
            }`}
          >
            <Highlight text={task.title} query={highlight} />
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
            {showDate && <span>{format(due, 'EEE, d MMM')} ·</span>}
            <span>{formatTimeRange(task)}</span>
            <PriorityBadge priority={task.priority} />
          </p>
        </button>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label={`Delete "${task.title}"`}
            onClick={() => requestDelete(task)}
            className="rounded p-1.5 text-[#b5b9c4] transition-colors hover:bg-pending/60 hover:text-pending-ink"
          >
            <Trash2 className="size-[18px]" strokeWidth={1.6} />
          </button>
          <button
            type="button"
            aria-label={`Edit "${task.title}"`}
            onClick={() => openEdit(task)}
            className="rounded p-1.5 text-[#b5b9c4] transition-colors hover:bg-brand-50 hover:text-brand-500"
          >
            <SquarePen className="size-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
