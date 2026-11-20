import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIRA — Financial Intelligence & Recommendation Assistant',
  description: 'Asisten keuangan pribadi untuk memahami, mengelola, dan merencanakan kondisi finansial.',
  icons: {
    icon: '/FIRA-Logo-Full-Vector.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
