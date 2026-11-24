'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AddSheet, type AddTarget } from '@/components/add-sheet';
import { CategoryGrid } from '@/components/category-grid';
import { AppHeader } from '@/components/header';
import { SummaryCard } from '@/components/summary-card';
import { TransactionList } from '@/components/transaction-list';
import { Dialog, SectionTitle } from '@/components/ui';
import { money, parseAmount } from '@/lib/format';
import { balanceUntil, byCategory, inMonth, savingsUntil, sumKind } from '@/lib/selectors';
import { useStore } from '@/lib/store';

export default function FinancePage() {
  const router = useRouter();
  const { state, month } = useStore();
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget>(null);

  const monthTx = inMonth(state.transactions, month);
  const balance = balanceUntil(state, month);

  return (
    <>
      <AppHeader>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SummaryCard label="Хуримтлал" value={savingsUntil(state, month)} chevron onClick={() => router.push('/savings')} />
          <SummaryCard label="Үлдэгдэл" value={balance} chevron onClick={() => setBalanceOpen(true)} />
          <SummaryCard
            label="Зарлага"
            value={sumKind(monthTx, 'expense')}
            tone="expense"
            active={mode === 'expense'}
            onClick={() => setMode('expense')}
          />
          <SummaryCard
            label="Орлого"
            value={sumKind(monthTx, 'income')}
            tone="income"
            active={mode === 'income'}
            onClick={() => setMode('income')}
          />
        </div>
      </AppHeader>

      <main className="px-4">
        <CategoryGrid
          key={mode}
          title={mode === 'expense' ? 'Зарлагын бүртгэл' : 'Орлогын бүртгэл'}
          kind={mode}
          totals={byCategory(monthTx)}
          onPick={(c) => setAddTarget({ kind: mode, categoryId: c.id })}
        />

        <SectionTitle title="Сүүлийн бүртгэлүүд" />
        <TransactionList items={monthTx.filter((t) => t.kind === mode)} />
      </main>

      <AddSheet target={addTarget} onClose={() => setAddTarget(null)} />
      <BalanceDialog open={balanceOpen} value={balance} onClose={() => setBalanceOpen(false)} />
    </>
  );
}

function BalanceDialog({ open, value, onClose }: { open: boolean; value: number; onClose: () => void }) {
  const { setBalance, month } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');

  const close = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} title="Таны мөнгөний үлдэгдэл">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (editing) {
            setBalance(month, parseAmount(text));
            close();
          } else {
            setText(String(Math.max(0, Math.round(value))));
            setEditing(true);
          }
        }}>
      {editing ? (
        <input
          autoFocus
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="0"
          className="w-full rounded-2xl border border-gray-300 px-4 py-4 text-center text-2xl font-bold text-ink outline-none focus:border-brand"
        />
      ) : (
        <p className="rounded-2xl border border-gray-300 px-4 py-4 text-center text-2xl font-bold text-ink">
          {money(value)}
        </p>
      )}
      <button className="mt-5 w-full py-2 text-lg font-semibold text-brand">
        {editing ? 'Хадгалах' : 'Засах'}
      </button>
      </form>
    </Dialog>
  );
}
