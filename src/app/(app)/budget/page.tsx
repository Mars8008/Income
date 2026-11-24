'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { AppHeader } from '@/components/header';
import { Card, ProgressBar } from '@/components/ui';
import { money, parseAmount } from '@/lib/format';
import { byCategory, inMonth } from '@/lib/selectors';
import { useStore } from '@/lib/store';
import type { Category } from '@/lib/types';

export default function BudgetPage() {
  const { state, month } = useStore();
  const [view, setView] = useState<'plan' | 'spent'>('plan');
  const [openId, setOpenId] = useState<string | null>(null);

  const plan = state.budgets[month] ?? {};
  const spent = byCategory(inMonth(state.transactions, month).filter((t) => t.kind === 'expense'));
  const categories = state.categories.filter((c) => c.kind === 'expense');
  const totalPlan = categories.reduce((s, c) => s + (plan[c.id] ?? 0), 0);
  const totalSpent = categories.reduce((s, c) => s + (spent[c.id] ?? 0), 0);

  return (
    <>
      <AppHeader />
      <main className="flex flex-col gap-3 px-4 pt-5">
        <Card className="text-center">
          <p className="text-sm text-ink-muted">{view === 'plan' ? 'Энэ сарын төсөв' : 'Энэ сард зарцуулсан'}</p>
          <p className="mt-1 text-3xl font-bold text-ink">{money(view === 'plan' ? totalPlan : totalSpent)}</p>
          {totalPlan > 0 && (
            <div className="mt-4 flex flex-col gap-1">
              <ProgressBar value={totalSpent / totalPlan} />
              <p className="text-right text-xs text-ink-muted">
                {money(totalSpent)} / {money(totalPlan)}
              </p>
            </div>
          )}
        </Card>

        <div className="flex rounded-full bg-white p-1">
          {(['plan', 'spent'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 rounded-full py-2.5 font-semibold transition-colors ${view === v ? 'bg-brand text-white' : 'text-ink-muted'}`}>
              {v === 'plan' ? 'Төсөв' : 'Зарцуулсан'}
            </button>
          ))}
        </div>

        {categories.map((c) => (
          <BudgetRow
            key={c.id}
            category={c}
            planned={plan[c.id] ?? 0}
            spent={spent[c.id] ?? 0}
            view={view}
            open={openId === c.id}
            onToggle={() => setOpenId(openId === c.id ? null : c.id)}
          />
        ))}
      </main>
    </>
  );
}

function BudgetRow({
  category,
  planned,
  spent,
  view,
  open,
  onToggle,
}: {
  category: Category;
  planned: number;
  spent: number;
  view: 'plan' | 'spent';
  open: boolean;
  onToggle: () => void;
}) {
  const { month, setBudget } = useStore();
  const [text, setText] = useState('');
  const pct = planned > 0 ? Math.round((spent / planned) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white px-4 py-4">
      <button
        onClick={() => {
          setText(planned ? String(planned) : '');
          onToggle();
        }}
        className="flex w-full items-center gap-3 text-left">
        <span className="text-3xl">{category.emoji}</span>
        <span className="truncate font-semibold text-ink">{category.name}</span>
        <span className={`text-sm ${pct > 100 ? 'text-expense' : 'text-ink-muted'}`}>{pct}%</span>
        {open ? <ChevronUp size={20} className="shrink-0" /> : <ChevronDown size={20} className="shrink-0" />}
        <span className="flex-1" />
        {view === 'spent' ? (
          <span className="shrink-0 font-semibold text-ink">{money(spent)}</span>
        ) : planned > 0 ? (
          <span className="shrink-0 font-semibold text-ink">{money(planned)}</span>
        ) : (
          <span className="shrink-0 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-ink-muted">
            Төсөвлөх
          </span>
        )}
      </button>

      {open && (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setBudget(month, category.id, parseAmount(text));
            onToggle();
          }}>
          <ProgressBar value={planned > 0 ? spent / planned : 0} color={category.color} />
          <p className="text-xs text-ink-muted">
            Зарцуулсан {money(spent)} / Төсөв {money(planned)}
            {planned > 0 && spent <= planned ? ` · Үлдсэн ${money(planned - spent)}` : ''}
            {planned > 0 && spent > planned ? ` · ${money(spent - planned)} хэтэрсэн` : ''}
          </p>
          <div className="flex gap-2">
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputMode="numeric"
              placeholder="Төсвийн дүн"
              className="min-w-0 flex-1 rounded-xl bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-gray-400"
            />
            <button className="rounded-xl bg-brand px-5 font-semibold text-white active:opacity-80">
              Хадгалах
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
