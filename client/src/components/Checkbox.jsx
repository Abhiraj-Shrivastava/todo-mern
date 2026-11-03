import { Check } from 'lucide-react';

export default function Checkbox({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="group -m-2 shrink-0 p-2"
    >
      <span
        className={`grid size-[18px] place-items-center rounded-[3px] border-[1.5px] border-brand-500 transition-colors ${
          checked ? 'bg-brand-100 text-brand-500' : 'bg-white group-hover:bg-brand-50'
        }`}
      >
        {checked && <Check className="size-3" strokeWidth={3.5} />}
      </span>
    </button>
  );
}
