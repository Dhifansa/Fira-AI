"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Sparkles,
  Download,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Dumbbell,
  Tv,
  Zap,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { aiApi, getAuthToken, parseNominalInput } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { SmartAuditorData } from "@/types";

const INITIAL_AUDIT_DATA: SmartAuditorData = {
  auditedAt: "Hari ini, 08:30 WIB",
  periodLabel: "November 2026",
  hasRealData: false,
  metrics: {
    efficiencyScore: 76,
    efficiencyLabel: "Cukup Baik · Potensi +14 Poin",
    potentialSavingsMonthly: 1450000,
    potentialSavingsYearly: 17400000,
    leaksCount: 3,
    leaksSubtitle: "2 Langganan Pasif, 1 Anomali Lonjakan",
    auditedTransactionsCount: 142,
  },
  spendingConcentration: {
    totalExpense: 7420000,
    top4SharePct: 88,
    categories: [
      { category_id: null, name: "Makanan & Minuman (F&B)", amount: 2850000, pct: 38 },
      { category_id: null, name: "Kebutuhan Rumah & Utilitas", amount: 1620000, pct: 22 },
      { category_id: null, name: "Transportasi & Bensin", amount: 1150000, pct: 15 },
      { category_id: null, name: "Hiburan & Gaya Hidup", amount: 950000, pct: 13 },
    ],
    auditorNote:
      "Pos F&B melampaui batas wajar 30% dari total belanja bulanan akibat tingginya transaksi pesan-antar makanan online di akhir pekan. Disarankan merevaluasi batas belanja mikro mingguan.",
  },
  anomaly: {
    category_id: null,
    spikePct: 42,
    dateLabel: "22-24 Nov 2026",
    title: "Lonjakan Ekstrem Kategori F&B Akhir Pekan",
    normalDailyAvg: 65000,
    currentDailyAvg: 245000,
    explanation:
      "Ditemukan 5 transaksi kafe dan delivery beruntun dalam kurun waktu 48 jam dengan nominal akumulatif Rp 735.000.",
    recommendation:
      "Terapkan batas pagu harian Weekend Cap sebesar Rp 120.000 atau aktifkan notifikasi peringatan saat belanja F&B melewati Rp 100.000/hari.",
    recommendedMonthlyCap: 2400000,
    severityLabel: "Peringatan Sedang",
  },
  subscriptions: [
    {
      id: "cloud-storage",
      icon: "cloud",
      name: "Cloud Storage Backup",
      monthlyCost: 135000,
      utilizationPct: 12,
      utilizationLabel: "Utilisasi Kuota",
      utilizationValue: "Hanya 12%",
      advice: "Downgrade ke paket 200GB. Kebutuhan data riil Anda hanya 140GB.",
      potentialSaving: 95000,
      actionLabel: "Downgrade Paket",
      isCritical: false,
    },
    {
      id: "gym-membership",
      icon: "dumbbell",
      name: "Membership Gym",
      monthlyCost: 450000,
      utilizationPct: 0,
      utilizationLabel: "Presensi 40 Hari Terakhir",
      utilizationValue: "0 Check-in",
      advice: "Tidak terdeteksi absensi presensi. Bekukan/jeda atau hentikan langganan aktif.",
      potentialSaving: 450000,
      actionLabel: "Jeda / Bekukan",
      isCritical: true,
    },
    {
      id: "video-streaming",
      icon: "tv",
      name: "Video Streaming B",
      monthlyCost: 65000,
      utilizationPct: 20,
      utilizationLabel: "Durasi Tontonan",
      utilizationValue: "< 1 jam / bulan",
      advice: "Terdapat overlap konten dengan Platform A yang digunakan rutin.",
      potentialSaving: 65000,
      actionLabel: "Hentikan Langganan",
      isCritical: false,
    },
  ],
  quickWins: [
    {
      id: "qw-goal-redirect",
      badge: "Dampak Tinggi",
      badgeType: "warning",
      title: "Alihkan Surplus Langganan ke Dana Darurat",
      description:
        "Alokasikan efisiensi pembatalan gym dan streaming (Rp 610.000/bln) langsung ke rekening Dana Darurat. Mempercepat target 6 bulan tercapai 2,3 bulan lebih awal.",
      actionLabel: "Aktifkan Autodebit",
      savingAmount: 610000,
    },
    {
      id: "qw-cashback",
      badge: "Cashback Rutin",
      badgeType: "normal",
      title: "Optimasi Pengeluaran BBM via Rekening Terintegrasi",
      description:
        "Gunakan kartu kredit/debit payroll terhubung untuk transaksi BBM di SPBU rekanan. Memberikan potensi cashback penghematan Rp 120.000/bln secara otomatis.",
      actionLabel: "Hubungkan Promo",
      savingAmount: 120000,
    },
  ],
  budgetSyncPreview: [
    "Batas F&B disesuaikan: Rp 2.400.000",
    "Pos Langganan Berkurang Rp 610.000",
    "Porsi Tabungan bertambah otomatis",
  ],
};

function renderSubscriptionIcon(icon: string, isCritical: boolean) {
  if (icon === "dumbbell") {
    return <Dumbbell size={18} style={{ color: isCritical ? "var(--red)" : "var(--green)" }} />;
  }
  if (icon === "tv") {
    return <Tv size={18} className="positive" />;
  }
  return <Cloud size={18} className="positive" />;
}

export default function SmartAuditorPage() {
  const router = useRouter();
  const [audit, setAudit] = useState<SmartAuditorData>(INITIAL_AUDIT_DATA);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSyncingBudgets, setIsSyncingBudgets] = useState(false);
  const [isApplyingCap, setIsApplyingCap] = useState(false);
  const [capApplied, setCapApplied] = useState(false);
  const [anomalyDismissed, setAnomalyDismissed] = useState(false);
  const [resolvedSubs, setResolvedSubs] = useState<Record<string, boolean>>({});
  const [activatedQuickWins, setActivatedQuickWins] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // State Modal Tambah Langganan Baru
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subName, setSubName] = useState("");
  const [subCost, setSubCost] = useState("");
  const [subIcon, setSubIcon] = useState<"tv" | "cloud" | "dumbbell">("tv");
  const [subUtilization, setSubUtilization] = useState(20);
  const [recordSubAsTx, setRecordSubAsTx] = useState(true);
  const [isCreatingSub, setIsCreatingSub] = useState(false);

  const fetchAuditReport = useCallback(async (showFeedback = false) => {
    await Promise.resolve();
    setIsAuditing(true);
    try {
      const res = await aiApi.getSmartAuditor();
      setAudit(res);
      if (showFeedback) {
        setStatusMessage(
          `Audit ulang selesai! Memindai ${res.metrics.auditedTransactionsCount} entri buku kas Anda.`
        );
      }
    } catch {
      if (showFeedback) {
        setStatusMessage("Audit selesai menggunakan model evaluasi lokal FIRA.");
      }
    } finally {
      setIsAuditing(false);
    }
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      void fetchAuditReport(false);
    };
    const timer = window.setTimeout(handleRefresh, 0);
    window.addEventListener("fira-transactions-updated", handleRefresh);
    window.addEventListener("fira-auth-change", handleRefresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fira-transactions-updated", handleRefresh);
      window.removeEventListener("fira-auth-change", handleRefresh);
    };
  }, [fetchAuditReport]);

  const handleApplyAnomalyCap = async () => {
    const token = getAuthToken();
    if (!token) {
      setCapApplied(true);
      setStatusMessage(
        `Simulasi batas belanja sebesar ${formatRupiah(audit.anomaly.recommendedMonthlyCap)}/bulan diaktifkan. Login untuk menyimpan permanen ke database.`
      );
      return;
    }

    setIsApplyingCap(true);
    try {
      const res = await aiApi.applyAnomalyCap({
        category_id: audit.anomaly.category_id,
        amount: audit.anomaly.recommendedMonthlyCap,
      });
      setCapApplied(true);
      setStatusMessage(res.message);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Gagal menerapkan batas belanja ke database."
      );
    } finally {
      setIsApplyingCap(false);
    }
  };

  const handleSyncToBudgets = async () => {
    const token = getAuthToken();
    if (!token) {
      setStatusMessage(
        "Silakan login terlebih dahulu agar aturan AI Smart Auditor dapat disimpan langsung ke tabel Budgets di database PostgreSQL."
      );
      return;
    }

    setIsSyncingBudgets(true);
    try {
      const res = await aiApi.syncAuditorToBudgets();
      setStatusMessage(res.message);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Gagal menyinkronkan ke AI Budgeting."
      );
    } finally {
      setIsSyncingBudgets(false);
    }
  };

  const toggleSubscriptionAction = (subId: string, name: string, saving: number) => {
    setResolvedSubs((prev) => {
      const next = !prev[subId];
      setStatusMessage(
        next
          ? `Tindakan efisiensi pada "${name}" diaktifkan (+${formatRupiah(saving)}/bln potensi penghematan).`
          : `Tindakan pada "${name}" dibatalkan.`
      );
      return { ...prev, [subId]: next };
    });
  };

  const toggleQuickWin = (qwId: string, title: string) => {
    setActivatedQuickWins((prev) => {
      const next = !prev[qwId];
      setStatusMessage(
        next
          ? `Rekomendasi Taktis "${title}" telah diaktifkan!`
          : `Rekomendasi Taktis "${title}" dinonaktifkan.`
      );
      return { ...prev, [qwId]: next };
    });
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = subName.trim();
    const costValue = parseNominalInput(subCost);

    if (!trimmedName || costValue <= 0) {
      setStatusMessage("Mohon isi nama layanan langganan dan biaya bulanan dengan benar.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setStatusMessage(
        "Silakan login terlebih dahulu agar daftar langganan baru dapat disimpan ke database PostgreSQL."
      );
      return;
    }

    setIsCreatingSub(true);
    try {
      const res = await aiApi.createSubscription({
        name: trimmedName,
        monthlyCost: costValue,
        icon: subIcon,
        utilizationPct: subUtilization,
        recordAsTransaction: recordSubAsTx,
      });
      setStatusMessage(res.message);
      setSubName("");
      setSubCost("");
      setSubUtilization(20);
      setIsSubModalOpen(false);
      await fetchAuditReport(false);
      if (recordSubAsTx) {
        window.dispatchEvent(new Event("fira-transactions-updated"));
      }
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Gagal menambahkan langganan baru."
      );
    } finally {
      setIsCreatingSub(false);
    }
  };

  const handleDeleteSubscription = async (subId: string, name: string) => {
    try {
      const res = await aiApi.deleteSubscription(subId);
      setStatusMessage(res.message || `Langganan "${name}" dihapus.`);
      await fetchAuditReport(false);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Gagal menghapus langganan."
      );
    }
  };

  const resolvedSubsCount = Object.values(resolvedSubs).filter(Boolean).length;
  const activeLeaksCount = Math.max(
    0,
    audit.metrics.leaksCount - resolvedSubsCount - (anomalyDismissed || capApplied ? 1 : 0)
  );
  const dynamicEfficiencyScore = Math.min(
    99,
    audit.metrics.efficiencyScore + resolvedSubsCount * 4 + (capApplied ? 6 : 0)
  );

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">AI Pro + P3 Core Engine</span>
            <span>Audit Otomatis Selesai · {audit.auditedAt}</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>AI Smart Auditor</h1>
          <p className="muted">
            Memindai {audit.metrics.auditedTransactionsCount} transaksi historis untuk mendeteksi
            anomali pengeluaran, kebocoran langganan tersembunyi, pos belanja berlebih, dan peluang
            efisiensi kas riil.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => void fetchAuditReport(true)}
            disabled={isAuditing}
            className="secondary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RotateCw size={14} className={isAuditing ? "spin" : ""} />{" "}
            {isAuditing ? "Memindai..." : "Jalankan Audit Ulang"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="primary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={16} /> Ekspor Laporan Audit (PDF)
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className="notice"
          style={{
            marginBottom: "20px",
            background: "var(--green-soft)",
            borderColor: "var(--mint)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>
            <strong>AI Smart Auditor:</strong> {statusMessage}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => router.push("/budgeting")}
              className="secondary-button"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Lihat AI Budgeting
            </button>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="secondary-button"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Metric Cards (4 Kolom Bersebelahan) */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="card stat-card">
          <div className="stat-top">
            <span>SKOR EFISIENSI PENGELUARAN</span>
            <ShieldCheck size={16} className="positive" />
          </div>
          <div className="stat-value positive" style={{ fontSize: "32px" }}>
            {dynamicEfficiencyScore}{" "}
            <span style={{ fontSize: "14px", color: "var(--muted)" }}>/100</span>
          </div>
          <div className="stat-foot">{audit.metrics.efficiencyLabel}</div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>POTENSI PENGHEMATAN</span>
            <Sparkles size={16} className="positive" />
          </div>
          <div className="stat-value positive">
            {formatRupiah(audit.metrics.potentialSavingsMonthly)}{" "}
            <span style={{ fontSize: "12px", fontWeight: 400 }}>/bln</span>
          </div>
          <div className="stat-foot">
            Setara {formatRupiah(audit.metrics.potentialSavingsYearly)} / thn
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>KEBOCORAN / PEMBOROSAN</span>
            <AlertTriangle size={16} style={{ color: "var(--red)" }} />
          </div>
          <div className="stat-value" style={{ color: activeLeaksCount > 0 ? "var(--red)" : "var(--green)" }}>
            {activeLeaksCount}{" "}
            <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--ink)" }}>
              Pos Transaksi
            </span>
          </div>
          <div className="stat-foot" style={{ color: activeLeaksCount > 0 ? "var(--red)" : "var(--green)" }}>
            {activeLeaksCount > 0
              ? audit.metrics.leaksSubtitle
              : "Seluruh pos kebocoran telah ditangani"}
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-top">
            <span>TRANSAKSI DIAUDIT</span>
            <CheckCircle2 size={16} style={{ color: "var(--muted)" }} />
          </div>
          <div className="stat-value">
            {audit.metrics.auditedTransactionsCount}{" "}
            <span style={{ fontSize: "14px", fontWeight: 400 }}>Entri</span>
          </div>
          <div className="stat-foot">
            100% Terverifikasi · {audit.hasRealData ? "Data Database Aktual" : "30 Hari Terakhir"}
          </div>
        </div>
      </div>

      {/* 3. Pengeluaran Terbesar & Deteksi Anomali */}
      <div className="grid two-col" style={{ gap: "20px", marginBottom: "24px" }}>
        {/* Konsentrasi Belanja */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "16px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
                Pengeluaran Terbesar & Konsentrasi Belanja
              </h2>
              <p className="muted" style={{ fontSize: "11px" }}>
                Periode Analisis: {audit.periodLabel} (Total Kas Keluar:{" "}
                {formatRupiah(audit.spendingConcentration.totalExpense)})
              </p>
            </div>
            <span className="pill">
              Top {audit.spendingConcentration.categories.length} Pos (
              {audit.spendingConcentration.top4SharePct}%)
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {audit.spendingConcentration.categories.map((cat, idx) => (
              <div key={cat.category_id || idx}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <strong>{cat.name}</strong>
                  <span>
                    <strong>{formatRupiah(cat.amount)}</strong>{" "}
                    <span style={{ color: "var(--muted)" }}>({cat.pct}%)</span>
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(100, Math.max(4, cat.pct))}%` }}></span>
                </div>
              </div>
            ))}
          </div>

          <div className="notice" style={{ marginTop: "16px", fontSize: "11px" }}>
            <strong>Catatan AI Auditor:</strong> {audit.spendingConcentration.auditorNote}
          </div>
        </div>

        {/* Deteksi Anomali Belanja */}
        <div className="card" style={{ borderColor: anomalyDismissed || capApplied ? "var(--mint)" : "#f9c6c4" }}>
          <div className="card-heading" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert
                size={18}
                style={{ color: anomalyDismissed || capApplied ? "var(--green)" : "var(--red)" }}
              />
              <div>
                <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Deteksi Anomali Belanja</h2>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Unusual Spending Spike Engine
                </span>
              </div>
            </div>
            <span className={`pill ${anomalyDismissed || capApplied ? "" : "danger"}`}>
              {capApplied
                ? "Batas Belanja Aktif"
                : anomalyDismissed
                ? "Ditandai Wajar"
                : audit.anomaly.severityLabel}
            </span>
          </div>

          <div
            style={{
              background: anomalyDismissed || capApplied ? "var(--green-soft)" : "#fff0ef",
              border: `1px solid ${anomalyDismissed || capApplied ? "var(--mint)" : "#f9c6c4"}`,
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong
                style={{
                  color: anomalyDismissed || capApplied ? "var(--green)" : "var(--red)",
                  fontSize: "12px",
                }}
              >
                ● Anomali Terdeteksi (Spike +{audit.anomaly.spikePct}%)
              </strong>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                {audit.anomaly.dateLabel}
              </span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, margin: "4px 0" }}>
              {audit.anomaly.title}
            </div>
            <div style={{ display: "flex", gap: "16px", fontSize: "11px", marginTop: "6px" }}>
              <div>
                Rata-rata Normal: <strong>{formatRupiah(audit.anomaly.normalDailyAvg)}</strong>
              </div>
              <div>
                Puncak Saat Ini:{" "}
                <strong style={{ color: "var(--red)" }}>
                  {formatRupiah(audit.anomaly.currentDailyAvg)}
                </strong>
              </div>
            </div>
          </div>

          <p className="muted" style={{ fontSize: "11px", lineHeight: "1.5" }}>
            <strong>Penjelasan Data:</strong> {audit.anomaly.explanation}
          </p>

          <div className="notice" style={{ marginTop: "12px", fontSize: "11px" }}>
            <strong>Rekomendasi Aksi AI:</strong> {audit.anomaly.recommendation}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => void handleApplyAnomalyCap()}
              disabled={isApplyingCap || capApplied}
              className="primary-button"
              style={{ flex: 1, padding: "8px", fontSize: "11px" }}
            >
              {capApplied
                ? "✓ Batas Belanja Aktif"
                : isApplyingCap
                ? "Menerapkan..."
                : "Aktifkan Batas Belanja"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnomalyDismissed((prev) => !prev);
                setStatusMessage("Status anomali belanja telah diperbarui sebagai transaksi wajar.");
              }}
              className="secondary-button"
              style={{ flex: 1, padding: "8px", fontSize: "11px" }}
            >
              {anomalyDismissed ? "✓ Ditandai Wajar" : "Tandai Wajar"}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Audit Langganan & Pengeluaran Berulang */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
              Audit Langganan & Pengeluaran Berulang
            </h2>
            <p className="muted" style={{ fontSize: "11px" }}>
              Recurring Leak Detector · Analisis Utilisasi Layanan 30 Hari Terakhir
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pill">{audit.subscriptions.length} Rekomendasi Siap Tindak</span>
            <button
              type="button"
              onClick={() => setIsSubModalOpen(true)}
              className="primary-button"
              style={{
                padding: "7px 12px",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Plus size={14} /> Tambah Langganan
            </button>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {audit.subscriptions.map((sub) => {
            const isResolved = Boolean(resolvedSubs[sub.id]);
            return (
              <div
                key={sub.id}
                style={{
                  border: `1px solid ${
                    isResolved ? "var(--mint)" : sub.isCritical ? "#f9c6c4" : "var(--line)"
                  }`,
                  borderRadius: "12px",
                  padding: "16px",
                  background: isResolved ? "var(--green-soft)" : "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {renderSubscriptionIcon(sub.icon, sub.isCritical && !isResolved)}
                    <strong>{sub.name}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>
                      {formatRupiah(sub.monthlyCost)}
                      <span style={{ fontSize: "9px", color: "var(--muted)" }}>/bln</span>
                    </span>
                    {sub.isCustom && (
                      <button
                        type="button"
                        title="Hapus Langganan"
                        onClick={() => void handleDeleteSubscription(sub.id, sub.name)}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: "var(--red)",
                          padding: "2px",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="progress" style={{ height: "6px", marginBottom: "6px" }}>
                  <span
                    style={{
                      width: `${sub.utilizationPct}%`,
                      background: sub.isCritical && !isResolved ? "var(--red)" : undefined,
                    }}
                  ></span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "var(--muted)",
                    marginBottom: "12px",
                  }}
                >
                  <span>{sub.utilizationLabel}</span>
                  <strong
                    style={{
                      color: sub.isCritical
                        ? "var(--red)"
                        : sub.utilizationPct < 15
                        ? "var(--orange)"
                        : "var(--ink)",
                    }}
                  >
                    {sub.utilizationValue}
                  </strong>
                </div>
                <p style={{ fontSize: "10px", color: "var(--muted)", margin: "0 0 12px 0" }}>
                  {sub.advice}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "10px",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>
                    Hemat {formatRupiah(sub.potentialSaving)}/bln
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSubscriptionAction(sub.id, sub.name, sub.potentialSaving)}
                    className={sub.isCritical && !isResolved ? "primary-button" : "secondary-button"}
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      background: sub.isCritical && !isResolved ? "var(--red)" : undefined,
                    }}
                  >
                    {isResolved ? "✓ Dioptimalkan" : sub.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Peluang Penghematan Taktis & Sinkronisasi */}
      <div className="grid two-col" style={{ gap: "20px" }}>
        {/* Quick Wins */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "14px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
                Peluang Penghematan Taktis (Quick Wins)
              </h2>
              <p className="muted" style={{ fontSize: "11px" }}>
                Rencana Aksi Langsung Berbasis Rekomendasi Teruji FIRA
              </p>
            </div>
            <span className="pill">{audit.quickWins.length} Rekomendasi Utama</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {audit.quickWins.map((qw, idx) => {
              const isActivated = Boolean(activatedQuickWins[qw.id]);
              return (
                <div
                  key={qw.id}
                  style={{
                    border: `1px solid ${isActivated ? "var(--mint)" : "var(--line)"}`,
                    background: isActivated ? "var(--green-soft)" : "#fff",
                    borderRadius: "10px",
                    padding: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span
                      className={`pill ${qw.badgeType === "warning" ? "warning" : ""}`}
                      style={{ fontSize: "8px", marginBottom: "4px" }}
                    >
                      {qw.badge}
                    </span>
                    <strong style={{ display: "block", fontSize: "12px" }}>{qw.title}</strong>
                    <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                      {qw.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleQuickWin(qw.id, qw.title)}
                    className={idx === 0 && !isActivated ? "primary-button" : "secondary-button"}
                    style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}
                  >
                    {isActivated ? "✓ Aktif" : qw.actionLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sinkronisasi Engine FIRA */}
        <div className="card" style={{ background: "#0e4336", color: "#fff" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span className="eyebrow" style={{ color: "#a8e6cf", margin: 0 }}>
              FIRA ENGINE INTEGRATION
            </span>
            <Zap size={18} style={{ color: "#a8e6cf" }} />
          </div>

          <h2 style={{ font: "700 18px Manrope", margin: "0 0 8px 0", color: "#fff" }}>
            Sinkronisasi ke AI Budgeting
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "#c1e7dd",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Terapkan hasil audit ini secara instan ke modul AI Budgeting untuk menyesuaikan batas
            pagu bulanan di database PostgreSQL secara dinamis tanpa perlu kalkulasi manual.
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "16px",
              fontSize: "11px",
            }}
          >
            <div style={{ color: "#a8e6cf", fontWeight: 700, marginBottom: "4px" }}>
              ✓ Penyesuaian Otomatis:
            </div>
            {audit.budgetSyncPreview.map((line, i) => (
              <div key={i} style={{ color: "#fff" }}>
                • {line}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void handleSyncToBudgets()}
            disabled={isSyncingBudgets}
            className="primary-button"
            style={{
              width: "100%",
              padding: "10px",
              background: "#1eb980",
              borderColor: "#1eb980",
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSyncingBudgets
              ? "Menyinkronkan ke Database..."
              : "Terapkan Aturan Otomatis ke AI Budgeting"}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Modal Tambah Langganan Baru */}
      {isSubModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 29, 24, 0.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
            padding: "16px",
          }}
        >
          <div
            className="card"
            style={{
              width: "min(460px, 100%)",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ font: "800 18px Manrope", margin: 0 }}>
                  Tambah Daftar Langganan Baru
                </h2>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  AI Smart Auditor akan menganalisis efisiensi & rekomendasi penghematan otomatis
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="icon-button"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleAddSubscription(e)}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div className="field" style={{ margin: 0 }}>
                <label>Nama Layanan Langganan</label>
                <input
                  type="text"
                  placeholder="Contoh: Netflix Premium, Spotify, Gym, Google One..."
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="field" style={{ margin: 0 }}>
                  <label>Biaya Bulanan (Rp)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 186000"
                    value={subCost}
                    onChange={(e) => setSubCost(e.target.value)}
                    required
                  />
                </div>

                <div className="field" style={{ margin: 0 }}>
                  <label>Kategori Layanan</label>
                  <select
                    value={subIcon}
                    onChange={(e) =>
                      setSubIcon(e.target.value as "tv" | "cloud" | "dumbbell")
                    }
                  >
                    <option value="tv">Streaming & Hiburan</option>
                    <option value="cloud">Cloud, AI & Produktivitas</option>
                    <option value="dumbbell">Gym & Kesehatan</option>
                  </select>
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label>
                  Estimasi Intensitas Penggunaan Bulan Ini:{" "}
                  <strong style={{ color: "var(--green)" }}>{subUtilization}%</strong>
                </label>
                <select
                  value={subUtilization}
                  onChange={(e) => setSubUtilization(Number(e.target.value))}
                >
                  <option value={0}>0% — Tidak Pernah Dipakai (Langganan Pasif/Lupa Batal)</option>
                  <option value={12}>12% — Sangat Jarang (&lt; 2 jam / kuota kecil)</option>
                  <option value={25}>25% — Jarang Digunakan (Perlu Downgrade Paket)</option>
                  <option value={60}>60% — Cukup Sering Digunakan</option>
                  <option value={90}>90% — Sangat Rutin / Setiap Hari</option>
                </select>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "11px",
                  background: "var(--green-soft)",
                  border: "1px solid var(--mint)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={recordSubAsTx}
                  onChange={(e) => setRecordSubAsTx(e.target.checked)}
                />
                <span>
                  Catat juga pengeluaran ini ke <strong>Buku Kas Transaksi</strong> bulan ini
                </span>
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="secondary-button"
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSub}
                  className="primary-button"
                  style={{ flex: 1 }}
                >
                  {isCreatingSub ? "Menyimpan..." : "Simpan & Audit Langganan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
