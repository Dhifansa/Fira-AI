import { Bell, Search } from "lucide-react";
import Sidebar from "@/components/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      {/* Sidebar Navigasi Kiri */}
      <Sidebar />

      {/* Area Konten Utama Kanan */}
      <main className="main-area">
        {/* Topbar / Header */}
        <header className="topbar">
          <div>
            <div className="eyebrow">PERSONAL FINANCE</div>
            <strong>Financial overview</strong>
          </div>

          <div className="top-actions">
            <button className="icon-button" aria-label="Cari">
              <Search size={18} />
            </button>
            <button className="icon-button" aria-label="Notifikasi">
              <Bell size={18} />
            </button>
            <div className="avatar">U</div>
          </div>
        </header>

        {/* Isi Halaman */}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;