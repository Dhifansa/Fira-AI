"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Target,
  ShieldCheck,
  Bot,
  SlidersHorizontal,
  CloudSun,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={20} />
        </div>
        <div>
          FIRA
          <small>V1.0 MVP</small>
        </div>
      </div>

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
          <div className="avatar">U</div>
          <div>
            <strong>User Account</strong>
            <small>user@fira.ai</small>
          </div>
        </div>
        <button className="nav-link" style={{ width: "100%", border: 0, background: "transparent" }}>
          <User size={18} />
          <span>Pengaturan</span>
        </button>
        <button className="nav-link" style={{ width: "100%", border: 0, background: "transparent", color: "var(--red)" }}>
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;