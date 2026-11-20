"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  CloudSun,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import {
  authApi,
  clearAuthSession,
  getAuthToken,
  getStoredUser,
} from "@/lib/api";
import type { User } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncAuth = async () => {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
      const token = getAuthToken();
      if (token) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
        } catch {
          // Biarkan fallback profil jika token kedaluwarsa atau backend belum jalan
        }
      } else {
        setUser(null);
      }
    };

    syncAuth();
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("fira-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("fira-auth-change", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.push("/login");
  };

  const menuUtama = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Transaksi", href: "/transactions", icon: Receipt },
    { label: "Budgeting", href: "/budgeting", icon: Wallet },
    { label: "Financial Goals", href: "/financial-goals", icon: Target },
  ];

  const aiIntelligence = [
    { label: "AI Smart Auditor", href: "/smart-auditor", icon: ShieldCheck },
    { label: "AI Financial Twin", href: "/financial-twin", icon: Bot },
    { label: "What-If Simulator", href: "/what-if-simulator", icon: SlidersHorizontal },
    { label: "Financial Weather", href: "/financial-weather", icon: CloudSun },
  ];

  const displayName = user?.name || "User Account";
  const displayEmail = user?.email || "user@fira.ai";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <Link href="/" className="brand" style={{ padding: "0 10px 28px", display: "inline-flex", textDecoration: "none" }}>
        <Image
          src="/FIRA-Logo-Full-Vector.svg"
          alt="FIRA Logo"
          width={150}
          height={57}
          priority
          style={{ height: "auto", width: "150px", objectFit: "contain" }}
        />
      </Link>

      {/* Menu Utama */}
      <div className="nav-section">
        <div className="nav-caption">MENU UTAMA</div>
        {menuUtama.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* AI Intelligence */}
      <div className="nav-section">
        <div className="nav-caption">AI INTELLIGENCE</div>
        {aiIntelligence.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Profile & Action Bottom */}
      <div className="sidebar-bottom">
        <div className="profile">
          <div className="avatar">{avatarInitial}</div>
          <div>
            <strong>{displayName}</strong>
            <small>{displayEmail}</small>
          </div>
        </div>
        <Link
          href={user ? "/" : "/login"}
          className="nav-link"
          style={{ width: "100%", border: 0, background: "transparent" }}
        >
          <UserIcon size={18} />
          <span>{user ? "Pengaturan" : "Masuk Akun"}</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="nav-link"
          style={{ width: "100%", border: 0, background: "transparent", color: "var(--red)" }}
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
