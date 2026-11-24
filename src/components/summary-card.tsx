import { ChevronLeft, ChevronRight } from 'lucide-react';

import { money } from '@/lib/format';

export function SummaryCard({
  label,
  value,
  tone = 'brand',
  active = false,
  chevron = false,
  onClick,
}: {
  label: string;
  value: number;
  tone?: 'brand' | 'income' | 'expense';
  active?: boolean;
  chevron?: boolean;
  onClick?: () => void;
}) {
  const circle = tone === 'income' ? 'bg-income' : tone === 'expense' ? 'bg-expense' : 'bg-brand';
  return (
    <button
      onClick={onClick}
      className={`flex h-[68px] min-w-0 items-center gap-3 rounded-2xl px-3 text-left transition-colors active:opacity-80 ${active ? 'bg-navy' : 'bg-white'}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-full text-lg font-bold text-white ${circle}`}>
        {tone === 'brand' ? '$' : tone === 'income' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13px] ${active ? 'text-white/80' : 'text-ink-muted'}`}>{label}</span>
        <span className={`block truncate text-[15px] font-bold ${active ? 'text-white' : 'text-ink'}`}>
          {money(value)}
        </span>
      </span>
      {chevron && <ChevronRight size={18} className="shrink-0 text-gray-500" />}
    </button>
  );
}
