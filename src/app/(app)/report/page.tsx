'use client';

import { CalendarDays, TriangleRight } from 'lucide-react';

import { AppHeader } from '@/components/header';
import { MoneyFlow, type FlowItem } from '@/components/money-flow';
import { Card, ProgressBar } from '@/components/ui';
import { currentMonth, money, shiftMonthKey } from '@/lib/format';
import { byCategory, inMonth, sumKind, sumKindUpToDay } from '@/lib/selectors';
import { useStore } from '@/lib/store';

const TOP_N = 5;

export default function ReportPage() {
  const { state, month } = useStore();
  const tx = inMonth(state.transactions, month);
  const prevTx = inMonth(state.transactions, shiftMonthKey(month, -1));

  const income = sumKind(tx, 'income');
  const expense = sumKind(tx, 'expense');
  const saving = sumKind(tx, 'saving');

  // Мөнгөний урсгал: хамгийн их зарцуулсан 5 ангилал + бусад + хуримтлал
  const expenseCats = state.categories.filter((c) => c.kind === 'expense');
  const spent = byCategory(tx.filter((t) => t.kind === 'expense'));
  const ranked = expenseCats
    .map((c) => ({ key: c.id, label: c.name, value: spent[c.id] ?? 0, color: c.color }))
    .sort((a, b) => b.value - a.value);
  const flow: FlowItem[] = [
    ...ranked.slice(0, TOP_N),
    { key: 'rest', label: 'Бусад', value: ranked.slice(TOP_N).reduce((s, i) => s + i.value, 0), color: '#616e7c' },
    { key: 'saving', label: 'Хуримтлал', value: Math.max(0, saving), color: '#f5a524' },
  ];

  // Өмнөх сарын энэ өдөртэй харьцуулах
  const isCurrent = month === currentMonth();
  const day = isCurrent ? new Date().getDate() : 31;

  const plan = state.budgets[month] ?? {};
  const budgeted = expenseCats.filter((c) => (plan[c.id] ?? 0) > 0);

  const prevSaving = sumKind(prevTx, 'saving');
  const savingRate = income > 0 ? Math.round((saving / income) * 100) : 0;

  return (
    <>
      <AppHeader />
      <main className="flex flex-col gap-4 px-4 pt-5">
        <Card>
          <h2 className="font-bold uppercase text-ink">Мөнгөний урсгал</h2>
          <div className="mb-4 mt-1 flex justify-between text-xs text-ink-muted">
            <span>Нийт орлого: {money(income)}</span>
            <span>Нийт зарцуулалт: {money(expense)}</span>
          </div>
          <MoneyFlow income={income} items={flow} />
        </Card>

        <Card>
          <h2 className="font-bold uppercase text-ink">
            {isCurrent ? 'Өмнөх сарын энэ өдөртэй харьцуулахад' : 'Өмнөх сартай харьцуулахад'}
          </h2>
          <div className="mt-2 flex gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-income" /> Сайн
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-expense" /> Анхаарах
            </span>
          </div>
          <CompareRow
            label="Орлого"
            now={sumKindUpToDay(tx, 'income', day)}
            prev={sumKindUpToDay(prevTx, 'income', day)}
            goodWhenUp
          />
          <div className="h-px bg-surface" />
          <CompareRow
            label="Зарлага"
            now={sumKindUpToDay(tx, 'expense', day)}
            prev={sumKindUpToDay(prevTx, 'expense', day)}
            goodWhenUp={false}
          />
        </Card>

        <Card>
          <h2 className="mb-3 font-bold uppercase text-ink">Төсвийн биелэлт</h2>
          {budgeted.length === 0 ? (
            <p className="py-4 text-sm text-ink-muted">
              Энэ сард төсөв тохируулаагүй байна. &quot;Төсөв&quot; цэснээс тохируулна уу.
            </p>
          ) : (
            budgeted.map((c) => {
              const s = spent[c.id] ?? 0;
              const p = plan[c.id];
              const pct = Math.round((s / p) * 100);
              return (
                <div key={c.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="w-24 truncate text-[15px] text-ink">{c.name}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-ink-muted">
                        {money(s)} / {money(p)}
                      </span>
                      <span className={`text-sm font-semibold ${pct > 100 ? 'text-expense' : 'text-income'}`}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar value={s / p} />
                  </div>
                </div>
              );
            })
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <h2 className="text-sm font-bold uppercase text-ink">Хуримтлал</h2>
            <p className="mt-3 text-sm text-ink-muted">Энэ сар</p>
            <p className="truncate text-lg font-bold text-ink">{money(saving)}</p>
            <div className="my-3 h-px bg-gray-200" />
            <p className="text-sm text-ink-muted">Өмнөх сар</p>
            <p className="truncate text-lg font-bold text-ink">{money(prevSaving)}</p>
            <Delta value={saving - prevSaving} goodWhenUp />
          </Card>
          <Card>
            <h2 className="text-sm font-bold uppercase text-ink">Хуримтлалын хувь</h2>
            <p className="mt-3 text-4xl font-bold text-ink">{savingRate}%</p>
            <div className="my-3">
              <ProgressBar value={savingRate / 100} color="#14b2ec" />
            </div>
            <p className="text-xs text-ink-muted">{money(income)} орлогоос</p>
          </Card>
        </div>
      </main>
    </>
  );
}

function Delta({ value, goodWhenUp }: { value: number; goodWhenUp: boolean }) {
  const up = value >= 0;
  const good = value === 0 || up === goodWhenUp;
  return (
    <p className={`mt-2 flex items-center gap-1 text-sm font-semibold ${good ? 'text-income' : 'text-expense'}`}>
      <TriangleRight size={12} fill="currentColor" className={up ? '-rotate-90' : 'rotate-90'} />
      {up ? '+' : ''}
      {money(value)}
    </p>
  );
}

function CompareRow({
  label,
  now,
  prev,
  goodWhenUp,
}: {
  label: string;
  now: number;
  prev: number;
  goodWhenUp: boolean;
}) {
  return (
    <div className="grid grid-cols-2 py-4">
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="mt-1 text-lg font-bold text-ink">{money(now)}</p>
        <Delta value={now - prev} goodWhenUp={goodWhenUp} />
      </div>
      <div>
        <p className="text-sm text-ink-muted">Өмнөх сард</p>
        <p className="mt-1 flex items-center gap-2 text-lg font-bold text-ink">
          <CalendarDays size={18} className="text-ink-muted" />
          {money(prev)}
        </p>
      </div>
    </div>
  );
}
