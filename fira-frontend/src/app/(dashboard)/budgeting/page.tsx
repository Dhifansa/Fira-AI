"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowRightLeft,
  Plus,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Utensils,
  Home,
  Car,
  Tv,
  HeartPulse,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  budgetApi,
  categoryApi,
  getAuthToken,
  parseNominalInput,
} from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { BudgetItem, Category } from "@/types";

function getBudgetIcon(categoryName: string) {
  const lower = categoryName.toLowerCase();
  if (lower.includes("makan") || lower.includes("f&b")) return <Utensils size={18} />;
  if (lower.includes("rumah") || lower.includes("utilitas") || lower.includes("tagihan")) return <Home size={18} />;
  if (lower.includes("transport")) return <Car size={18} />;
  if (lower.includes("hiburan")) return <Tv size={18} />;
  if (lower.includes("kesehatan") || lower.includes("fitnes")) return <HeartPulse size={18} />;
  return <BookOpen size={18} />;
}

function getBudgetStatus(amount: number, spent: number): "Defisit" | "Waspada" | "Aman" {
  if (amount <= 0) return "Aman";
  const ratio = (spent / amount) * 100;
  if (ratio > 100) return "Defisit";
  if (ratio >= 85) return "Waspada";
  return "Aman";
}

export default function BudgetingPage() {
  const [filterTab, setFilterTab] = useState("Semua");
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountInput, setAmountInput] = useState("Rp 0");
  const [periodType, setPeriodType] = useState("monthly");
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    await Promise.resolve();
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setBudgets([]);
      return;
    }

    setIsAuthenticated(true);
    try {
      const [budgetList, categoryList] = await Promise.all([
        budgetApi.getAll(),
        categoryApi.getAll(),
      ]);
      const expenseCats = categoryList.filter((c) => c.type === "expense");
      setCategories(expenseCats);
      if (expenseCats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(expenseCats[0].category_id);
      }
      setBudgets(budgetList);
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data anggaran.",
      });
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    const handleSync = () => {
      void fetchData();
    };
    handleSync();
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [fetchData]);

  const metrics = useMemo(() => {
    let totalPagu = 0;
    let totalSpent = 0;
    let defisitCount = 0;
    let waspadaCount = 0;
    let amanCount = 0;

    for (const b of budgets) {
      const amt = Number(b.amount) || 0;
      const sp = Number(b.spent) || 0;
      totalPagu += amt;
      totalSpent += sp;
      const st = getBudgetStatus(amt, sp);
      if (st === "Defisit") defisitCount++;
      else if (st === "Waspada") waspadaCount++;
      else amanCount++;
    }

    const remaining = totalPagu - totalSpent;
    const utilization = totalPagu > 0 ? (totalSpent / totalPagu) * 100 : 0;

    return {
      totalPagu,
      totalSpent,
      remaining,
      utilization,
      defisitCount,
      waspadaCount,
      amanCount,
    };
  }, [budgets]);

  const filteredBudgets = useMemo(() => {
    if (filterTab === "Semua") return budgets;
    return budgets.filter((b) => {
      const st = getBudgetStatus(Number(b.amount), Number(b.spent));
      return st === filterTab;
    });
  }, [budgets, filterTab]);

  const handleSaveBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!isAuthenticated) {
      setFeedbackMsg({
        type: "error",
        text: "Silakan login terlebih dahulu untuk menyimpan anggaran ke database.",
      });
      return;
    }

    const numericAmount = parseNominalInput(amountInput);
    if (!numericAmount || numericAmount <= 0) {
      setFeedbackMsg({
        type: "error",
        text: "Nominal pagu anggaran harus lebih besar dari 0.",
      });
      return;
    }

    if (!selectedCategoryId) {
      setFeedbackMsg({
        type: "error",
        text: "Pilih kategori pengeluaran terlebih dahulu.",
      });
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const startDate = `${year}-${month}-01`;
    const endDate =
      periodType === "weekly"
        ? `${year}-${month}-${String(Math.min(lastDay, now.getDate() + 7)).padStart(2, "0")}`
        : `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    try {
      setIsSubmitting(true);
      if (editingBudgetId) {
        await budgetApi.update(editingBudgetId, {
          category_id: selectedCategoryId,
          amount: numericAmount,
          start_date: startDate,
          end_date: endDate,
        });
        setFeedbackMsg({
          type: "success",
          text: "Pagu anggaran berhasil diperbarui.",
        });
      } else {
        await budgetApi.create({
          category_id: selectedCategoryId,
          amount: numericAmount,
          start_date: startDate,
          end_date: endDate,
        });
        setFeedbackMsg({
          type: "success",
          text: "Pagu anggaran baru berhasil disimpan.",
        });
      }
      setEditingBudgetId(null);
      await fetchData();
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan anggaran.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (budget: BudgetItem) => {
    setEditingBudgetId(
      budget.budget_id.startsWith("demo-") ? null : budget.budget_id
    );
    if (budget.category_id && !budget.budget_id.startsWith("demo-")) {
      setSelectedCategoryId(budget.category_id);
    }
    setAmountInput(formatRupiah(Number(budget.amount)));
    document
      .getElementById("budget-configurator-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteClick = async (budget: BudgetItem) => {
    if (!isAuthenticated || budget.budget_id.startsWith("demo-")) {
      setBudgets((prev) =>
        prev.filter((item) => item.budget_id !== budget.budget_id)
      );
      return;
    }

    try {
      await budgetApi.remove(budget.budget_id);
      setFeedbackMsg({
        type: "success",
        text: `Anggaran kategori ${budget.category_name} berhasil dihapus.`,
      });
      await fetchData();
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus anggaran.",
      });
    }
  };

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div
            className="eyebrow"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span className="pill">PRO v1.0 + P3</span>
            <span>IO Engine: Adaptive Budget Engine Active</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>AI Budgeting</h1>
          <p className="muted">
            Alokasi pintar dinamis yang memitigasi defisit secara real-time
            melalui proteksi surplus lintas kategori.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => fetchData()}
            className="secondary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Sparkles size={14} /> Optimasi AI Otomatis
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBudgetId(null);
              document
                .getElementById("budget-configurator-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="primary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Buat Anggaran Baru
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className="notice"
          style={{
            marginBottom: "18px",
            background:
              feedbackMsg.type === "error" ? "#fff0ef" : "var(--green-soft)",
            borderColor:
              feedbackMsg.type === "error" ? "#f9c6c4" : "var(--mint)",
            color: feedbackMsg.type === "error" ? "#b95e58" : "var(--green)",
          }}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* 2. Top Metric Cards (4 Kolom Bersebelahan) */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: "20px",
        }}
      >
        <div className="card stat-card">
          <div className="stat-top">
            <span>TOTAL PAGU ANGGARAN</span>
            <Wallet size={16} className="positive" />
          </div>
          <div className="stat-value">{formatRupiah(metrics.totalPagu)}</div>
          <div className="stat-foot">Terdaftar {budgets.length} Kategori</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>REALISASI BELANJA</span>
            <span className="pill warning">-4.2% vs bulan lalu</span>
          </div>
          <div className="stat-value">{formatRupiah(metrics.totalSpent)}</div>
          <div className="stat-foot">Terhitung otomatis dari transaksi</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>SISA ANGGARAN</span>
            <span className={`pill ${metrics.remaining < 0 ? "danger" : ""}`}>
              {metrics.remaining < 0 ? "Defisit" : "Aman"}
            </span>
          </div>
          <div
            className={`stat-value ${metrics.remaining >= 0 ? "positive" : ""}`}
            style={metrics.remaining < 0 ? { color: "var(--red)" } : undefined}
          >
            {formatRupiah(metrics.remaining)}
          </div>
          <div className="stat-foot positive">
            Penopang sisa periode berjalan
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>UTILISASI ANGGARAN</span>
            <span
              className={`pill ${
                metrics.utilization > 100
                  ? "danger"
                  : metrics.utilization >= 85
                  ? "warning"
                  : ""
              }`}
            >
              {metrics.utilization > 100
                ? "Over-Limit"
                : metrics.utilization >= 85
                ? "Waspada"
                : "Terkendali"}
            </span>
          </div>
          <div className="stat-value" style={{ color: "#a86a22" }}>
            {metrics.utilization.toFixed(1)}%
          </div>
          <div className="stat-foot">Rasio realisasi terhadap total pagu</div>
        </div>
      </div>

      {/* 3. AI Adaptive Budget Insight Banner */}
      <div
        className="card"
        style={{
          background: "var(--green-soft)",
          borderColor: "var(--mint)",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--green)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  className="eyebrow"
                  style={{ color: "var(--green)", margin: 0 }}
                >
                  AI ADAPTIVE BUDGET INSIGHT
                </span>
                <span
                  className="pill"
                  style={{ background: "#fff", fontSize: "9px" }}
                >
                  Audit Model 2.4
                </span>
              </div>
              <h3 style={{ font: "700 16px Manrope", margin: "4px 0" }}>
                {budgets.length > 0
                  ? "Status Pagu & Realisasi Anggaran Anda"
                  : "Belum Ada Pagu Anggaran Aktif (Rp 0)"}
              </h3>
              <p
                className="muted"
                style={{
                  fontSize: "12px",
                  color: "var(--ink)",
                  lineHeight: "1.6",
                }}
              >
                {budgets.length > 0 ? (
                  <>
                    Total pagu anggaran terdaftar sebesar{" "}
                    <strong>{formatRupiah(metrics.totalPagu)}</strong> dengan
                    realisasi belanja{" "}
                    <strong>{formatRupiah(metrics.totalSpent)}</strong> (sisa
                    anggaran{" "}
                    <strong>{formatRupiah(metrics.remaining)}</strong>).
                  </>
                ) : (
                  <>
                    Semua pagu anggaran saat ini masih <strong>Rp 0</strong>.
                    Gunakan Konfigurator Cepat di bawah untuk membuat pagu
                    anggaran kategori Anda.
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("budget-configurator-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="primary-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <ArrowRightLeft size={15} /> Atur Pagu Anggaran
          </button>
        </div>

        {/* Sinkronisasi Smart Auditor */}
        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid var(--mint)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
          }}
        >
          <span style={{ color: "var(--green)" }}>
            <strong>Sinkronisasi AI Smart Auditor:</strong> Pantau efisiensi
            pengeluaran dan langganan Anda secara otomatis melalui modul AI
            Smart Auditor.
          </span>
          <Link href="/smart-auditor" className="text-link">
            Buka Smart Auditor &gt;
          </Link>
        </div>
      </div>

      {/* 4. Filter & Judul Daftar Pagu per Kategori */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ font: "700 18px Manrope", margin: 0 }}>
            Daftar Pagu Anggaran per Kategori
          </h2>
          <p className="muted" style={{ fontSize: "12px" }}>
            Monitoring penggunaan pagu per pos pengeluaran dengan indikator laju
            konsumsi harian terkendali.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "white",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--line)",
          }}
        >
          {[
            `Semua (${budgets.length})`,
            `Defisit (${metrics.defisitCount})`,
            `Waspada (${metrics.waspadaCount})`,
            `Aman (${metrics.amanCount})`,
          ].map((tab) => {
            const tabKey = tab.split(" ")[0];
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setFilterTab(tabKey)}
                className="secondary-button"
                style={{
                  border: 0,
                  padding: "6px 12px",
                  fontSize: "11px",
                  background:
                    filterTab === tabKey ? "var(--green-soft)" : "transparent",
                  color:
                    filterTab === tabKey ? "var(--green)" : "var(--muted)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Kartu Pagu Kategori */}
      {filteredBudgets.length === 0 ? (
        <div className="card empty-state" style={{ marginBottom: "24px" }}>
          Belum ada pagu anggaran pada kategori filter ini. Gunakan
          &ldquo;Konfigurator Cepat&rdquo; di bawah untuk menambahkan pagu
          anggaran baru.
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {filteredBudgets.map((budget) => {
            const amt = Number(budget.amount) || 0;
            const spent = Number(budget.spent) || 0;
            const ratio = amt > 0 ? (spent / amt) * 100 : 0;
            const status = getBudgetStatus(amt, spent);
            const diff = amt - spent;

            const isDefisit = status === "Defisit";
            const isWaspada = status === "Waspada";

            return (
              <div
                key={budget.budget_id}
                className="card"
                style={{
                  borderColor: isDefisit
                    ? "#f9c6c4"
                    : isWaspada
                    ? "#ffe4bd"
                    : "var(--mint)",
                }}
              >
                <div
                  style={{
                    borderTop: `4px solid ${
                      isDefisit
                        ? "var(--red)"
                        : isWaspada
                        ? "var(--orange)"
                        : "var(--green)"
                    }`,
                    margin: "-20px -20px 16px -20px",
                    borderRadius: "16px 16px 0 0",
                  }}
                ></div>
                <div className="card-heading" style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      className="stat-icon"
                      style={
                        isDefisit
                          ? { background: "#fff0ef", color: "var(--red)" }
                          : isWaspada
                          ? { background: "#fff4e7", color: "var(--orange)" }
                          : undefined
                      }
                    >
                      {getBudgetIcon(budget.category_name)}
                    </div>
                    <div>
                      <h3 style={{ font: "700 15px Manrope", margin: 0 }}>
                        {budget.category_name}
                      </h3>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                        Periode {String(budget.start_date).slice(0, 10)} s/d{" "}
                        {String(budget.end_date).slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`pill ${
                      isDefisit ? "danger" : isWaspada ? "warning" : ""
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    margin: "12px 0 4px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Realisasi / Pagu
                  </span>
                  <strong
                    style={{
                      fontSize: "14px",
                      color: isDefisit
                        ? "var(--red)"
                        : isWaspada
                        ? "#a86a22"
                        : "var(--green)",
                    }}
                  >
                    {ratio.toFixed(1)}%
                  </strong>
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  {formatRupiah(spent)}{" "}
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 400,
                      color: "var(--muted)",
                    }}
                  >
                    dari {formatRupiah(amt)}
                  </span>
                </div>
                <div className="progress">
                  <span
                    style={{
                      width: `${Math.min(100, ratio)}%`,
                      background: isDefisit
                        ? "var(--red)"
                        : isWaspada
                        ? "var(--orange)"
                        : "var(--green)",
                    }}
                  ></span>
                </div>

                <div
                  className="notice"
                  style={{
                    background: isDefisit
                      ? "#fff0ef"
                      : isWaspada
                      ? "#fff8ec"
                      : undefined,
                    borderColor: isDefisit
                      ? "#f9c6c4"
                      : isWaspada
                      ? "#ffe4bd"
                      : undefined,
                    color: isDefisit
                      ? "#b95e58"
                      : isWaspada
                      ? "#8a5814"
                      : undefined,
                    marginTop: "12px",
                    fontSize: "11px",
                  }}
                >
                  {isDefisit ? (
                    <>
                      <strong>
                        Melebihi Batas: -{formatRupiah(Math.abs(diff))}
                      </strong>
                      <br />
                      AI Warning: Realisasi melampaui batas pagu. Pertimbangkan
                      realokasi surplus dari kategori lain.
                    </>
                  ) : (
                    <>
                      <strong>Sisa Anggaran: {formatRupiah(diff)}</strong>
                      <br />
                      Safe Daily Pace: Penggunaan anggaran masih dalam koridor
                      aman.
                    </>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "14px",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--line)",
                    fontSize: "11px",
                    color: "var(--muted)",
                  }}
                >
                  <span>Terpantau Otomatis</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      title="Edit Pagu"
                      onClick={() => handleEditClick(budget)}
                      style={{ border: 0, background: "none" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      title="Hapus Pagu"
                      onClick={() => handleDeleteClick(budget)}
                      style={{ border: 0, background: "none" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Konfigurator Cepat Anggaran Baru */}
      <div className="card" id="budget-configurator-form">
        <div className="card-heading">
          <div>
            <h2>
              Konfigurator Cepat:{" "}
              {editingBudgetId
                ? "Perbarui Pagu Anggaran"
                : "Buat / Atur Anggaran Baru"}
            </h2>
            <p>
              Rancang pagu presisi dengan rekomendasi pintar berbasis rata-rata
              pengeluaran 3 bulan terakhir.
            </p>
          </div>
          <span className="pill" style={{ fontSize: "9px" }}>
            Model Pembelajaran Mesin v1.8
          </span>
        </div>

        <form onSubmit={handleSaveBudget} style={{ marginTop: "14px" }}>
          <div
            className="form-grid"
            style={{
              gridTemplateColumns: "1.5fr 1fr 1fr auto",
              alignItems: "end",
              gap: "12px",
            }}
          >
            <div className="field" style={{ margin: 0 }}>
              <label>Kategori Pengeluaran</label>
              {categories.length > 0 ? (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select defaultValue="Makanan & Minuman (F&B)">
                  <option>Makanan &amp; Minuman (F&amp;B)</option>
                  <option>Transportasi &amp; Bensin</option>
                  <option>Rumah &amp; Utilitas</option>
                  <option>Hiburan &amp; Gaya Hidup</option>
                </select>
              )}
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Batas Pagu (Nominal)</label>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Frekuensi Periode</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <option value="monthly">Bulanan (Periode Berjalan)</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button"
              style={{
                height: "42px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={16} />{" "}
              {isSubmitting
                ? "Menyimpan..."
                : editingBudgetId
                ? "Perbarui Pagu"
                : "Simpan Pagu Kategori"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
            }}
          >
            <span className="pill">Peringatan Dini Adaptif FIRA AI</span>
            <span style={{ color: "var(--muted)" }}>
              Kirim notifikasi telegram &amp; pop-up saat belanja menyentuh 80%
              dan 95% untuk mencegah defisit fatal.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
