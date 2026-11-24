'use client';

import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';

import { BackHeader } from '@/components/header';
import { EmptyText } from '@/components/ui';
import { money, parseAmount } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { DebtType } from '@/lib/types';

const COPY: Record<DebtType, { title: string; hint: string; person: string }> = {
  receivable: { title: 'Авлага', hint: 'Танд өгөх ёстой мөнгө', person: 'Хэн танд өртэй вэ?' },
  payable: { title: 'Өглөг', hint: 'Таны өгөх ёстой мөнгө', person: 'Хэнд өртэй вэ?' },
};

export default function DebtsPage() {
  const { type } = useParams<{ type: string }>();
  if (type !== 'receivable' && type !== 'payable') notFound();
  return <Debts type={type} />;
}

function Debts({ type }: { type: DebtType }) {
  const { state, addDebt, toggleDebt, deleteDebt } = useStore();
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const list = state.debts
    .filter((d) => d.type === type)
    .sort((a, b) => Number(a.settled) - Number(b.settled) || b.createdAt - a.createdAt);
  const open = list.filter((d) => !d.settled).reduce((s, d) => s + d.amount, 0);
  const canAdd = person.trim().length > 0 && parseAmount(amount) > 0;
  const input =
    'min-w-0 rounded-xl bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-gray-400';

  return (
    <>
      <BackHeader title={COPY[type].title}>
        <div className="mt-4 rounded-2xl bg-white p-4 text-center">
          <p className="text-sm text-ink-muted">{COPY[type].hint}</p>
          <p className="mt-1 text-3xl font-bold text-ink">{money(open)}</p>
        </div>
      </BackHeader>

      <main className="flex flex-col gap-4 px-4 pt-5">
        <form
          className="flex flex-col gap-2 rounded-3xl bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canAdd) return;
            addDebt({ type, person: person.trim(), amount: parseAmount(amount), note: note.trim() });
            setPerson('');
            setAmount('');
            setNote('');
          }}>
          <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder={COPY[type].person} className={input} />
          <div className="grid grid-cols-2 gap-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="Дүн" className={input} />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Тэмдэглэл" className={input} />
          </div>
          <button
            disabled={!canAdd}
            className={`rounded-xl bg-brand py-3 font-semibold text-white ${canAdd ? 'active:opacity-80' : 'opacity-40'}`}>
            Нэмэх
          </button>
        </form>

        {list.length === 0 ? (
          <EmptyText text="Бүртгэл алга" />
        ) : (
          <ul className="divide-y divide-surface overflow-hidden rounded-2xl bg-white">
            {list.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleDebt(d.id)}
                  aria-label={d.settled ? 'Төлөгдөөгүй болгох' : 'Төлөгдсөн гэж тэмдэглэх'}
                  className={d.settled ? 'text-income' : 'text-gray-400'}>
                  {d.settled ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${d.settled ? 'text-ink-muted line-through' : 'text-ink'}`}>{d.person}</p>
                  {d.note && <p className="truncate text-xs text-ink-muted">{d.note}</p>}
                </div>
                <span className={`font-semibold ${d.settled ? 'text-ink-muted' : 'text-ink'}`}>{money(d.amount)}</span>
                <button
                  onClick={() => confirm(`${d.person} — ${money(d.amount)} устгах уу?`) && deleteDebt(d.id)}
                  aria-label="Устгах"
                  className="text-gray-400 active:text-expense">
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-center text-xs text-ink-muted">Дугуй дээр дарж төлөгдсөн гэж тэмдэглэнэ</p>
      </main>
    </>
  );
}
