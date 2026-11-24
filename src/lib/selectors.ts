import { monthOf } from './format';
import type { AppState, Kind, Transaction } from './types';

export const inMonth = (txs: Transaction[], month: string) =>
  txs.filter((t) => monthOf(t.date) === month);

export const sumKind = (txs: Transaction[], kind: Kind) =>
  txs.reduce((s, t) => (t.kind === kind ? s + t.amount : s), 0);

export function byCategory(txs: Transaction[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of txs) out[t.categoryId] = (out[t.categoryId] ?? 0) + t.amount;
  return out;
}

const until = (txs: Transaction[], month: string) => txs.filter((t) => monthOf(t.date) <= month);

/** Сонгосон сарын эцэс хүртэлх нийт хуримтлал. */
export const savingsUntil = (state: AppState, month: string) =>
  sumKind(until(state.transactions, month), 'saving');

/** Орлого − зарлага − хуримтлал, эхний үлдэгдлийг нэмээд. */
export function netUntil(state: AppState, month: string) {
  const txs = until(state.transactions, month);
  return sumKind(txs, 'income') - sumKind(txs, 'expense') - sumKind(txs, 'saving');
}

export const balanceUntil = (state: AppState, month: string) =>
  state.profile.openingBalance + netUntil(state, month);

/** Сарын эхний `day` өдрийн дүн. */
export const sumKindUpToDay = (txs: Transaction[], kind: Kind, day: number) =>
  txs.reduce(
    (s, t) => (t.kind === kind && Number(t.date.slice(8, 10)) <= day ? s + t.amount : s),
    0
  );

export const sortRecent = (txs: Transaction[]) =>
  [...txs].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date < a.date ? -1 : 1));
