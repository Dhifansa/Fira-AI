import type { Metadata } from 'next';
import './globals.css'; // 👈 Pastikan nama file CSS ini sama persis dengan nama file CSS kamu (globals.css atau global.css)
import { AppShell } from '@/components/app-shell'; // 👈 Import AppShell di sini

export const metadata: Metadata = {
  title: 'FIRA — Financial Intelligence & Recommendation Assistant',
  description: 'Asisten keuangan pribadi untuk memahami, mengelola, dan merencanakan kondisi finansial.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {/* Bungkus children dengan AppShell di sini */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}