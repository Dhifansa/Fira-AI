"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  Plus,
  Cloud,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Briefcase,
  ShoppingCart,
  Zap,
  Car,
} from "lucide-react";
import AddTransactionModal from "@/components/modals/AddTransactionModals";
import { getAuthToken, transactionApi } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/format";
import type { TransactionItem } from "@/types";

function getDashboardTxIcon(categoryName: string, type: string) {
  const lower = categoryName.toLowerCase();
  if (type === "income") {
    return lower.includes("sampingan") ? (
      <Zap size={18} />
    ) : (
      <Briefcase size={18} />
    );
  }
  if (lower.includes("transport") || lower.includes("tagihan")) {
    return <Car size={18} />;
  }
  return <ShoppingCart size={18} />;
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("November 2026");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadDashboardData = useCallback(async () => {
    await Promise.resolve();
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setTransactions([]);
      return;
    }

    setIsAuthenticated(true);
    try {
      const list = await transactionApi.getAll();
      setTransactions(list);
    } catch {
      // Gunakan fallback tampilan jika gagal mengambil data
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      void loadDashboardData();
    };
    handleSync();
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [loadDashboardData]);

  const dashboardMetrics = useMemo(() => {
    if (!isAuthenticated || transactions.length === 0) {
      return {
        income: 0,
        expense: 0,
        netCashflow: 0,
        distribution: [
          { name: "Belum Ada Pengeluaran", pct: 0, amountLabel: "Rp 0" },
        ],
      };
    }

    let income = 0;
    let expense = 0;
    const byCategory: Record<string, number> = {};

    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "income") {
        income += amt;
      } else {
        expense += amt;
        byCategory[tx.category_name] =
          (byCategory[tx.category_name] || 0) + amt;
      }
    }

    const sortedCats = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, amt]) => ({
        name,
        pct: expense > 0 ? Math.round((amt / expense) * 100) : 0,
        amountLabel: formatRupiah(amt),
      }));

    return {
      income,
      expense,
      netCashflow: income - expense,
      distribution:
        sortedCats.length > 0
          ? sortedCats
          : [
              { name: "Belum Ada Pengeluaran", pct: 0, amountLabel: "Rp 0" },
            ],
    };
  }, [isAuthenticated, transactions]);

  return (
    <>
      {/* Top Bar / Quick Filter Contextual Bar */}
      <div className="dashboard-top-bar">
        <div className="filter-section">
          <div className="period-selector">
            <span className="period-label">Periode</span>
            <select
              className="period-dropdown"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="November 2026">November 2026</option>
              <option value="Oktober 2026">Oktober 2026</option>
              <option value="September 2026">September 2026</option>
            </select>
          </div>
          <div className="filter-buttons">
            <button className="filter-btn" type="button">
              <Filter size={16} />
              Semua kategori
            </button>
            <button className="filter-btn" type="button">
              Semua akun
            </button>
          </div>
        </div>
        <button
          className="quick-add-btn"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} />
          Tambah transaksi
        </button>
      </div>

      {/* Primary Metrics Overview - 3 Cards */}
      <div className="metrics-overview">
        <div className="metric-card income-card">
          <div className="metric-header">
            <div className="metric-icon income-icon">
              <TrendingUp size={20} />
            </div>
            <span className="metric-label">Pemasukan</span>
          </div>
          <div className="metric-amount">
            {formatRupiah(dashboardMetrics.income)}
          </div>
          <div className="metric-change positive">
            <TrendingUp size={14} />
            <span>+12% dari bulan lalu</span>
          </div>
          <div className="metric-period">{selectedPeriod}</div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-header">
            <div className="metric-icon expense-icon">
              <TrendingDown size={20} />
            </div>
            <span className="metric-label">Pengeluaran</span>
          </div>
          <div className="metric-amount">
            {formatRupiah(dashboardMetrics.expense)}
          </div>
          <div className="metric-change negative">
            <TrendingDown size={14} />
            <span>-8% dari bulan lalu</span>
          </div>
          <div className="metric-period">{selectedPeriod}</div>
        </div>

        <div className="metric-card cashflow-card">
          <div className="metric-header">
            <div className="metric-icon cashflow-icon">
              <Activity size={20} />
            </div>
            <span className="metric-label">Arus Kas Bersih</span>
          </div>
          <div className="metric-amount positive-amount">
            {formatRupiah(dashboardMetrics.netCashflow)}
          </div>
          <div className="cashflow-status">
            <span className="status-badge positive">
              {dashboardMetrics.netCashflow >= 0 ? "Sehat" : "Defisit"}
            </span>
            <span className="status-text">
              {dashboardMetrics.netCashflow >= 0
                ? "Kondisi keuangan baik"
                : "Pengeluaran melampaui pemasukan"}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Section: Financial Weather & AI Auditor */}
      <div className="bento-section">
        <div className="weather-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <Cloud size={20} className="widget-icon" />
              <h3>Financial Weather</h3>
            </div>
            <Link href="/financial-weather" className="view-detail-btn">
              Lihat detail
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="weather-status">
            <div className="weather-main">
              <div className="weather-emoji">
                {transactions.length === 0 ? "☁️" : dashboardMetrics.netCashflow >= 0 ? "☀️" : "🌧️"}
              </div>
              <div className="weather-info">
                <div className="weather-condition">
                  {transactions.length === 0
                    ? "Belum Ada Data"
                    : dashboardMetrics.netCashflow >= 0
                    ? "Cerah"
                    : "Perlu Waspada"}
                </div>
                <div className="weather-description">
                  {transactions.length === 0
                    ? "Mulai catat transaksi keuangan Anda"
                    : dashboardMetrics.netCashflow >= 0
                    ? "Keuangan dalam kondisi stabil"
                    : "Pengeluaran melebihi pemasukan"}
                </div>
              </div>
            </div>
            <div className="weather-score">
              <div className="score-value">
                {transactions.length === 0
                  ? 0
                  : dashboardMetrics.netCashflow >= 0
                  ? 85
                  : 45}
              </div>
              <div className="score-label">Skor kesehatan</div>
            </div>
          </div>
          <div className="weather-forecast">
            <div className="forecast-item">
              <span className="forecast-label">Minggu depan</span>
              <span className="forecast-icon">⛅</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">2 minggu</span>
              <span className="forecast-icon">☀️</span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">Bulan depan</span>
              <span className="forecast-icon">🌤️</span>
            </div>
          </div>
        </div>

        <div className="ai-insights-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <Sparkles size={20} className="widget-icon" />
              <h3>AI Intelligence Highlights</h3>
            </div>
            <Link href="/smart-auditor" className="view-detail-btn">
              Lihat semua
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="insights-list">
            <div className="insight-item priority-high">
              <AlertCircle size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">
                  {transactions.length > 0
                    ? `Pos Utama: ${dashboardMetrics.distribution[0]?.name || "-"}`
                    : "Belum ada pengeluaran tercatat (Rp 0)"}
                </div>
                <div className="insight-description">
                  {transactions.length > 0
                    ? `Total pengeluaran pos ini ${dashboardMetrics.distribution[0]?.amountLabel || "Rp 0"} (${dashboardMetrics.distribution[0]?.pct || 0}%).`
                    : "Tambahkan transaksi agar AI dapat menganalisis pengeluaran Anda."}
                </div>
              </div>
            </div>
            <div className="insight-item priority-medium">
              <Sparkles size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">
                  Potensi penghematan {formatRupiah(Math.round(dashboardMetrics.expense * 0.15))}
                </div>
                <div className="insight-description">
                  {dashboardMetrics.expense > 0
                    ? "Estimasi efisiensi 15% dari total pengeluaran berjalan Anda."
                    : "Potensi penghematan akan dihitung otomatis dari pengeluaran Anda."}
                </div>
              </div>
            </div>
            <div className="insight-item priority-low">
              <TrendingUp size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">
                  Arus Kas Bersih: {formatRupiah(dashboardMetrics.netCashflow)}
                </div>
                <div className="insight-description">
                  Pemasukan {formatRupiah(dashboardMetrics.income)} · Pengeluaran{" "}
                  {formatRupiah(dashboardMetrics.expense)}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualisasi Grafik & Distribusi */}
      <div className="grid two-col" style={{ marginBottom: "20px" }}>
        {/* Visualisasi Pemasukan vs Pengeluaran */}
        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Pemasukan vs Pengeluaran</h2>
              <p>Perbandingan real-time cashflow ({selectedPeriod})</p>
            </div>
          </div>
          <div className="chart">
            {[1, 2, 3, 4].map((week) => {
              const maxVal = Math.max(dashboardMetrics.income, dashboardMetrics.expense, 1);
              const incH =
                dashboardMetrics.income > 0
                  ? Math.max(10, Math.round((dashboardMetrics.income / maxVal) * 85))
                  : 4;
              const expH =
                dashboardMetrics.expense > 0
                  ? Math.max(10, Math.round((dashboardMetrics.expense / maxVal) * 85))
                  : 4;
              return (
                <div className="chart-col" key={week}>
                  <div className="bar dark" style={{ height: `${incH}%` }}></div>
                  <div className="bar" style={{ height: `${expH}%` }}></div>
                  <span className="chart-label">Minggu {week}</span>
                </div>
              );
            })}
          </div>
          <div className="legend">
            <div>
              <span className="dot"></span> Pemasukan
            </div>
            <div>
              <span className="dot light"></span> Pengeluaran
            </div>
          </div>
        </div>

        {/* Distribusi Pengeluaran */}
        <div className="card">
          <div className="card-heading">
            <div>
              <h2>Distribusi Pengeluaran</h2>
              <p>Realisasi 4 kategori pengeluaran utama</p>
            </div>
            <span className="pill">100% Tercatat</span>
          </div>
          <div className="category-list" style={{ marginTop: "10px" }}>
            {dashboardMetrics.distribution.map((cat) => (
              <div key={cat.name}>
                <div className="category-row">
                  <span>
                    {cat.name} ({cat.pct}%)
                  </span>
                  <strong>{cat.amountLabel}</strong>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(100, cat.pct)}%` }}></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terakhir */}
      <div className="card">
        <div className="card-heading">
          <div>
            <h2>Transaksi Terakhir</h2>
            <p>
              Aktivitas keuangan periode {selectedPeriod} yang telah diaudit
            </p>
          </div>
          <Link
            href="/transactions"
            className="secondary-button"
            style={{ padding: "6px 12px" }}
          >
            Lihat Semua Transaksi
          </Link>
        </div>

        {isAuthenticated && transactions.length > 0 ? (
          <div className="transaction-list">
            {transactions.slice(0, 5).map((tx) => (
              <div className="transaction-row" key={tx.transaction_id}>
                <div className="transaction-icon">
                  {getDashboardTxIcon(tx.category_name, tx.type)}
                </div>
                <div className="transaction-info">
                  <strong>{tx.description || tx.category_name}</strong>
                  <small>
                    {formatDate(tx.transaction_date)} · {tx.category_name}
                  </small>
                </div>
                <div
                  className={`amount ${
                    tx.type === "income" ? "income" : "expense"
                  }`}
                >
                  {tx.type === "income" ? "+ " : "- "}
                  {formatRupiah(Number(tx.amount))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            Belum ada transaksi tercatat (Rp 0). Klik tombol &ldquo;+ Tambah transaksi&rdquo; di atas untuk mulai mencatat keuangan Anda.
          </div>
        )}
      </div>

      {/* Modal Tambah Transaksi */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </>
  );
}
