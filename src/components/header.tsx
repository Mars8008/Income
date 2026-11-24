'use client';

import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { monthLabel } from '@/lib/format';
import { useStore } from '@/lib/store';

export function MonthSwitcher() {
  const { month, shiftMonth } = useStore();
  return (
    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 p-2">
      <button
        onClick={() => shiftMonth(-1)}
        aria-label="Өмнөх сар"
        className="grid size-11 place-items-center rounded-xl bg-white/20 text-white active:opacity-60">
        <ChevronLeft size={22} />
      </button>
      <div className="grid h-11 flex-1 place-items-center rounded-xl bg-navy font-semibold text-white">
        {monthLabel(month)}
      </div>
      <button
        onClick={() => shiftMonth(1)}
        aria-label="Дараагийн сар"
        className="grid size-11 place-items-center rounded-xl bg-white/20 text-white active:opacity-60">
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

export function Avatar({ size = 56 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full border-2 border-white/70 bg-white"
      style={{ width: size, height: size, fontSize: size * 0.55 }}>
      🧑‍💼
    </div>
  );
}

/** Хөх өнгийн дээд хэсэг: мэндчилгээ + сар сонгогч + нэмэлт агуулга. */
export function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="pt-safe rounded-b-[28px] bg-brand px-4 pb-5">
      <div className="flex items-center gap-3 pt-4">
        <Avatar />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-bold text-white">Nomio</p>
          <p className="text-sm text-white/80">Санхүүгээ хянацгаая 💪</p>
        </div>
      </div>
      <MonthSwitcher />
      {children}
    </header>
  );
}

/** Буцах товчтой энгийн дээд хэсэг. */
export function BackHeader({ title, children }: { title: string; children?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="pt-safe rounded-b-[28px] bg-brand px-4 pb-5">
      <div className="flex h-12 items-center pt-4">
        <button
          onClick={() => router.back()}
          aria-label="Буцах"
          className="grid size-11 place-items-center rounded-xl border border-white/40 text-white active:opacity-60">
          <ArrowLeft size={22} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-white">{title}</h1>
        <div className="w-11" />
      </div>
      {children}
    </header>
  );
}
