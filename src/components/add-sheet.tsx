'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Delete, PencilLine, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Sheet } from '@/components/ui';
import { dateLabel, money, shiftDateKey, todayKey } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { Kind } from '@/lib/types';

export type AddTarget = { kind: Kind; categoryId?: string; withdraw?: boolean } | null;

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'] as const;

const TONE: Record<Kind, { bg: string; text: string }> = {
  expense: { bg: 'bg-expense', text: 'text-expense' },
  income: { bg: 'bg-income', text: 'text-income' },
  saving: { bg: 'bg-brand', text: 'text-brand' },
};

/** Орлого / зарлага / хуримтлал бүртгэх цонх (дугаарын keypad-тай). */
export function AddSheet({ target, onClose }: { target: AddTarget; onClose: () => void }) {
  return (
    <Sheet open={!!target} onClose={onClose}>
      {/* key: цонх нээгдэх бүрт state-ийг шинэчилнэ */}
      {target && (
        <AddForm key={`${target.kind}-${target.categoryId}-${target.withdraw}`} target={target} onClose={onClose} />
      )}
    </Sheet>
  );
}

function AddForm({ target, onClose }: { target: NonNullable<AddTarget>; onClose: () => void }) {
  const { state, month, addTransaction } = useStore();
  const { kind, withdraw = false } = target;
  const options = state.categories.filter((c) => c.kind === kind);

  const [categoryId, setCategoryId] = useState(target.categoryId ?? options[0]?.id ?? '');
  const [digits, setDigits] = useState('');
  const [note, setNote] = useState('');
  // Өөр сар сонгогдсон бол тэр сарын 1-ний өдрөөр эхлүүлнэ.
  const [date, setDate] = useState(() => (todayKey().startsWith(month) ? todayKey() : `${month}-01`));

  const category = state.categories.find((c) => c.id === categoryId);
  const amount = Number(digits || '0');
  const tone = withdraw ? TONE.expense : TONE[kind];
  const canSave = amount > 0 && !!categoryId;

  const press = (k: (typeof KEYS)[number]) => {
    if (k === 'del') return setDigits((d) => d.slice(0, -1));
    setDigits((d) => {
      const next = (d + k).replace(/^0+/, '');
      return next.length > 12 ? d : next;
    });
  };

  const save = () => {
    if (!canSave) return;
    addTransaction({ kind, categoryId, amount: withdraw ? -amount : amount, date, note: note.trim() });
    onClose();
  };

  // Компьютерийн гарнаас тоо бичих: 0-9, Backspace, Enter (тэмдэглэл бичиж байхад биш).
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.key === 'Enter') saveRef.current();
        return;
      }
      if (/^\d$/.test(e.key)) {
        setDigits((d) => {
          const next = (d + e.key).replace(/^0+/, '');
          return next.length > 12 ? d : next;
        });
      } else if (e.key === 'Backspace') {
        setDigits((d) => d.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        saveRef.current();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = withdraw ? 'Хуримтлалаас мөнгө хасах' : (category?.name ?? 'Бүртгэл нэмэх');
  const showPicker = !target.categoryId || withdraw;

  return (
    <>
      <div className="overflow-y-auto px-5">
        <div className="flex items-center">
          <button onClick={onClose} aria-label="Хаах" className="size-10 text-ink-muted">
            <X size={26} />
          </button>
          <h3 className="flex-1 text-center text-lg font-semibold text-ink">{title}</h3>
          <div className="w-10" />
        </div>

        {showPicker && (
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
            {options.map((c) => {
              const on = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-sm ${on ? 'border-transparent bg-navy text-white' : 'border-gray-200 bg-white text-ink'}`}>
                  {c.emoji} {c.name}
                </button>
              );
            })}
          </div>
        )}

        <p className={`my-5 truncate text-center text-5xl font-bold ${amount ? tone.text : 'text-gray-400'}`}>
          {money(amount)}
        </p>

        <div className={`flex items-center gap-4 border-b border-surface py-3 ${tone.text}`}>
          <CalendarDays size={26} />
          <span className="flex-1 text-ink">Хэзээ</span>
          <button onClick={() => setDate((d) => shiftDateKey(d, -1))} aria-label="Өмнөх өдөр" className="text-gray-600">
            <ChevronLeft size={22} />
          </button>
          <span className="min-w-[110px] text-center text-ink">{dateLabel(date)}</span>
          <button
            onClick={() => setDate((d) => (d < todayKey() ? shiftDateKey(d, 1) : d))}
            aria-label="Дараагийн өдөр"
            className="text-gray-600">
            <ChevronRight size={22} />
          </button>
        </div>

        <label className={`flex items-center gap-4 border-b border-surface ${tone.text}`}>
          <PencilLine size={26} />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Тэмдэглэл бичих"
            className="flex-1 py-3 text-base text-ink outline-none placeholder:text-gray-400"
          />
        </label>

        <button
          onClick={save}
          disabled={!canSave}
          className={`my-5 w-full rounded-full py-4 text-lg font-semibold text-white ${tone.bg} ${canSave ? 'active:opacity-80' : 'opacity-40'}`}>
          Хадгалах
        </button>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-2 bg-gray-200 p-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            onContextMenu={(e) => {
              if (k === 'del') {
                e.preventDefault();
                setDigits('');
              }
            }}
            aria-label={k === 'del' ? 'Устгах' : k}
            className={`grid h-14 place-items-center rounded-xl text-2xl text-ink select-none active:bg-gray-300 ${k === 'del' ? '' : 'bg-white'}`}>
            {k === 'del' ? <Delete size={28} /> : k}
          </button>
        ))}
      </div>
    </>
  );
}
