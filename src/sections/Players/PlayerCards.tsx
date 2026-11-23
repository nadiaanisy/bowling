import type { ReactNode } from 'react';
import { PLAYER_CARD_CLASS } from '../../utils/constants/players';

export function PlayerStatCard({
  label,
  value,
  icon,
  tone = 'violet',
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: 'violet' | 'green' | 'blue';
}) {
  const iconTone =
    tone === 'green'
      ? 'bg-emerald-500/15 text-emerald-300'
      : tone === 'blue'
        ? 'bg-blue-500/15 text-blue-300'
        : 'bg-violet-500/15 text-violet-300';
  return (
    <div
      className={`${PLAYER_CARD_CLASS} flex min-w-0 items-center gap-3 p-3 sm:p-4`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTone}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export function PlayerRuleRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] py-2.5 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${positive ? 'bg-emerald-500/15 text-emerald-200' : 'bg-violet-400/10 text-violet-100'}`}
      >
        {value}
      </span>
    </div>
  );
}
