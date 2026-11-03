import { Check, X } from 'lucide-react';

function SummaryCard({ tone, icon, label, value, caption }) {
  return (
    <div className={`rounded-[3px] px-3.5 py-4 ${tone}`}>
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-[12px] font-medium">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5 pl-[34px]">
        <span className="text-[22px] leading-none font-semibold">{String(value).padStart(2, '0')}</span>
        <span className="text-[10px] text-muted">{caption}</span>
      </div>
    </div>
  );
}

export default function WeekSummary({ completed, total, caption }) {
  const pending = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          tone="bg-brand-50"
          label="Task Complete"
          value={completed}
          caption={caption}
          icon={
            <span className="grid size-6 place-items-center rounded-[3px] border-[1.5px] border-brand-500 bg-brand-200/70 text-brand-600">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          }
        />
        <SummaryCard
          tone="bg-pending"
          label="Task Pending"
          value={pending}
          caption={caption}
          icon={
            <span className="grid size-6 place-items-center rounded-[3px] border-[1.5px] border-pending-ink bg-[#f7b9b9]/70 text-pending-ink">
              <X className="size-3.5" strokeWidth={3} />
            </span>
          }
        />
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Weekly Progress</h2>
          <span className="text-[11px] text-muted">
            {total ? `${completed}/${total} done · ${percent}%` : 'No tasks this week'}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Weekly progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-3 h-5 w-full bg-track"
        >
          <div className="h-full bg-navy transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
        </div>
      </section>
    </>
  );
}
