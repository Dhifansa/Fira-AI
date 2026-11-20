"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { getStoredUser } from "@/lib/api";
import type { User } from "@/types";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    Promise.resolve().then(handleAuthChange);
    window.addEventListener("fira-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("fira-auth-change", handleAuthChange);
    };
  }, []);

  const avatarInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";

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
            <Link
              href={user ? "/" : "/login"}
              className="avatar"
              title={user ? `${user.name} (${user.email})` : "Masuk ke FIRA"}
            >
              {avatarInitial}
            </Link>
          </div>
        </header>

        {/* Isi Halaman */}
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default AppShell;
