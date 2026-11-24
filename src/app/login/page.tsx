'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.replace('/');
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? 'Алдаа гарлаа');
    } catch {
      setError('Сервертэй холбогдож чадсангүй');
    }
    setBusy(false);
  };

  const input =
    'w-full rounded-2xl bg-surface px-4 py-4 text-base text-ink outline-none ring-brand placeholder:text-gray-400 focus:ring-2';

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-safe rounded-b-[36px] bg-brand px-6 pb-10 text-center">
        <div className="mx-auto mt-10 grid size-20 place-items-center rounded-3xl bg-white text-4xl font-bold text-brand shadow-lg">
          $
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white">Nomio</h1>
        <p className="mt-1 text-white/80">Орлого, зарлага, төсвөө нэг дор</p>
      </header>

      <main className="flex-1 px-6 pt-8">
        <div className="mb-6 flex rounded-full bg-white p-1">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`flex-1 rounded-full py-2.5 font-semibold transition-colors ${mode === m ? 'bg-brand text-white' : 'text-ink-muted'}`}>
              {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Имэйл хаяг"
            className={input}
          />
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Нууц үг (8+ тэмдэгт)' : 'Нууц үг'}
              className={`${input} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Нууц үг нуух' : 'Нууц үг харах'}
              className="absolute inset-y-0 right-3 grid place-items-center text-ink-muted">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="rounded-xl bg-expense-soft px-4 py-3 text-sm text-expense">{error}</p>}

          <button
            disabled={busy}
            className="mt-2 rounded-full bg-brand py-4 text-lg font-semibold text-white active:opacity-80 disabled:opacity-50">
            {busy ? 'Түр хүлээнэ үү…' : mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>
        </form>
      </main>
    </div>
  );
}
