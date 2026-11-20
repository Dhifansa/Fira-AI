"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Target,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  ShieldCheck,
  Laptop,
  Plane,
  GraduationCap,
  Calculator,
  CheckCircle2,
  Trash2,
  Zap,
} from "lucide-react";
import {
  financialGoalApi,
  getAuthToken,
  getGoalDepositMap,
  parseNominalInput,
  setGoalDeposit,
} from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/format";
import type { FinancialGoalItem } from "@/types";

function getGoalIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("darurat")) return <ShieldCheck size={18} />;
  if (lower.includes("laptop") || lower.includes("aset") || lower.includes("rumah")) {
    return <Laptop size={18} />;
  }
  if (lower.includes("liburan") || lower.includes("jepang") || lower.includes("travel")) {
    return <Plane size={18} />;
  }
  return <GraduationCap size={18} />;
}

export default function FinancialGoalsPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [goals, setGoals] = useState<FinancialGoalItem[]>([]);
  const [depositMap, setDepositMap] = useState<Record<string, number>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Calculator / Form State
  const [goalName, setGoalName] = useState("");
  const [targetNominal, setTargetNominal] = useState("Rp 0");
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [planCategory, setPlanCategory] = useState("Pembelian Aset / Properti");
  const [depositFrequency, setDepositFrequency] = useState<"monthly" | "weekly">("monthly");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const fetchGoals = useCallback(async () => {
    await Promise.resolve();
    setDepositMap(getGoalDepositMap());
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setGoals([]);
      return;
    }

    setIsAuthenticated(true);
    try {
      const list = await financialGoalApi.getAll();
      setGoals(list);
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat target finansial.",
      });
    }
  }, []);

  useEffect(() => {
    const handleAuth = () => {
      void fetchGoals();
    };
    handleAuth();
    window.addEventListener("fira-auth-change", handleAuth);
    return () => window.removeEventListener("fira-auth-change", handleAuth);
  }, [fetchGoals]);

  const getSavedForGoal = useCallback(
    (goal: FinancialGoalItem): number => {
      if (depositMap[goal.financial_goal_id] !== undefined) {
        return depositMap[goal.financial_goal_id];
      }
      const demo = (goal as FinancialGoalItem & { demoSaved?: number }).demoSaved;
      if (demo !== undefined) return demo;
      if (goal.status === "completed") return Number(goal.target_amount) || 0;
      return 0;
    },
    [depositMap]
  );

  const summary = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    for (const g of goals) {
      totalTarget += Number(g.target_amount) || 0;
      totalSaved += getSavedForGoal(g);
    }
    const savedPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    const remaining = Math.max(0, totalTarget - totalSaved);
    const monthlyCommitment = Math.round(remaining / 12);
    return { totalTarget, totalSaved, savedPct, monthlyCommitment };
  }, [goals, getSavedForGoal]);

  const filteredGoals = useMemo(() => {
    if (activeTab === "Semua") return goals;
    return goals.filter((g) => {
      const lower = g.name.toLowerCase();
      if (activeTab === "Dana") return lower.includes("darurat") || lower.includes("dana");
      if (activeTab === "Pembelian") return lower.includes("laptop") || lower.includes("rumah") || lower.includes("aset");
      if (activeTab === "Liburan") return lower.includes("liburan") || lower.includes("jepang");
      if (activeTab === "Pendidikan") return lower.includes("sertifikasi") || lower.includes("pendidikan");
      return true;
    });
  }, [goals, activeTab]);

  const calculatedMonthlySaving = useMemo(() => {
    const target = parseNominalInput(targetNominal);
    if (!target || durationMonths <= 0) return 0;
    return Math.round(target / durationMonths);
  }, [targetNominal, durationMonths]);

  const handleSaveGoal = async () => {
    setFeedbackMsg(null);
    if (!isAuthenticated) {
      setFeedbackMsg({
        type: "error",
        text: "Silakan login terlebih dahulu untuk menyimpan target finansial ke database.",
      });
      return;
    }

    const numericTarget = parseNominalInput(targetNominal);
    if (!goalName.trim() || numericTarget <= 0) {
      setFeedbackMsg({
        type: "error",
        text: "Nama target dan nominal target wajib diisi dengan benar.",
      });
      return;
    }

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + durationMonths);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    try {
      setIsSubmitting(true);
      if (editingGoalId) {
        await financialGoalApi.update(editingGoalId, {
          name: goalName.trim(),
          target_amount: numericTarget,
          end_date: endDate,
        });
        setFeedbackMsg({
          type: "success",
          text: "Target finansial berhasil diperbarui.",
        });
      } else {
        await financialGoalApi.create({
          name: goalName.trim(),
          target_amount: numericTarget,
          start_date: startDate,
          end_date: endDate,
          status: "active",
        });
        setFeedbackMsg({
          type: "success",
          text: "Target finansial baru berhasil dibuat dan diaktifkan.",
        });
      }
      setEditingGoalId(null);
      await fetchGoals();
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Gagal menyimpan target finansial.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDeposit = async (goal: FinancialGoalItem) => {
    const target = Number(goal.target_amount) || 0;
    const current = getSavedForGoal(goal);
    const step = Math.max(500000, Math.round(target * 0.1));
    const nextSaved = Math.min(target, current + step);

    setGoalDeposit(goal.financial_goal_id, nextSaved);
    setDepositMap(getGoalDepositMap());

    if (
      isAuthenticated &&
      !goal.financial_goal_id.startsWith("demo-") &&
      nextSaved >= target &&
      goal.status !== "completed"
    ) {
      try {
        await financialGoalApi.update(goal.financial_goal_id, {
          status: "completed",
        });
        await fetchGoals();
      } catch {
        // Ignore status update error if deposit is already saved
      }
    }
  };

  const handleEditGoal = (goal: FinancialGoalItem) => {
    setEditingGoalId(
      goal.financial_goal_id.startsWith("demo-") ? null : goal.financial_goal_id
    );
    setGoalName(goal.name);
    setTargetNominal(formatRupiah(Number(goal.target_amount)));
    document
      .getElementById("goal-calculator-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteGoal = async (goal: FinancialGoalItem) => {
    if (!isAuthenticated || goal.financial_goal_id.startsWith("demo-")) {
      setGoals((prev) =>
        prev.filter((g) => g.financial_goal_id !== goal.financial_goal_id)
      );
      return;
    }

    try {
      await financialGoalApi.remove(goal.financial_goal_id);
      setFeedbackMsg({
        type: "success",
        text: `Target "${goal.name}" berhasil dihapus.`,
      });
      await fetchGoals();
    } catch (err) {
      setFeedbackMsg({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Gagal menghapus target finansial.",
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
            <span className="pill">AI Goal Engine + P3 Core</span>
            <span>Rancang, pantau, dan capai target finansial strategis</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>Financial Goal Planner</h1>
          <p className="muted">
            Perencanaan target pintar berbasis saran alokasi adaptif dari
            surplus arus kas harian Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => fetchGoals()}
            className="secondary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Zap size={14} /> Simulasi Akselerasi AI
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingGoalId(null);
              document
                .getElementById("goal-calculator-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="primary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} /> Buat Target Baru
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
            <span>TOTAL TARGET AKUMULASI</span>
            <Target size={16} className="positive" />
          </div>
          <div className="stat-value">{formatRupiah(summary.totalTarget)}</div>
          <div className="stat-foot">
            Terbagi dalam {goals.length} target aktif
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>DANA TERKUMPUL SAAT INI</span>
            <span className="pill">+{summary.savedPct.toFixed(1)}%</span>
          </div>
          <div className="stat-value positive">
            {formatRupiah(summary.totalSaved)}
          </div>
          <div className="stat-foot positive">
            Progres keseluruhan berjalan cepat
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>KOMITMEN SETORAN BULANAN</span>
            <Calendar size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value">
            {formatRupiah(summary.monthlyCommitment)}{" "}
            <span style={{ fontSize: "11px", fontWeight: 400 }}>/bln</span>
          </div>
          <div className="stat-foot">
            Estimasi setoran rata-rata per bulan
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>ESTIMASI CAPAIAN WAKTU</span>
            <Clock size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value" style={{ fontSize: "18px" }}>
            {goals.filter((g) => g.status === "completed").length} Selesai ·{" "}
            {goals.filter((g) => g.status !== "completed").length} Aktif
          </div>
          <div className="stat-foot">
            Target terdekat: {goals[0]?.name || "Belum ada target"}
          </div>
        </div>
      </div>

      {/* 3. AI Wawasan Adaptif Cerdas FIRA Banner */}
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
              <Sparkles size={20} />
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  className="eyebrow"
                  style={{ color: "var(--green)", margin: 0 }}
                >
                  WAWASAN ADAPTIF CERDAS FIRA
                </span>
                <span
                  className="pill"
                  style={{ background: "#fff", fontSize: "9px" }}
                >
                  Optimization Recommendation
                </span>
              </div>
              <h3 style={{ font: "700 16px Manrope", margin: "4px 0" }}>
                {goals.length > 0
                  ? `Fokus Target Aktif: ${goals[0].name}`
                  : "Belum Ada Target Finansial (Rp 0)"}
              </h3>
              <p
                className="muted"
                style={{
                  fontSize: "12px",
                  color: "var(--ink)",
                  lineHeight: "1.6",
                }}
              >
                {goals.length > 0 ? (
                  <>
                    Total target akumulasi Anda sebesar{" "}
                    <strong>{formatRupiah(summary.totalTarget)}</strong> dengan
                    dana terkumpul{" "}
                    <strong>{formatRupiah(summary.totalSaved)}</strong> (
                    {summary.savedPct.toFixed(1)}%).
                  </>
                ) : (
                  <>
                    Saat ini belum ada target finansial yang dibuat (semua nilai{" "}
                    <strong>Rp 0</strong>). Gunakan Kalkulator Cerdas di bawah
                    untuk mulai merencanakan target tabungan Anda.
                  </>
                )}
              </p>
            </div>
          </div>
          {goals.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (goals[0]) void handleAddDeposit(goals[0]);
                }}
                className="primary-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                <Zap size={14} /> + Tambah Setoran Target Utama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Filter Tab Target */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "white",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--line)",
          }}
        >
          {[
            `Semua Target (${goals.length})`,
            "Dana Darurat",
            "Pembelian Aset",
            "Liburan & Gaya Hidup",
            "Pendidikan",
          ].map((tab) => {
            const tabKey = tab.split(" ")[0];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tabKey)}
                className="secondary-button"
                style={{
                  border: 0,
                  padding: "6px 12px",
                  fontSize: "11px",
                  background:
                    activeTab === tabKey ? "var(--green-soft)" : "transparent",
                  color:
                    activeTab === tabKey ? "var(--green)" : "var(--muted)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          Urutkan: <strong>Menurut Progres Tertinggi</strong>
        </span>
      </div>

      {/* 5. Grid Kartu Goal Detail (2 x 2) */}
      {filteredGoals.length === 0 ? (
        <div className="card empty-state" style={{ marginBottom: "28px" }}>
          Belum ada target finansial yang terdaftar. Gunakan Kalkulator Cerdas
          di bawah untuk membuat target finansial baru.
        </div>
      ) : (
        <div
          className="grid two-col"
          style={{ gap: "16px", marginBottom: "28px" }}
        >
          {filteredGoals.map((goal) => {
            const target = Number(goal.target_amount) || 0;
            const saved = getSavedForGoal(goal);
            const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
            const remaining = Math.max(0, target - saved);
            const monthlyNeed = Math.max(1, Math.round(remaining / 6));

            return (
              <div key={goal.financial_goal_id} className="card">
                <div className="card-heading" style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div className="stat-icon">{getGoalIcon(goal.name)}</div>
                    <div>
                      <span
                        className="pill"
                        style={{ fontSize: "9px", marginBottom: "2px" }}
                      >
                        Status: {goal.status.toUpperCase()}
                      </span>
                      <h3 style={{ font: "700 16px Manrope", margin: 0 }}>
                        {goal.name}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`pill ${
                      pct >= 100 ? "" : pct < 35 ? "warning" : ""
                    }`}
                  >
                    {pct >= 100
                      ? "COMPLETED"
                      : pct < 35
                      ? "PERLU AKSELERASI"
                      : "ON TRACK"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    margin: "10px 0 4px",
                  }}
                >
                  {formatRupiah(saved)}{" "}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "var(--muted)",
                    }}
                  >
                    dari {formatRupiah(target)}
                  </span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <span
                    style={{
                      width: `${pct.toFixed(1)}%`,
                      background: pct < 35 ? "var(--orange)" : "var(--green)",
                    }}
                  ></span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "var(--muted)",
                    marginTop: "4px",
                  }}
                >
                  <span>{pct.toFixed(1)}% tercapai</span>
                  <span>Sisa {formatRupiah(remaining)}</span>
                </div>

                <div
                  className="grid two-col"
                  style={{
                    background: "#f8faf9",
                    padding: "10px",
                    borderRadius: "10px",
                    margin: "14px 0",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: "var(--muted)",
                        display: "block",
                        fontSize: "10px",
                      }}
                    >
                      Tenggat Waktu
                    </span>
                    <strong>{formatDate(goal.end_date)}</strong>
                  </div>
                  <div>
                    <span
                      style={{
                        color: "var(--muted)",
                        display: "block",
                        fontSize: "10px",
                      }}
                    >
                      Estimasi Setoran Rutin
                    </span>
                    <strong>{formatRupiah(monthlyNeed)} / bln</strong>
                  </div>
                </div>

                <div
                  className="notice"
                  style={{ fontSize: "11px", padding: "10px 12px" }}
                >
                  <strong>Rekomendasi AI:</strong> Alokasikan surplus arus kas
                  bulanan secara konsisten agar target tercapai tepat pada{" "}
                  {formatDate(goal.end_date)}.
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button
                    type="button"
                    onClick={() => handleAddDeposit(goal)}
                    className="primary-button"
                    style={{ flex: 1, padding: "8px", fontSize: "11px" }}
                  >
                    + Tambah Setoran
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditGoal(goal)}
                    className="secondary-button"
                    style={{ flex: 1, padding: "8px", fontSize: "11px" }}
                  >
                    Edit Target
                  </button>
                  <button
                    type="button"
                    title="Hapus Target"
                    onClick={() => handleDeleteGoal(goal)}
                    className="secondary-button"
                    style={{ padding: "8px" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Kalkulator Cerdas: Rencana Setoran Otomatis */}
      <div className="card" id="goal-calculator-section">
        <div className="card-heading">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="stat-icon">
              <Calculator size={18} />
            </div>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
                Kalkulator Cerdas:{" "}
                {editingGoalId
                  ? "Perbarui Target Finansial"
                  : "Rencana Setoran Otomatis"}
              </h2>
              <p className="muted" style={{ fontSize: "12px" }}>
                Hitung kapasitas setoran baru berdasarkan arus kas nyata tanpa
                mengorbankan stabilitas bulanan.
              </p>
            </div>
          </div>
          <span
            className="pill"
            style={{ background: "var(--green-soft)", color: "var(--green)" }}
          >
            Kalkulator Rencana Tabungan
          </span>
        </div>

        <div
          className="grid two-col"
          style={{ gap: "24px", marginTop: "16px", alignItems: "start" }}
        >
          {/* Input Form Sisi Kiri */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveGoal();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div className="field" style={{ margin: 0 }}>
              <label>Nama Target Finansial</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Target Nominal (Rp)</label>
                <input
                  type="text"
                  value={targetNominal}
                  onChange={(e) => setTargetNominal(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Tenggat Waktu (Durasi)</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                >
                  <option value={12}>12 Bulan (1 Tahun)</option>
                  <option value={6}>6 Bulan</option>
                  <option value={24}>24 Bulan (2 Tahun)</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Kategori Rencana</label>
                <select
                  value={planCategory}
                  onChange={(e) => setPlanCategory(e.target.value)}
                >
                  <option>Pembelian Aset / Properti</option>
                  <option>Dana Darurat</option>
                  <option>Liburan &amp; Gaya Hidup</option>
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Frekuensi Setoran</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDepositFrequency("monthly")}
                    className={
                      depositFrequency === "monthly"
                        ? "primary-button"
                        : "secondary-button"
                    }
                    style={{ padding: "8px", fontSize: "11px" }}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositFrequency("weekly")}
                    className={
                      depositFrequency === "weekly"
                        ? "primary-button"
                        : "secondary-button"
                    }
                    style={{ padding: "8px", fontSize: "11px" }}
                  >
                    Mingguan
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              <input
                type="checkbox"
                id="autodebit"
                defaultChecked
                style={{ width: "16px", height: "16px" }}
              />
              <label
                htmlFor="autodebit"
                style={{
                  fontSize: "11px",
                  color: "var(--ink)",
                  fontWeight: 500,
                }}
              >
                Aktifkan Auto-Debit Nabung Otomatis H+1 Gajian
              </label>
            </div>
          </form>

          {/* Result Panel Sisi Kanan */}
          <div
            style={{
              background: "#f8faf9",
              border: "1px solid var(--line)",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span className="eyebrow" style={{ margin: 0 }}>
                KALKULASI AI REAL-TIME
              </span>
              <span className="pill" style={{ fontSize: "9px" }}>
                AMAN &amp; TERJANGKAU
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
              Kebutuhan Setoran{" "}
              {depositFrequency === "monthly" ? "Bulanan" : "Mingguan"}:
            </div>
            <div
              style={{
                font: "800 28px Manrope",
                color: "var(--green)",
                margin: "4px 0 12px",
              }}
            >
              {formatRupiah(
                depositFrequency === "monthly"
                  ? calculatedMonthlySaving
                  : Math.round(calculatedMonthlySaving / 4)
              )}{" "}
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                / {depositFrequency === "monthly" ? "bulan" : "minggu"}
              </span>
            </div>

            <div
              className="notice"
              style={{
                background: "#fff",
                border: "1px solid var(--line)",
                fontSize: "11px",
                lineHeight: "1.6",
              }}
            >
              <CheckCircle2
                size={16}
                className="positive"
                style={{ float: "left", marginRight: "8px", marginTop: "2px" }}
              />
              Berdasarkan durasi {durationMonths} Bulan, setoran rutin yang
              dibutuhkan adalah{" "}
              <strong>{formatRupiah(calculatedMonthlySaving)}/bln</strong> untuk
              mencapai target tepat waktu.
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveGoal}
              className="primary-button"
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <CheckCircle2 size={16} />{" "}
              {isSubmitting
                ? "Menyimpan..."
                : editingGoalId
                ? "Perbarui Target Finansial"
                : "Simpan & Aktifkan Target"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
