'use client';

import { Wallet } from 'lucide-react';
import { useState } from 'react';

import { AddSheet, type AddTarget } from '@/components/add-sheet';
import { CategoryGrid } from '@/components/category-grid';
import { BackHeader, MonthSwitcher } from '@/components/header';
import { TransactionList } from '@/components/transaction-list';
import { ActionTile, SectionTitle } from '@/components/ui';
import { money } from '@/lib/format';
import { byCategory, inMonth, savingsUntil, sumKind } from '@/lib/selectors';
import { useStore } from '@/lib/store';

export default function SavingsPage() {
  const { state, month } = useStore();
  const [addTarget, setAddTarget] = useState<AddTarget>(null);
  const monthTx = inMonth(state.transactions, month).filter((t) => t.kind === 'saving');

  return (
    <>
      <BackHeader title="Хуримтлал">
        <MonthSwitcher />
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-2">
          <Stat label="Энэ сард" value={sumKind(monthTx, 'saving')} dark />
          <Stat label="Нийт хуримтлал" value={savingsUntil(state, month)} />
        </div>
      </BackHeader>

      <main className="px-4">
        <CategoryGrid
          title="Хуримтлалын бүртгэл"
          kind="saving"
          totals={byCategory(monthTx)}
          tileIcon="arrow"
          onPick={(c) => setAddTarget({ kind: 'saving', categoryId: c.id })}
          extra={
            <ActionTile
              label="Мөнгө хасах"
              icon="remove"
              tone="expense"
              onClick={() => setAddTarget({ kind: 'saving', withdraw: true })}
            />
          }
        />

        <SectionTitle title="Сүүлийн бүртгэлүүд" />
        <TransactionList items={monthTx} />
      </main>

      <AddSheet target={addTarget} onClose={() => setAddTarget(null)} />
    </>
  );
}

function Stat({ label, value, dark = false }: { label: string; value: number; dark?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 rounded-xl p-3 ${dark ? 'bg-navy' : 'bg-white'}`}>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${dark ? 'bg-income text-white' : 'bg-surface text-income'}`}>
        <Wallet size={22} />
      </span>
      <span className="min-w-0">
        <span className={`block text-xs ${dark ? 'text-white/70' : 'text-ink-muted'}`}>{label}</span>
        <span className={`block truncate font-bold ${dark ? 'text-white' : 'text-ink'}`}>{money(value)}</span>
      </span>
    </div>
  );
}
