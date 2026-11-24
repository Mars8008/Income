import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';

import './globals.css';

const font = Manrope({ variable: '--font-app', subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Nomio',
  description: 'Өдөр тутмын орлого, зарлага, төсөв, хуримтлалаа хянах',
  icons: { icon: '/icon.svg' },
  appleWebApp: { capable: true, title: 'Nomio', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#14b2ec',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="mn" className={`${font.variable} antialiased`}>
      <body className="font-sans">
        <div className="relative mx-auto min-h-dvh max-w-md bg-surface">{children}</div>
      </body>
    </html>
  );
}
