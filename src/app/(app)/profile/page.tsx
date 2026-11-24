'use client';

import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
  Info,
  LogOut,
  Trash2,
  UserPen,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar } from '@/components/header';
import { Dialog } from '@/components/ui';
import { money } from '@/lib/format';
import { useStore } from '@/lib/store';
import type { DebtType } from '@/lib/types';

const HELP = [
  'Санхүү цэснээс ангилал дээр дарж орлого, зарлага бүртгэнэ.',
  'Бүртгэл дээр дарж устгана. Ангиллыг "Засах" товчоор устгана.',
  'Төсөв цэснээс ангилал бүрт сарын төсөв тавина.',
  'Үлдэгдэл карт дээр дарж эхний үлдэгдлээ оруулна.',
  'Өгөгдөл таны бүртгэлд хадгалагдах тул утас, компьютер аль алинаас нь нэвтэрч харж болно.',
];

export default function ProfilePage() {
  const { state, email, resetAll, logout } = useStore();
  const [nameOpen, setNameOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const debtTotal = (type: DebtType) =>
    state.debts.filter((d) => d.type === type && !d.settled).reduce((s, d) => s + d.amount, 0);

  return (
    <>
      <header className="pt-safe rounded-b-[28px] bg-brand px-6 pb-8">
        <div className="flex items-center gap-5 pt-6">
          <Avatar size={76} />
          <div className="min-w-0">
            <p className="truncate text-2xl font-bold text-white">{state.profile.name}</p>
            <p className="mt-1 truncate text-sm text-white/80">{email}</p>
            <p className="text-sm text-white/80">{state.transactions.length} бүртгэл хийсэн байна</p>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-4 px-4 pt-5">
        <div className="rounded-3xl bg-white p-2">
          <Row Icon={ArrowDownCircle} title="Авлага" subtitle={money(debtTotal('receivable'))} href="/debts/receivable" />
          <Row Icon={ArrowUpCircle} title="Өглөг" subtitle={money(debtTotal('payable'))} href="/debts/payable" />
        </div>

        <div className="rounded-3xl bg-white p-2">
          <Row Icon={UserPen} title="Нэр өөрчлөх" onClick={() => setNameOpen(true)} />
          <Row Icon={Info} title="Апп ашиглах заавар" onClick={() => setHelpOpen(true)} />
          <Row
            Icon={Trash2}
            title="Бүх өгөгдөл устгах"
            danger
            onClick={() => {
              if (confirm('Бүх бүртгэл, төсөв, ангилал анхны байдалдаа орно. Буцаах боломжгүй. Үргэлжлүүлэх үү?')) {
                resetAll();
              }
            }}
          />
          <Row Icon={LogOut} title="Гарах" danger onClick={() => logout()} />
        </div>

        <p className="text-center text-xs text-ink-muted">Nomio · Хувилбар 1.0.0</p>
      </main>

      <NameDialog open={nameOpen} onClose={() => setNameOpen(false)} />
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Заавар">
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink">
          {HELP.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}

function Row({
  Icon,
  title,
  subtitle,
  danger = false,
  href,
  onClick,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  danger?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <Icon size={28} strokeWidth={1.6} className={danger ? 'text-expense' : 'text-gray-600'} />
      <span className="flex-1">
        <span className={`block font-semibold ${danger ? 'text-expense' : 'text-ink'}`}>{title}</span>
        {subtitle && <span className="block text-sm text-ink-muted">{subtitle}</span>}
      </span>
      <ChevronRight size={20} className="text-gray-400" />
    </>
  );
  const cls = 'flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left active:bg-surface';
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

function NameDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Таны нэр">
      {open && <NameForm onClose={onClose} />}
    </Dialog>
  );
}

function NameForm({ onClose }: { onClose: () => void }) {
  const { state, setName } = useStore();
  const [text, setText] = useState(state.profile.name);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) setName(text.trim());
        onClose();
      }}>
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-4 text-center text-xl text-ink outline-none focus:border-brand"
      />
      <button className="mt-5 w-full py-2 text-lg font-semibold text-brand">Хадгалах</button>
    </form>
  );
}
