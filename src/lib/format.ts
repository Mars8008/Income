export function money(n: number): string {
  const sign = n < 0 ? '-' : '';
  const s = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${s}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function monthOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function currentMonth(): string {
  return monthOf(todayKey());
}

export function shiftMonthKey(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${y} оны ${m}-р сар`;
}

export function shiftDateKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, d + delta));
}

export function dateLabel(dateKey: string): string {
  const today = todayKey();
  if (dateKey === today) return 'Өнөөдөр';
  if (dateKey === shiftDateKey(today, -1)) return 'Өчигдөр';
  const [, m, d] = dateKey.split('-').map(Number);
  return `${m}-р сарын ${d}`;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** "12,500" гэх мэт оролтоос тоо гаргана. */
export function parseAmount(s: string): number {
  const n = Number(s.replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
