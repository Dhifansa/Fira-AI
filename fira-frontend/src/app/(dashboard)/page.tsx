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
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import AddTransactionModal from "@/components/modals/AddTransactionModals";
import { getAuthToken, transactionApi } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/format";
import type { TransactionItem } from "@/types";

const CATEGORY_COLORS = ["#176b52", "#2b9372", "#f2a65a", "#d96b67", "#4f86c6"];

function formatCompactRupiah(amount: number): string {
  const abs = Math.abs(amount);
  if (abs === 0) return "Rp 0";
  if (abs >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${Math.round(amount / 1_000)} Rb`;
  }
  return formatRupiah(amount);
}

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
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [chartViewMode, setChartViewMode] = useState<"weekly" | "monthly">("weekly");
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
      // Biarkan kosong jika gagal mengambil data
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      void loadDashboardData();
    };
    const timer = window.setTimeout(handleSync, 0);
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [loadDashboardData]);

  // Daftar opsi bulan dinamis dari data transaksi yang ada
  const availablePeriods = useMemo(() => {
    const monthSet = new Set<string>();
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    monthSet.add(currentYM);

    for (const tx of transactions) {
      const ymd = String(tx.transaction_date).slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ymd)) {
        monthSet.add(ymd);
      }
    }

    return Array.from(monthSet)
      .sort((a, b) => b.localeCompare(a))
      .map((ym) => {
        const [y, m] = ym.split("-").map(Number);
        const dateObj = new Date(y, (m || 1) - 1, 1);
        const label = dateObj.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
        return { value: ym, label };
      });
  }, [transactions]);

  // Transaksi yang difilter sesuai periode yang dipilih
  const periodTransactions = useMemo(() => {
    if (!isAuthenticated || transactions.length === 0) return [];
    return transactions.filter((tx) => {
      if (selectedPeriod !== "ALL") {
        const ym = String(tx.transaction_date).slice(0, 7);
        if (ym !== selectedPeriod) return false;
      }
      return true;
    });
  }, [isAuthenticated, transactions, selectedPeriod]);

  const displayedTransactions = useMemo(() => {
    if (selectedTypeFilter === "all") return periodTransactions;
    return periodTransactions.filter((tx) => tx.type === selectedTypeFilter);
  }, [periodTransactions, selectedTypeFilter]);

  const dashboardMetrics = useMemo(() => {
    if (!isAuthenticated || periodTransactions.length === 0) {
      return {
        income: 0,
        expense: 0,
        netCashflow: 0,
        incomeCount: 0,
        expenseCount: 0,
        savingsRate: 0,
        expenseRatio: 0,
        dailyAvgExpense: 0,
        distribution: [] as {
          name: string;
          amount: number;
          count: number;
          pct: number;
          amountLabel: string;
          color: string;
        }[],
        weeklySeries: [
          { label: "Minggu 1", subLabel: "Tgl 1–7", income: 0, expense: 0, net: 0 },
          { label: "Minggu 2", subLabel: "Tgl 8–14", income: 0, expense: 0, net: 0 },
          { label: "Minggu 3", subLabel: "Tgl 15–21", income: 0, expense: 0, net: 0 },
          { label: "Minggu 4", subLabel: "Tgl 22–31", income: 0, expense: 0, net: 0 },
        ],
        monthlySeries: [] as {
          label: string;
          subLabel: string;
          income: number;
          expense: number;
          net: number;
        }[],
      };
    }

    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    const byCategory: Record<string, { amount: number; count: number }> = {};

    const weeks = [
      { label: "Minggu 1", subLabel: "Tgl 1–7", income: 0, expense: 0, net: 0 },
      { label: "Minggu 2", subLabel: "Tgl 8–14", income: 0, expense: 0, net: 0 },
      { label: "Minggu 3", subLabel: "Tgl 15–21", income: 0, expense: 0, net: 0 },
      { label: "Minggu 4", subLabel: "Tgl 22–31", income: 0, expense: 0, net: 0 },
    ];

    const byMonthMap = new Map<
      string,
      { label: string; subLabel: string; income: number; expense: number; net: number }
    >();

    for (const tx of periodTransactions) {
      const amt = Number(tx.amount) || 0;
      const dateStr = String(tx.transaction_date).slice(0, 10);
      const dayOfMonth = Number(dateStr.slice(8, 10)) || 1;
      const weekIdx =
        dayOfMonth <= 7 ? 0 : dayOfMonth <= 14 ? 1 : dayOfMonth <= 21 ? 2 : 3;

      const ym = dateStr.slice(0, 7);
      if (!byMonthMap.has(ym)) {
        const [y, m] = ym.split("-").map(Number);
        const dObj = new Date(y || 2026, (m || 1) - 1, 1);
        byMonthMap.set(ym, {
          label: dObj.toLocaleDateString("id-ID", { month: "short" }),
          subLabel: String(y || ""),
          income: 0,
          expense: 0,
          net: 0,
        });
      }
      const mBucket = byMonthMap.get(ym)!;

      if (tx.type === "income") {
        income += amt;
        incomeCount += 1;
        weeks[weekIdx].income += amt;
        mBucket.income += amt;
      } else {
        expense += amt;
        expenseCount += 1;
        weeks[weekIdx].expense += amt;
        mBucket.expense += amt;
        if (!byCategory[tx.category_name]) {
          byCategory[tx.category_name] = { amount: 0, count: 0 };
        }
        byCategory[tx.category_name].amount += amt;
        byCategory[tx.category_name].count += 1;
      }
    }

    for (const w of weeks) {
      w.net = w.income - w.expense;
    }

    const monthlySeries = Array.from(byMonthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([, val]) => ({
        ...val,
        net: val.income - val.expense,
      }));

    const sortedCats = Object.entries(byCategory)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 5)
      .map(([name, info], idx) => ({
        name,
        amount: info.amount,
        count: info.count,
        pct: expense > 0 ? Math.round((info.amount / expense) * 100) : 0,
        amountLabel: formatRupiah(info.amount),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }));

    const netCashflow = income - expense;
    const savingsRate =
      income > 0 ? Math.max(-100, Math.min(100, Math.round((netCashflow / income) * 100))) : 0;
    const expenseRatio =
      income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : expense > 0 ? 100 : 0;

    return {
      income,
      expense,
      netCashflow,
      incomeCount,
      expenseCount,
      savingsRate,
      expenseRatio,
      dailyAvgExpense: Math.round(expense / 30),
      distribution: sortedCats,
      weeklySeries: weeks,
      monthlySeries:
        monthlySeries.length > 0
          ? monthlySeries
          : [{ label: "Bulan Ini", subLabel: "", income, expense, net: netCashflow }],
    };
  }, [isAuthenticated, periodTransactions]);

  const activeSeries =
    chartViewMode === "weekly"
      ? dashboardMetrics.weeklySeries
      : dashboardMetrics.monthlySeries;

  const chartMaxValue = useMemo(() => {
    let max = 0;
    for (const item of activeSeries) {
      if (item.income > max) max = item.income;
      if (item.expense > max) max = item.expense;
    }
    return max;
  }, [activeSeries]);

  const selectedPeriodLabel =
    selectedPeriod === "ALL"
      ? "Semua Periode"
      : availablePeriods.find((p) => p.value === selectedPeriod)?.label || selectedPeriod;

  // Hitung SVG Donut segments untuk Distribusi Pengeluaran
  const donutSegments = useMemo(() => {
    if (dashboardMetrics.distribution.length === 0 || dashboardMetrics.expense <= 0) {
      return [];
    }
    let cumulativePct = 0;
    return dashboardMetrics.distribution.map((cat) => {
      const pct = Math.max(1, cat.pct);
      const startOffset = 25 - cumulativePct;
      cumulativePct += pct;
      return {
        ...cat,
        dashArray: `${pct} ${100 - pct}`,
        dashOffset: startOffset,
      };
    });
  }, [dashboardMetrics.distribution, dashboardMetrics.expense]);

  return (
    <>
      {/* Top Bar / Quick Filter Contextual Bar */}
      <div className="dashboard-top-bar">
        <div className="filter-section">
          <div className="period-selector">
            <span className="period-label">Periode Buku Kas</span>
            <select
              className="period-dropdown"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="ALL">Semua Periode ({transactions.length} Transaksi)</option>
              {availablePeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-buttons">
            <button
              className="filter-btn"
              type="button"
              onClick={() =>
                setSelectedTypeFilter((prev) =>
                  prev === "all" ? "income" : prev === "income" ? "expense" : "all"
                )
              }
              style={
                selectedTypeFilter !== "all"
                  ? {
                      background: "var(--green-soft)",
                      borderColor: "var(--mint)",
                      color: "var(--green)",
                      fontWeight: 700,
                    }
                  : undefined
              }
            >
              <Filter size={16} />
              {selectedTypeFilter === "all"
                ? "Semua Tipe Transaksi"
                : selectedTypeFilter === "income"
                ? "Filter: Pemasukan"
                : "Filter: Pengeluaran"}
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
            <span className="metric-label">Total Pemasukan</span>
          </div>
          <div className="metric-amount">
            {formatRupiah(dashboardMetrics.income)}
          </div>
          <div className="metric-change positive">
            <ArrowDownLeft size={14} />
            <span>{dashboardMetrics.incomeCount} transaksi pemasukan tercatat</span>
          </div>
          <div className="metric-period">{selectedPeriodLabel}</div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-header">
            <div className="metric-icon expense-icon">
              <TrendingDown size={20} />
            </div>
            <span className="metric-label">Total Pengeluaran</span>
          </div>
          <div className="metric-amount" style={{ color: dashboardMetrics.expense > 0 ? "var(--red)" : undefined }}>
            {formatRupiah(dashboardMetrics.expense)}
          </div>
          <div className="metric-change negative">
            <ArrowUpRight size={14} />
            <span>
              {dashboardMetrics.expenseCount} transaksi · Rata-rata{" "}
              {formatCompactRupiah(dashboardMetrics.dailyAvgExpense)}/hari
            </span>
          </div>
          <div className="metric-period">{selectedPeriodLabel}</div>
        </div>

        <div className="metric-card cashflow-card">
          <div className="metric-header">
            <div className="metric-icon cashflow-icon">
              <Activity size={20} />
            </div>
            <span className="metric-label">Arus Kas Bersih (Net)</span>
          </div>
          <div
            className="metric-amount positive-amount"
            style={{
              color:
                dashboardMetrics.netCashflow < 0
                  ? "var(--red)"
                  : dashboardMetrics.netCashflow > 0
                  ? "var(--green)"
                  : "var(--ink)",
            }}
          >
            {formatRupiah(dashboardMetrics.netCashflow)}
          </div>
          <div className="cashflow-status">
            <span
              className={`status-badge ${
                dashboardMetrics.netCashflow >= 0 ? "positive" : ""
              }`}
              style={
                dashboardMetrics.netCashflow < 0
                  ? { background: "#fff0ef", color: "var(--red)" }
                  : undefined
              }
            >
              {periodTransactions.length === 0
                ? "Rp 0"
                : dashboardMetrics.netCashflow >= 0
                ? `Surplus (${dashboardMetrics.savingsRate}% Tabungan)`
                : "Defisit Kas"}
            </span>
            <span className="status-text">
              {periodTransactions.length === 0
                ? "Belum ada transaksi"
                : dashboardMetrics.netCashflow >= 0
                ? "Arus kas positif & aman"
                : "Pengeluaran melebihi pemasukan"}
            </span>
          </div>
        </div>
      </div>

      {/* Visualisasi Grafik Modern: Analisis Pemasukan vs Pengeluaran & Distribusi Kategori */}
      <div
        className="grid two-col"
        style={{
          gridTemplateColumns: "1.45fr 1fr",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* KARTU KIRI: Grafik Modern Pemasukan vs Pengeluaran */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            {/* Header & Mode Switcher */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "18px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <BarChart3 size={18} className="positive" />
                  <h2 style={{ font: "800 17px Manrope", margin: 0 }}>
                    Analisis Arus Kas: Pemasukan vs Pengeluaran
                  </h2>
                </div>
                <p className="muted" style={{ fontSize: "12px" }}>
                  Perbandingan langsung kas masuk, kas keluar, dan rasio tabungan ({selectedPeriodLabel})
                </p>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  background: "#f4f7f5",
                  padding: "3px",
                  borderRadius: "10px",
                  border: "1px solid var(--line)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setChartViewMode("weekly")}
                  style={{
                    border: 0,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: chartViewMode === "weekly" ? "#fff" : "transparent",
                    color: chartViewMode === "weekly" ? "var(--green)" : "var(--muted)",
                    boxShadow: chartViewMode === "weekly" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Per Minggu
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode("monthly")}
                  style={{
                    border: 0,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: chartViewMode === "monthly" ? "#fff" : "transparent",
                    color: chartViewMode === "monthly" ? "var(--green)" : "var(--muted)",
                    boxShadow: chartViewMode === "monthly" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Per Bulan
                </button>
              </div>
            </div>

            {/* Bar Meter Rasio Pemasukan vs Pengeluaran (Cashflow Health Meter) */}
            <div
              style={{
                background: "#f8faf9",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                  Rasio Penggunaan Pendapatan
                </span>
                <span style={{ fontWeight: 700, color: "var(--green)" }}>
                  {periodTransactions.length === 0
                    ? "0% Terpakai · 0% Tersimpan"
                    : `${dashboardMetrics.expenseRatio}% Belanja · ${Math.max(0, dashboardMetrics.savingsRate)}% Tersimpan`}
                </span>
              </div>

              {/* Stacked Dual Progress Bar */}
              <div
                style={{
                  height: "12px",
                  borderRadius: "999px",
                  background: "#e9efec",
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                {periodTransactions.length > 0 && (
                  <>
                    <div
                      title={`Pengeluaran: ${formatRupiah(dashboardMetrics.expense)}`}
                      style={{
                        width: `${dashboardMetrics.expenseRatio}%`,
                        background: "linear-gradient(90deg, #e07a76, #d96b67)",
                        transition: "width 0.35s ease",
                      }}
                    />
                    <div
                      title={`Surplus Tersimpan: ${formatRupiah(Math.max(0, dashboardMetrics.netCashflow))}`}
                      style={{
                        width: `${Math.max(0, 100 - dashboardMetrics.expenseRatio)}%`,
                        background: "linear-gradient(90deg, #176b52, #26a67e)",
                        transition: "width 0.35s ease",
                      }}
                    />
                  </>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--muted)",
                  marginTop: "8px",
                }}
              >
                <span>
                  Kas Masuk: <strong style={{ color: "var(--green)" }}>{formatRupiah(dashboardMetrics.income)}</strong>
                </span>
                <span>
                  Kas Keluar: <strong style={{ color: "var(--red)" }}>{formatRupiah(dashboardMetrics.expense)}</strong>
                </span>
                <span>
                  Sisa Bersih:{" "}
                  <strong
                    style={{
                      color:
                        dashboardMetrics.netCashflow >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {formatRupiah(dashboardMetrics.netCashflow)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Area Grafik Batang Modern dengan Skala Y-Axis & Label Nominal */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "68px 1fr",
                gap: "12px",
                alignItems: "stretch",
                height: "210px",
                paddingTop: "10px",
              }}
            >
              {/* Sumbu Y (Skala Rupiah) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textAlign: "right",
                  fontSize: "10px",
                  color: "var(--muted)",
                  paddingBottom: "34px",
                  fontWeight: 600,
                }}
              >
                <span>{formatCompactRupiah(chartMaxValue)}</span>
                <span>{formatCompactRupiah(chartMaxValue * 0.66)}</span>
                <span>{formatCompactRupiah(chartMaxValue * 0.33)}</span>
                <span>Rp 0</span>
              </div>

              {/* Kolom Grafik */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {/* Garis bantu horizontal */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-around",
                    gap: "16px",
                    borderBottom: "1px solid var(--line)",
                    padding: "0 12px",
                    background:
                      "repeating-linear-gradient(to bottom, #f0f4f2 0, #f0f4f2 1px, transparent 1px, transparent 33.3%)",
                  }}
                >
                  {activeSeries.map((bucket) => {
                    const incPct =
                      chartMaxValue > 0
                        ? Math.max(
                            bucket.income > 0 ? 8 : 2,
                            Math.round((bucket.income / chartMaxValue) * 100)
                          )
                        : 2;
                    const expPct =
                      chartMaxValue > 0
                        ? Math.max(
                            bucket.expense > 0 ? 8 : 2,
                            Math.round((bucket.expense / chartMaxValue) * 100)
                          )
                        : 2;

                    return (
                      <div
                        key={bucket.label}
                        style={{
                          flex: 1,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {/* Bar Pair */}
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          {/* Bar Pemasukan */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              height: "100%",
                              flex: 1,
                              maxWidth: "36px",
                            }}
                          >
                            {bucket.income > 0 && (
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  color: "var(--green)",
                                  marginBottom: "4px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatCompactRupiah(bucket.income)}
                              </span>
                            )}
                            <div
                              title={`Pemasukan ${bucket.label}: ${formatRupiah(bucket.income)}`}
                              style={{
                                width: "100%",
                                height: `${incPct}%`,
                                borderRadius: "8px 8px 2px 2px",
                                background:
                                  bucket.income > 0
                                    ? "linear-gradient(180deg, #229973 0%, #176b52 100%)"
                                    : "#e4ece8",
                                transition: "height 0.35s ease",
                              }}
                            />
                          </div>

                          {/* Bar Pengeluaran */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              height: "100%",
                              flex: 1,
                              maxWidth: "36px",
                            }}
                          >
                            {bucket.expense > 0 && (
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  color: "var(--red)",
                                  marginBottom: "4px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatCompactRupiah(bucket.expense)}
                              </span>
                            )}
                            <div
                              title={`Pengeluaran ${bucket.label}: ${formatRupiah(bucket.expense)}`}
                              style={{
                                width: "100%",
                                height: `${expPct}%`,
                                borderRadius: "8px 8px 2px 2px",
                                background:
                                  bucket.expense > 0
                                    ? "linear-gradient(180deg, #ee8682 0%, #d96b67 100%)"
                                    : "#f3e5e4",
                                transition: "height 0.35s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Label Sumbu X + Selisih Bersih */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    gap: "16px",
                    padding: "8px 12px 0",
                  }}
                >
                  {activeSeries.map((bucket) => (
                    <div
                      key={bucket.label}
                      style={{
                        flex: 1,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--ink)" }}>
                        {bucket.label}
                      </div>
                      <div style={{ fontSize: "9px", color: "var(--muted)" }}>
                        {bucket.subLabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend & Mini Insight Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "14px",
              marginTop: "12px",
              borderTop: "1px solid var(--line)",
              fontSize: "11px",
              color: "var(--muted)",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "3px",
                    background: "var(--green)",
                    display: "inline-block",
                  }}
                />
                Pemasukan (Kas Masuk)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "3px",
                    background: "var(--red)",
                    display: "inline-block",
                  }}
                />
                Pengeluaran (Kas Keluar)
              </span>
            </div>
            <span>
              {periodTransactions.length > 0
                ? `Selisih Bersih: ${formatRupiah(dashboardMetrics.netCashflow)}`
                : "Belum ada transaksi pada periode ini"}
            </span>
          </div>
        </div>

        {/* KARTU KANAN: Komposisi & Distribusi Pengeluaran (Donut Chart + Rincian) */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-heading" style={{ marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <PieChart size={18} className="positive" />
                  <h2 style={{ font: "800 17px Manrope", margin: 0 }}>
                    Komposisi Pengeluaran
                  </h2>
                </div>
                <p className="muted" style={{ fontSize: "12px" }}>
                  Porsi pengeluaran terbesar berdasarkan kategori
                </p>
              </div>
              <span className="pill">
                {dashboardMetrics.expenseCount} Transaksi
              </span>
            </div>

            {/* Donut Chart Visual + Total */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "12px 14px",
                background: "#f8faf9",
                borderRadius: "12px",
                border: "1px solid var(--line)",
                marginBottom: "18px",
              }}
            >
              <div style={{ position: "relative", width: "88px", height: "88px", flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: "88px", height: "88px" }}>
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#e5ece8"
                    strokeWidth="4.2"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.name}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="4.2"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                    />
                  ))}
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ fontSize: "11px", color: "var(--ink)" }}>
                    {dashboardMetrics.distribution.length > 0
                      ? `${dashboardMetrics.distribution[0].pct}%`
                      : "0%"}
                  </strong>
                  <span style={{ fontSize: "8px", color: "var(--muted)" }}>Top Pos</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                  Total Kas Keluar
                </span>
                <div style={{ font: "800 20px Manrope", color: "var(--ink)", margin: "2px 0" }}>
                  {formatRupiah(dashboardMetrics.expense)}
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {dashboardMetrics.distribution.length > 0
                    ? `Terbesar: ${dashboardMetrics.distribution[0].name}`
                    : "Belum ada pengeluaran tercatat"}
                </span>
              </div>
            </div>

            {/* Daftar Rincian Kategori */}
            {dashboardMetrics.distribution.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 12px" }}>
                Belum ada pengeluaran tercatat (Rp 0). Catat pengeluaran untuk melihat komposisi kategori.
              </div>
            ) : (
              <div className="category-list">
                {dashboardMetrics.distribution.map((cat) => (
                  <div key={cat.name}>
                    <div className="category-row" style={{ alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            background: cat.color,
                            display: "inline-block",
                          }}
                        />
                        {cat.name}{" "}
                        <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                          ({cat.count}x · {cat.pct}%)
                        </span>
                      </span>
                      <strong>{cat.amountLabel}</strong>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <span
                        style={{
                          width: `${Math.min(100, cat.pct)}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              paddingTop: "12px",
              marginTop: "14px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
            }}
          >
            <span style={{ color: "var(--muted)" }}>Ingin batas pagu otomatis?</span>
            <Link href="/budgeting" className="text-link">
              Atur di AI Budgeting &gt;
            </Link>
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
                {periodTransactions.length === 0
                  ? "☁️"
                  : dashboardMetrics.netCashflow >= 0
                  ? "☀️"
                  : "🌧️"}
              </div>
              <div className="weather-info">
                <div className="weather-condition">
                  {periodTransactions.length === 0
                    ? "Belum Ada Data"
                    : dashboardMetrics.netCashflow >= 0
                    ? "Cerah & Resilien"
                    : "Perlu Waspada"}
                </div>
                <div className="weather-description">
                  {periodTransactions.length === 0
                    ? "Mulai catat transaksi keuangan Anda"
                    : dashboardMetrics.netCashflow >= 0
                    ? `Surplus kas terjaga (${dashboardMetrics.savingsRate}% rasio tabungan)`
                    : "Pengeluaran melampaui pemasukan periode ini"}
                </div>
              </div>
            </div>
            <div className="weather-score">
              <div className="score-value">
                {periodTransactions.length === 0
                  ? 0
                  : dashboardMetrics.netCashflow >= 0
                  ? Math.min(98, 75 + Math.round(Math.max(0, dashboardMetrics.savingsRate) * 0.25))
                  : 45}
              </div>
              <div className="score-label">Skor kesehatan</div>
            </div>
          </div>
          <div className="weather-forecast">
            <div className="forecast-item">
              <span className="forecast-label">Arus Kas</span>
              <span className="forecast-icon" style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>
                {formatCompactRupiah(dashboardMetrics.netCashflow)}
              </span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">Rasio Hemat</span>
              <span className="forecast-icon" style={{ fontSize: "12px", fontWeight: 700 }}>
                {dashboardMetrics.savingsRate}%
              </span>
            </div>
            <div className="forecast-item">
              <span className="forecast-label">Rata2 Harian</span>
              <span className="forecast-icon" style={{ fontSize: "12px", fontWeight: 700 }}>
                {formatCompactRupiah(dashboardMetrics.dailyAvgExpense)}
              </span>
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
                  {dashboardMetrics.distribution.length > 0
                    ? `Pos Pengeluaran Terbesar: ${dashboardMetrics.distribution[0].name}`
                    : "Belum ada pengeluaran tercatat (Rp 0)"}
                </div>
                <div className="insight-description">
                  {dashboardMetrics.distribution.length > 0
                    ? `Menyerap ${dashboardMetrics.distribution[0].amountLabel} (${dashboardMetrics.distribution[0].pct}% dari seluruh pengeluaran).`
                    : "Tambahkan transaksi agar AI dapat menganalisis pengeluaran Anda."}
                </div>
              </div>
            </div>
            <div className="insight-item priority-medium">
              <Sparkles size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">
                  Potensi efisiensi {formatRupiah(Math.round(dashboardMetrics.expense * 0.15))}
                </div>
                <div className="insight-description">
                  {dashboardMetrics.expense > 0
                    ? "Estimasi penghematan 15% jika mengoptimalkan pos pengeluaran non-esensial."
                    : "Potensi penghematan akan dihitung otomatis dari pengeluaran Anda."}
                </div>
              </div>
            </div>
            <div className="insight-item priority-low">
              <Wallet size={18} className="insight-icon" />
              <div className="insight-content">
                <div className="insight-title">
                  Posisi Kas Bersih: {formatRupiah(dashboardMetrics.netCashflow)}
                </div>
                <div className="insight-description">
                  Total masuk {formatRupiah(dashboardMetrics.income)} dikurangi keluar{" "}
                  {formatRupiah(dashboardMetrics.expense)}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terakhir */}
      <div className="card">
        <div className="card-heading">
          <div>
            <h2>Riwayat Transaksi Terakhir</h2>
            <p>
              Daftar transaksi aktual ({selectedPeriodLabel} ·{" "}
              {selectedTypeFilter === "all"
                ? "Semua Tipe"
                : selectedTypeFilter === "income"
                ? "Pemasukan"
                : "Pengeluaran"}
              )
            </p>
          </div>
          <Link
            href="/transactions"
            className="secondary-button"
            style={{ padding: "6px 12px" }}
          >
            Kelola Semua Transaksi
          </Link>
        </div>

        {isAuthenticated && displayedTransactions.length > 0 ? (
          <div className="transaction-list">
            {displayedTransactions.slice(0, 6).map((tx) => (
              <div className="transaction-row" key={tx.transaction_id}>
                <div
                  className="transaction-icon"
                  style={
                    tx.type === "expense"
                      ? { background: "#fff0ef", color: "var(--red)" }
                      : undefined
                  }
                >
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
