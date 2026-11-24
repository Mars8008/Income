'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { EmptyText } from '@/components/ui';
import { dateLabel, money } from '@/lib/format';
import { sortRecent } from '@/lib/selectors';
import { useStore } from '@/lib/store';
import type { Transaction } from '@/lib/types';

/** Бүртгэлийн жагсаалт. Мөр дээр дарахад устгах товч гарна. */
export function TransactionList({ items, limit = 30 }: { items: Transaction[]; limit?: number }) {
  const { categoryById, deleteTransaction } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const list = sortRecent(items).slice(0, limit);

  if (list.length === 0) return <EmptyText text="Энэ сард бүртгэл олдсонгүй" />;

  return (
    <ul className="divide-y divide-surface overflow-hidden rounded-2xl bg-white">
      {list.map((t) => {
        const c = categoryById(t.categoryId);
        const isPlus = t.kind === 'income' || (t.kind === 'saving' && t.amount > 0);
        const color =
          t.kind === 'income' ? 'text-income' : t.kind === 'expense' ? 'text-expense' : 'text-brand';
        const open = openId === t.id;
        return (
          <li key={t.id}>
            <button
              onClick={() => setOpenId(open ? null : t.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-2xl">
                {c?.emoji ?? '❔'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink">
                  {c?.name ?? 'Устсан ангилал'}
                </span>
                <span className="block truncate text-xs text-ink-muted">
                  {dateLabel(t.date)}
                  {t.note ? ` · ${t.note}` : ''}
                </span>
              </span>
              <span className={`text-[15px] font-semibold ${color}`}>
                {isPlus ? '+' : '-'}
                {money(Math.abs(t.amount))}
              </span>
            </button>
            {open && (
              <div className="flex justify-end px-4 pb-3">
                <button
                  onClick={() => {
                    if (confirm(`${money(Math.abs(t.amount))} бүртгэлийг устгах уу?`)) {
                      deleteTransaction(t.id);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-expense-soft px-4 py-2 text-sm font-semibold text-expense active:opacity-70">
                  <Trash2 size={16} /> Устгах
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
