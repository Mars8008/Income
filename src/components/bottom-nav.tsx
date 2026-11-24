'use client';

import { BarChart3, Clock, PieChart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Санхүү', Icon: PieChart },
  { href: '/budget', label: 'Төсөв', Icon: Clock },
  { href: '/report', label: 'Тайлан', Icon: BarChart3 },
  { href: '/profile', label: 'Профайл', Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const isTab = TABS.some((t) => t.href === pathname);
  if (!isTab) return null;

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-gray-200 bg-white">
      <div className="flex">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium ${active ? 'text-brand' : 'text-gray-600'}`}>
              <Icon size={24} strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
