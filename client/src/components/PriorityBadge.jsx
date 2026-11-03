export const PRIORITIES = ['Low', 'Medium', 'High'];

export const PRIORITY_STYLES = {
  Low: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', chip: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  Medium: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', chip: 'border-amber-500 bg-amber-50 text-amber-700' },
  High: { badge: 'bg-red-50 text-red-600', dot: 'bg-red-500', chip: 'border-red-500 bg-red-50 text-red-600' },
};

export default function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium leading-none ${PRIORITY_STYLES[priority].badge}`}>
      {priority}
    </span>
  );
}
