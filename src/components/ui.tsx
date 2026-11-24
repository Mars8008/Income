'use client';

import { ArrowRight, Minus, Plus, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

import { money } from '@/lib/format';
import type { Category } from '@/lib/types';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-semibold text-ink">{title}</h2>
      {right}
    </div>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${pct * 100}%`, backgroundColor: value > 1 ? '#e5534b' : (color ?? '#3fb68b') }}
      />
    </div>
  );
}

/** Ангиллын нэг нүд: emoji, нэр, энэ сарын дүн, "+" товч. Устгах товч нь баруун дээд буланд. */
export function CategoryTile({
  category,
  total,
  onClick,
  onDelete,
  icon = 'add',
}: {
  category: Category;
  total: number;
  onClick: () => void;
  onDelete?: () => void;
  icon?: 'add' | 'arrow';
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="flex h-[72px] w-full items-center gap-2 rounded-2xl bg-white pl-3 pr-2.5 text-left active:opacity-70">
        <span className="text-2xl">{category.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm leading-tight text-ink">{category.name}</span>
          {total !== 0 && <span className="block truncate text-xs text-ink-muted">{money(total)}</span>}
        </span>
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          {icon === 'add' ? <Plus size={16} /> : <ArrowRight size={16} />}
        </span>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={`${category.name} устгах`}
          className="absolute -right-1.5 -top-1.5 hidden size-6 place-items-center rounded-full bg-gray-400 text-white group-data-[editing=true]/grid:grid">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function ActionTile({
  label,
  icon,
  tone = 'brand',
  onClick,
}: {
  label: string;
  icon: 'add' | 'remove';
  tone?: 'brand' | 'expense';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-[72px] items-center justify-between rounded-2xl bg-white px-5 text-left active:opacity-70">
      <span className="text-[15px] text-ink-muted">{label}</span>
      <span
        className={`grid size-9 place-items-center rounded-lg ${tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-expense-soft text-expense'}`}>
        {icon === 'add' ? <Plus size={22} /> : <Minus size={22} />}
      </span>
    </button>
  );
}

export function EmptyText({ text }: { text: string }) {
  return <p className="py-10 text-center text-sm text-ink-muted">{text}</p>;
}

/** Доороос гарч ирэх цонх. */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useLockScroll(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="animate-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="animate-sheet pb-safe relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl bg-white">
        <div className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
        {children}
      </div>
    </div>
  );
}

/** Голд гарах жижиг цонх. */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useLockScroll(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-8">
      <div className="animate-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6">
        <button
          onClick={onClose}
          aria-label="Хаах"
          className="absolute right-4 top-4 text-ink-muted active:opacity-60">
          <X size={22} />
        </button>
        <h3 className="mb-4 text-center text-lg font-semibold text-ink">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function useLockScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lock]);
}
