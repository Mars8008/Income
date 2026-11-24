import { BottomNav } from '@/components/bottom-nav';
import { StoreProvider } from '@/lib/store';

/** Нэвтэрсэн хэрэглэгчийн хуудсууд: өгөгдлийн store + доод цэс. */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <StoreProvider>
      <div className="pb-24">
        {children}
        <BottomNav />
      </div>
    </StoreProvider>
  );
}
