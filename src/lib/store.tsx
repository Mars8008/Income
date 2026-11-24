'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { PALETTE, initialState } from './defaults';
import { currentMonth, newId, shiftMonthKey } from './format';
import { netUntil } from './selectors';
import type { AppState, Category, DebtType, Kind, Transaction } from './types';

/** Өмнөх хувилбарын (зөвхөн browser-т хадгалдаг байсан) өгөгдөл. Анх нэвтрэхэд серверт шилжүүлнэ. */
const LEGACY_KEY = 'income-app/v1';
const SAVE_DELAY_MS = 600;

export type SyncStatus = 'saved' | 'saving' | 'error';

type Actions = {
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: { name: string; emoji: string; kind: Kind }) => void;
  deleteCategory: (id: string) => void;
  setBudget: (month: string, categoryId: string, amount: number) => void;
  /** Сонгосон сарын эцсийн үлдэгдлийг `value` болгож эхний үлдэгдлийг тохируулна. */
  setBalance: (month: string, value: number) => void;
  setName: (name: string) => void;
  addDebt: (d: { type: DebtType; person: string; amount: number; note: string }) => void;
  toggleDebt: (id: string) => void;
  deleteDebt: (id: string) => void;
  resetAll: () => void;
  logout: () => Promise<void>;
};

type Store = Actions & {
  state: AppState;
  email: string;
  sync: SyncStatus;
  month: string;
  shiftMonth: (delta: number) => void;
  categoryById: (id: string) => Category | undefined;
};

const Ctx = createContext<Store | null>(null);

type ServerState = { email: string; data: AppState | null; version: number };

function readLegacy(): AppState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? { ...initialState(), ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [email, setEmail] = useState('');
  const [month, setMonth] = useState('');
  const [sync, setSync] = useState<SyncStatus>('saved');
  const [loadError, setLoadError] = useState(false);

  const version = useRef(0);
  /** Серверээс ирсэн state (үүнийг дахин хадгалах шаардлагагүй). */
  const fromServer = useRef<AppState | null>(null);
  /** Хадгалахаар хүлээгдэж буй өөрчлөлт байгаа эсэх. */
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  const toLogin = () => window.location.replace('/login');

  const load = useCallback(async () => {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (res.status === 401) return toLogin();
    if (!res.ok) throw new Error(String(res.status));
    const body = (await res.json()) as ServerState;
    setEmail(body.email);
    version.current = body.version;
    if (body.data) {
      const next = { ...initialState(), ...body.data };
      fromServer.current = next;
      setState(next);
    } else {
      // Серверт хоосон: хуучин browser-ийн өгөгдлийг (байвал) шилжүүлж, эсвэл шинээр эхэлнэ.
      const legacy = readLegacy();
      const fresh = legacy ?? initialState();
      if (!legacy) fresh.profile.name = body.email.split('@')[0];
      setState(fresh);
    }
  }, []);

  // Анхны ачаалалт
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-ийн цагаас сарыг тооцно
    setMonth(currentMonth());
    load().catch(() => setLoadError(true));
  }, [load]);

  // Өөрчлөлт бүрийн дараа хүлээгээд серверт хадгална.
  const save = useCallback(async (data: AppState) => {
    saving.current = true;
    setSync('saving');
    try {
      const res = await fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, version: version.current }),
      });
      if (res.status === 401) return toLogin();
      if (res.status === 409) {
        // Өөр төхөөрөмж дээр өөрчлөгдсөн: серверийн хувилбарыг авна.
        const body = (await res.json()) as ServerState;
        version.current = body.version;
        if (body.data) {
          const next = { ...initialState(), ...body.data };
          fromServer.current = next;
          setState(next);
        }
        alert('Өөр төхөөрөмж дээр өөрчлөлт орсон тул шинэчиллээ. Сүүлийн өөрчлөлтөө дахин оруулна уу.');
        setSync('saved');
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      version.current = ((await res.json()) as { version: number }).version;
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {}
      setSync('saved');
    } catch {
      setSync('error');
    } finally {
      saving.current = false;
    }
  }, []);

  const latest = useRef<AppState | null>(null);
  useEffect(() => {
    latest.current = state;
    if (!state || state === fromServer.current) return;
    pending.current = true;
    // Хадгалалтыг дараалалд оруулна: өмнөх хадгалалт дуусаагүй бол хүлээнэ (version зөрөхгүй).
    const flush = () => {
      if (saving.current) {
        timer.current = setTimeout(flush, 300);
        return;
      }
      pending.current = false;
      if (latest.current) save(latest.current);
    };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY_MS);
  }, [state, save]);

  // Апп руу буцаж ороход (өөр төхөөрөмж дээр өөрчилсөн байж магадгүй) шинэчилнэ.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !pending.current && !saving.current) {
        load().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  // Хадгалаагүй өөрчлөлттэй үед хуудсыг хаахаас сэрэмжлүүлнэ.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (pending.current || saving.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, []);

  const store = useMemo<Store | null>(() => {
    if (!state) return null;
    const update = (fn: (s: AppState) => AppState) => setState((s) => (s ? fn(s) : s));
    return {
      state,
      email,
      sync,
      month,
      shiftMonth: (delta) => setMonth((m) => shiftMonthKey(m, delta)),
      categoryById: (id) => state.categories.find((c) => c.id === id),

      addTransaction: (t) =>
        update((s) => ({
          ...s,
          transactions: [...s.transactions, { ...t, id: newId(), createdAt: Date.now() }],
        })),
      deleteTransaction: (id) =>
        update((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) })),

      addCategory: ({ name, emoji, kind }) =>
        update((s) => {
          const count = s.categories.filter((c) => c.kind === kind).length;
          const cat: Category = { id: newId(), name, emoji, kind, color: PALETTE[count % PALETTE.length] };
          return { ...s, categories: [...s.categories, cat] };
        }),
      deleteCategory: (id) =>
        update((s) => ({
          ...s,
          categories: s.categories.filter((c) => c.id !== id),
          transactions: s.transactions.filter((t) => t.categoryId !== id),
        })),

      setBudget: (m, categoryId, amount) =>
        update((s) => ({
          ...s,
          budgets: { ...s.budgets, [m]: { ...s.budgets[m], [categoryId]: amount } },
        })),
      setBalance: (m, value) =>
        update((s) => ({ ...s, profile: { ...s.profile, openingBalance: value - netUntil(s, m) } })),
      setName: (name) => update((s) => ({ ...s, profile: { ...s.profile, name } })),

      addDebt: (d) =>
        update((s) => ({
          ...s,
          debts: [...s.debts, { ...d, id: newId(), settled: false, createdAt: Date.now() }],
        })),
      toggleDebt: (id) =>
        update((s) => ({
          ...s,
          debts: s.debts.map((d) => (d.id === id ? { ...d, settled: !d.settled } : d)),
        })),
      deleteDebt: (id) => update((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) })),

      resetAll: () => update((s) => ({ ...initialState(), profile: { ...initialState().profile, name: s.profile.name } })),

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        toLogin();
      },
    };
  }, [state, email, sync, month]);

  if (loadError) {
    return (
      <div className="grid min-h-dvh place-items-center px-8 text-center">
        <div>
          <p className="text-lg font-semibold text-ink">Сервертэй холбогдож чадсангүй</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-brand px-6 py-3 font-semibold text-white">
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  if (!store || !month) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="size-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
      </div>
    );
  }

  return (
    <Ctx.Provider value={store}>
      {children}
      {sync === 'error' && (
        <button
          onClick={() => save(store.state)}
          className="fixed inset-x-4 top-[calc(env(safe-area-inset-top)+8px)] z-40 mx-auto max-w-sm rounded-2xl bg-expense px-4 py-3 text-sm font-semibold text-white shadow-lg">
          Хадгалж чадсангүй. Дахин оролдох бол энд дарна уу.
        </button>
      )}
    </Ctx.Provider>
  );
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
