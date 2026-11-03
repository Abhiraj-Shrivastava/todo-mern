import { useNavigate } from 'react-router-dom';
import { markOnboarded } from '../utils/onboarding.js';

function Zigzag({ className }) {
  const rows = [0, 14, 28, 42];
  return (
    <svg viewBox="0 0 120 56" fill="none" aria-hidden="true" className={className}>
      {rows.map((y) => (
        <path
          key={y}
          d={`M0 ${y + 10} l10 -10 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10 l10 10`}
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="2.2"
          strokeLinejoin="miter"
        />
      ))}
    </svg>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();

  const start = () => {
    markOnboarded();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="relative flex-[1.65] overflow-hidden bg-brand-500">
        <div className="absolute -top-14 -right-14 size-36 rounded-full border-[18px] border-white/25" />
        <Zigzag className="absolute top-[18%] left-0 w-28" />
        <Zigzag className="absolute right-0 bottom-6 w-28" />
      </div>

      <div className="flex flex-1 flex-col bg-white px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="text-[22px] font-semibold">Manage What To Do</h1>
        <p className="mt-3 max-w-[260px] text-[12px] leading-relaxed text-muted">
          The best way to manage what you have to do, don&apos;t forget your plans
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-auto w-full rounded-[3px] bg-brand-500 py-3.5 text-[14px] font-medium text-white transition-colors hover:bg-brand-600"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
