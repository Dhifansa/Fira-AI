"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  RotateCcw,
  Bookmark,
  Play,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { aiApi, getAuthToken, parseNominalInput } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { WhatIfSimulationData, WhatIfSimulationInput } from "@/types";

interface PresetConfig {
  id: string;
  label: string;
  badgeName: string;
  input: Required<WhatIfSimulationInput>;
}

const PRESETS: PresetConfig[] = [
  {
    id: "laptop",
    label: "Beli Laptop Rp 15 Juta (Cicilan 12x)",
    badgeName: "Preset: Laptop Pro",
    input: {
      scenarioType: "Pengeluaran Besar",
      scenarioName: "Upgrade Laptop Kerja M3 Max",
      totalAmount: 15000000,
      paymentMethod: "cicilan12",
      downPayment: 3000000,
      tenorMonths: 12,
      autoCompensate: true,
    },
  },
  {
    id: "investasi",
    label: "Tambah Investasi +Rp 500.000 / bln",
    badgeName: "Preset: Reksa Dana Rutin",
    input: {
      scenarioType: "Investasi",
      scenarioName: "Investasi Rutin Reksa Dana Indeks",
      totalAmount: 6000000,
      paymentMethod: "cicilan12",
      downPayment: 0,
      tenorMonths: 12,
      autoCompensate: true,
    },
  },
  {
    id: "gayahidup",
    label: "Pangkas Gaya Hidup 15%",
    badgeName: "Preset: Efisiensi Kuliner",
    input: {
      scenarioType: "Anggaran",
      scenarioName: "Efisiensi Gaya Hidup & Kuliner 15%",
      totalAmount: 13350000,
      paymentMethod: "cicilan12",
      downPayment: 0,
      tenorMonths: 12,
      autoCompensate: true,
    },
  },
  {
    id: "kpr",
    label: "KPR Rumah Baru Rp 4.200.000 / bln",
    badgeName: "Preset: Cicilan KPR",
    input: {
      scenarioType: "Utang/Kredit",
      scenarioName: "Simulasi Angsuran KPR Rumah Pertama",
      totalAmount: 100000000,
      paymentMethod: "cicilan12",
      downPayment: 20000000,
      tenorMonths: 24,
      autoCompensate: true,
    },
  },
];

const INITIAL_SIMULATION: WhatIfSimulationData = {
  hasRealData: false,
  parameters: {
    scenarioType: "Pengeluaran Besar",
    scenarioName: "Upgrade Laptop Kerja M3 Max",
    totalAmount: 15000000,
    paymentMethod: "cicilan12",
    downPayment: 3000000,
    tenorMonths: 12,
    autoCompensate: true,
    monthlyInstallment: 1060000,
    compensationCut: 477000,
  },
  baseline: {
    actualNetCashflow: 5430000,
    actualIncome: 12850000,
    actualExpense: 7420000,
    actualEmergencyMonths: 6.4,
    actualHealthScore: 88,
  },
  impact: {
    projectedNetCashflow: 4847000,
    cashflowDelta: -583000,
    cashflowDeltaPct: -10.7,
    projectedEmergencyMonths: 5.9,
    emergencyDelta: -0.5,
    dsrPercentage: 8.2,
    dsrStatus: "Sangat Rendah (Batas Aman Maksimal 30%)",
    projectedHealthScore: 85,
    healthDelta: -3,
  },
  projectionBars: [
    { label: "Des", surplus: 4847000, heightPct: 68 },
    { label: "Jan", surplus: 5040000, heightPct: 72 },
    { label: "Feb", surplus: 5230000, heightPct: 75 },
    { label: "Mar", surplus: 5420000, heightPct: 78 },
    { label: "Apr", surplus: 5610000, heightPct: 82 },
    { label: "Mei", surplus: 5800000, heightPct: 86 },
  ],
  evaluation: {
    badge: "REKOMENDASI: LAYAK DIAMBIL",
    level: "safe",
    points: [
      "✓ Pembelian laptop Rp 15.000.000 dengan cicilan 12 bulan TIDAK mengganggu stabilitas arus kas pokok Anda.",
      "⚠️ Pembayaran DP Rp 3.000.000 sedikit mengikis bantalan dana darurat dari 6.4 bulan ke 5.9 bulan. Mengaktifkan kompensasi penghematan F&B akan menjaga surplus tetap optimal.",
    ],
  },
  comparisonMatrix: {
    optionA_Cash: {
      upfront: "Rp 15.000.000 (Tunai)",
      monthlyLoad: "Rp 0 / bulan",
      emergencyImpact: "Turun ke 3.6 Bulan (Kritis)",
      emergencySeverity: "danger",
      totalCost: "Rp 15.000.000 (Nett)",
      verdict: "Risiko Likuiditas",
    },
    optionB_Installment: {
      upfront: "Rp 3.000.000 (DP 20%)",
      monthlyLoad: "Rp 1.060.000 / bulan (12x)",
      emergencyImpact: "Turun ke 5.9 Bulan (Aman)",
      emergencySeverity: "safe",
      totalCost: "Rp 15.720.000 (Bunga Rp 720.000)",
      verdict: "Paling Seimbang",
    },
    optionC_SaveFirst: {
      upfront: "Rp 0 Hari Ini",
      monthlyLoad: "Rp 5.000.000 / bln (Selama 3 Bln)",
      emergencyImpact: "Tetap 6.4 Bulan (Terjaga)",
      emergencySeverity: "safe",
      totalCost: "Rp 15.000.000 (Bebas Bunga)",
      verdict: "Paling Hemat Finansial",
    },
  },
};

export default function WhatIfSimulatorPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState("laptop");
  const [scenarioType, setScenarioType] = useState("Pengeluaran Besar");
  const [scenarioName, setScenarioName] = useState("Upgrade Laptop Kerja M3 Max");
  const [totalAmountInput, setTotalAmountInput] = useState("Rp 15.000.000");
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "cicilan12">("cicilan12");
  const [downPaymentInput, setDownPaymentInput] = useState("3.000.000");
  const [tenorMonths, setTenorMonths] = useState(12);
  const [autoCompensate, setAutoCompensate] = useState(true);

  const [simResult, setSimResult] = useState<WhatIfSimulationData>(INITIAL_SIMULATION);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const executeSimulation = useCallback(async (payload: WhatIfSimulationInput) => {
    await Promise.resolve();
    setIsCalculating(true);
    try {
      const res = await aiApi.runWhatIfSimulation(payload);
      setSimResult(res);
    } catch {
      // Gunakan hasil kalkulasi terakhir jika koneksi tertunda
    } finally {
      setIsCalculating(false);
    }
  }, []);

  useEffect(() => {
    const initialPreset = PRESETS[0].input;
    const timer = window.setTimeout(() => {
      void executeSimulation(initialPreset);
    }, 0);

    const handleSync = () => {
      void executeSimulation({
        scenarioType,
        scenarioName,
        totalAmount: parseNominalInput(totalAmountInput),
        paymentMethod,
        downPayment: parseNominalInput(downPaymentInput),
        tenorMonths,
        autoCompensate,
      });
    };
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [executeSimulation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPreset = (preset: PresetConfig) => {
    setSelectedPreset(preset.id);
    setScenarioType(preset.input.scenarioType);
    setScenarioName(preset.input.scenarioName);
    setTotalAmountInput(formatRupiah(preset.input.totalAmount));
    setPaymentMethod(preset.input.paymentMethod);
    setDownPaymentInput(new Intl.NumberFormat("id-ID").format(preset.input.downPayment));
    setTenorMonths(preset.input.tenorMonths);
    setAutoCompensate(preset.input.autoCompensate);
    setFeedbackMsg(null);
    void executeSimulation(preset.input);
  };

  const handleRecalculateForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const totalAmount = Math.max(100000, parseNominalInput(totalAmountInput));
    const downPayment = Math.max(0, parseNominalInput(downPaymentInput));
    void executeSimulation({
      scenarioType,
      scenarioName,
      totalAmount,
      paymentMethod,
      downPayment,
      tenorMonths,
      autoCompensate,
    });
  };

  const handleSaveScenario = async () => {
    const token = getAuthToken();
    const totalAmount = Math.max(100000, parseNominalInput(totalAmountInput));
    if (!token) {
      setFeedbackMsg(
        `Simulasi "${scenarioName}" siap disimpan. Silakan login terlebih dahulu agar tersimpan ke tabel Financial Goals di database PostgreSQL.`
      );
      return;
    }

    setIsSavingScenario(true);
    try {
      const res = await aiApi.saveWhatIfScenario({
        scenarioName,
        totalAmount,
        tenorMonths,
      });
      setFeedbackMsg(res.message);
    } catch (err) {
      setFeedbackMsg(
        err instanceof Error ? err.message : "Gagal menyimpan skenario ke Financial Goals."
      );
    } finally {
      setIsSavingScenario(false);
    }
  };

  const handleToggleCompareCash = () => {
    const nextMethod = paymentMethod === "tunai" ? "cicilan12" : "tunai";
    setPaymentMethod(nextMethod);
    const totalAmount = Math.max(100000, parseNominalInput(totalAmountInput));
    const downPayment = Math.max(0, parseNominalInput(downPaymentInput));
    void executeSimulation({
      scenarioType,
      scenarioName,
      totalAmount,
      paymentMethod: nextMethod,
      downPayment,
      tenorMonths,
      autoCompensate,
    });
  };

  const currentPresetBadge =
    PRESETS.find((p) => p.id === selectedPreset)?.badgeName || "Skenario Kustom";

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">Simulasi Interaktif · P3 Advanced</span>
            <span>
              {simResult.hasRealData
                ? "Berbasis Data Buku Kas PostgreSQL Aktual"
                : "Berbasis Data Aktual (Nov 2026)"}
            </span>
          </div>
          <h1 style={{ marginTop: "4px" }}>What-If Simulator</h1>
          <p className="muted">
            Eksplorasi keputusan finansial besar sebelum mengambil risiko. Uji dampak cicilan,
            pembelian aset, kenaikan tabungan, atau efisiensi biaya terhadap arus kas dan ketahanan
            dana darurat Anda.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => handleSelectPreset(PRESETS[0])}
            className="secondary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSaveScenario()}
            disabled={isSavingScenario}
            className="primary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Bookmark size={16} />{" "}
            {isSavingScenario ? "Menyimpan..." : "Simpan Skenario Ini"}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className="notice"
          style={{
            background: "var(--green-soft)",
            borderColor: "var(--mint)",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>
            <strong>What-If Simulator:</strong> {feedbackMsg}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => router.push("/financial-goals")}
              className="secondary-button"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Lihat Financial Goals
            </button>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="secondary-button"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Mode Simulasi Mandiri Banner */}
      <div
        className="notice"
        style={{
          background: "var(--green-soft)",
          borderColor: "var(--mint)",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sliders size={18} className="positive" />
          <span>
            <strong>Mode Simulasi Mandiri (Sandboxed Environment):</strong> Hasil proyeksi
            merupakan pemodelan matematis berbasis data historis dan asumsi yang Anda masukkan,
            terpisah dari saldo atau buku kas riil akun perbankan Anda.
          </span>
        </div>
        <span style={{ fontSize: "10px", color: "var(--green)", fontWeight: 700 }}>
          Aman & Terisolasi
        </span>
      </div>

      {/* 2. Preset Skenario Populer */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--muted)",
            marginBottom: "8px",
          }}
        >
          PRESET SKENARIO POPULER
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="secondary-button"
              style={{
                fontSize: "11px",
                padding: "6px 12px",
                background: selectedPreset === preset.id ? "var(--green-soft)" : "#fff",
                borderColor: selectedPreset === preset.id ? "var(--mint)" : "var(--line)",
                color: selectedPreset === preset.id ? "var(--green)" : "var(--ink)",
                fontWeight: selectedPreset === preset.id ? 700 : 500,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid Utama 2 Kolom (Parameter vs Hasil) */}
      <div
        className="grid two-col"
        style={{ gridTemplateColumns: "1.1fr 1fr", gap: "20px", marginBottom: "28px" }}
      >
        {/* SISI KIRI: Parameter Skenario */}
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="stat-icon">
                <Sliders size={18} />
              </div>
              <div>
                <h2 style={{ font: "700 16px Manrope", margin: 0 }}>Parameter Skenario</h2>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Atur variabel simulasi dan asumsi pembayaran
                </span>
              </div>
            </div>
            <span className="pill">{currentPresetBadge}</span>
          </div>

          <form
            onSubmit={handleRecalculateForm}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Jenis Skenario
              </label>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}
              >
                {["Pengeluaran Besar", "Investasi", "Utang/Kredit", "Anggaran"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScenarioType(type)}
                    className={scenarioType === type ? "primary-button" : "secondary-button"}
                    style={{ padding: "6px", fontSize: "10px" }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Nama Skenario</label>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>

            <div className="field" style={{ margin: 0 }}>
              <label>Total Nilai Transaksi (Rp)</label>
              <input
                type="text"
                value={totalAmountInput}
                onChange={(e) => setTotalAmountInput(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Metode Pembayaran
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: `1px solid ${
                      paymentMethod === "tunai" ? "var(--mint)" : "var(--line)"
                    }`,
                    background: paymentMethod === "tunai" ? "var(--green-soft)" : "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "tunai"}
                    onChange={() => setPaymentMethod("tunai")}
                  />
                  <div>
                    <strong
                      style={{ color: paymentMethod === "tunai" ? "var(--green)" : undefined }}
                    >
                      Tunai Sekaligus (Cash Direct)
                    </strong>
                    <span
                      style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}
                    >
                      Potong langsung dari saldo tabungan kas (
                      {formatRupiah(parseNominalInput(totalAmountInput))})
                    </span>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: `1px solid ${
                      paymentMethod === "cicilan12" ? "var(--mint)" : "var(--line)"
                    }`,
                    background: paymentMethod === "cicilan12" ? "var(--green-soft)" : "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cicilan12"}
                    onChange={() => setPaymentMethod("cicilan12")}
                  />
                  <div>
                    <strong
                      style={{
                        color: paymentMethod === "cicilan12" ? "var(--green)" : undefined,
                      }}
                    >
                      Cicilan {tenorMonths} Bulan (Bunga 0.5%/bln)
                    </strong>
                    <span
                      style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}
                    >
                      DP {formatRupiah(parseNominalInput(downPaymentInput))} · Angsuran{" "}
                      <strong>
                        {formatRupiah(simResult.parameters.monthlyInstallment)} / bln
                      </strong>
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label>Uang Muka / DP (Rp)</label>
                <input
                  type="text"
                  value={downPaymentInput}
                  disabled={paymentMethod === "tunai"}
                  onChange={(e) => setDownPaymentInput(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Tenor/Periode</label>
                <select
                  value={tenorMonths}
                  onChange={(e) => setTenorMonths(Number(e.target.value))}
                >
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan (Des 2026 - Nov 2027)</option>
                  <option value={24}>24 Bulan</option>
                </select>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "12px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <input
                  type="checkbox"
                  id="kompensasi"
                  checked={autoCompensate}
                  onChange={(e) => setAutoCompensate(e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="kompensasi" style={{ fontSize: "11px", fontWeight: 700 }}>
                  Kompensasi Anggaran Otomatis
                </label>
              </div>
              <p className="muted" style={{ fontSize: "10px", margin: 0, paddingLeft: "24px" }}>
                FIRA akan secara otomatis memotong pos non-esensial untuk menyerap cicilan{" "}
                {formatRupiah(simResult.parameters.monthlyInstallment)} agar surplus bulanan Anda
                tetap terjaga.
              </p>
              {autoCompensate && (
                <div
                  style={{
                    margin: "8px 0 0 24px",
                    fontSize: "10px",
                    color: "var(--green)",
                    fontWeight: 600,
                  }}
                >
                  • Pangkas Pos Hiburan & Kuliner: -
                  {formatRupiah(simResult.parameters.compensationCut)} / bln
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="primary-button"
              style={{
                marginTop: "8px",
                padding: "12px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Play size={16} />{" "}
              {isCalculating ? "Menghitung Proyeksi..." : "Jalankan Kalkulasi Ulang Skenario"}
            </button>
          </form>
        </div>

        {/* SISI KANAN: Hasil Proyeksi & Evaluasi AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card 1: Dampak Metrik Finansial */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "14px" }}>
              <h2>Dampak terhadap Indikator Keuangan</h2>
              <span className="pill">Setelah Simulasi</span>
            </div>

            <div className="grid two-col" style={{ gap: "12px" }}>
              <div
                style={{
                  border: "1px solid var(--line)",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8faf9",
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Arus Kas Bulanan (Net)
                </div>
                <div
                  style={{
                    font: "800 20px Manrope",
                    color:
                      simResult.impact.projectedNetCashflow >= 0 ? "var(--green)" : "var(--red)",
                    margin: "2px 0",
                  }}
                >
                  {simResult.impact.projectedNetCashflow >= 0 ? "+" : ""}
                  {formatRupiah(simResult.impact.projectedNetCashflow)}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: simResult.impact.cashflowDelta >= 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  Aktual: {formatRupiah(simResult.baseline.actualNetCashflow)} (
                  {simResult.impact.cashflowDelta >= 0 ? "+" : ""}
                  {formatRupiah(simResult.impact.cashflowDelta)} /{" "}
                  {simResult.impact.cashflowDeltaPct}%)
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8faf9",
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Ketahanan Dana Darurat
                </div>
                <div
                  style={{
                    font: "800 20px Manrope",
                    color:
                      simResult.impact.projectedEmergencyMonths >= 4
                        ? "var(--green)"
                        : "var(--red)",
                    margin: "2px 0",
                  }}
                >
                  {simResult.impact.projectedEmergencyMonths} Bulan
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Aktual: {simResult.baseline.actualEmergencyMonths} Bulan (
                  {simResult.impact.emergencyDelta >= 0 ? "+" : ""}
                  {simResult.impact.emergencyDelta} Bulan)
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8faf9",
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Rasio Beban Cicilan (DSR)
                </div>
                <div
                  style={{
                    font: "800 20px Manrope",
                    color: simResult.impact.dsrPercentage <= 30 ? "var(--green)" : "var(--red)",
                    margin: "2px 0",
                  }}
                >
                  {simResult.impact.dsrPercentage}%
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: simResult.impact.dsrPercentage <= 30 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {simResult.impact.dsrStatus}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid var(--line)",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f8faf9",
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Skor Financial Health
                </div>
                <div
                  style={{ font: "800 20px Manrope", color: "var(--green)", margin: "2px 0" }}
                >
                  {simResult.impact.projectedHealthScore}{" "}
                  <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span>
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Aktual: {simResult.baseline.actualHealthScore}/100 (
                  {simResult.impact.healthDelta >= 0 ? "+" : ""}
                  {simResult.impact.healthDelta} Poin Terprediksi)
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Grafik Proyeksi Arus Kas 12 Bulan */}
          <div className="card">
            <div className="card-heading" style={{ marginBottom: "10px" }}>
              <div>
                <h3 style={{ font: "700 15px Manrope", margin: 0 }}>
                  Proyeksi Arus Kas 12 Bulan
                </h3>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                  Des 2026 – Nov 2027
                </span>
              </div>
              <span className="pill">
                {simResult.impact.projectedNetCashflow > 0
                  ? "Simulasi Stabil"
                  : "Perlu Penyesuaian"}
              </span>
            </div>

            <div className="chart" style={{ height: "120px" }}>
              {simResult.projectionBars.map((bar) => (
                <div key={bar.label} className="chart-col">
                  <div
                    className="bar dark"
                    style={{ height: `${bar.heightPct}%` }}
                    title={`${bar.label}: ${formatRupiah(bar.surplus)}`}
                  ></div>
                  <span className="chart-label">{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="notice" style={{ marginTop: "12px", fontSize: "10px" }}>
              <CheckCircle2
                size={14}
                className="positive"
                style={{ float: "left", marginRight: "6px", marginTop: "1px" }}
              />
              Surplus diproyeksikan berada pada level{" "}
              {formatRupiah(simResult.impact.projectedNetCashflow)}/bulan,{" "}
              {simResult.impact.projectedNetCashflow > 0
                ? "masih berada aman di atas batas defisit Rp 0."
                : "perlu penyesuaian tenor atau penghematan tambahan."}
            </div>
          </div>

          {/* Card 3: Evaluasi AI FIRA */}
          <div
            className="card"
            style={{
              background:
                simResult.evaluation.level === "safe"
                  ? "#e8f4ee"
                  : simResult.evaluation.level === "warning"
                  ? "#fff4e7"
                  : "#fff0ef",
              borderColor:
                simResult.evaluation.level === "safe" ? "var(--mint)" : "#f9c6c4",
            }}
          >
            <div className="card-heading" style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} className="positive" />
                <h3
                  style={{
                    font: "700 15px Manrope",
                    margin: 0,
                    color: "var(--green)",
                  }}
                >
                  Evaluasi AI FIRA
                </h3>
              </div>
              <span
                className="pill"
                style={{
                  background:
                    simResult.evaluation.level === "safe"
                      ? "var(--green)"
                      : "var(--red)",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                {simResult.evaluation.badge}
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "var(--ink)", lineHeight: "1.5" }}>
              {simResult.evaluation.points.map((pt, idx) => (
                <p
                  key={idx}
                  style={{
                    margin:
                      idx < simResult.evaluation.points.length - 1 ? "0 0 8px 0" : 0,
                  }}
                >
                  {pt}
                </p>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button
                type="button"
                onClick={() => {
                  setAutoCompensate(true);
                  const totalAmount = Math.max(100000, parseNominalInput(totalAmountInput));
                  const downPayment = Math.max(0, parseNominalInput(downPaymentInput));
                  void executeSimulation({
                    scenarioType,
                    scenarioName,
                    totalAmount,
                    paymentMethod,
                    downPayment,
                    tenorMonths,
                    autoCompensate: true,
                  });
                  setFeedbackMsg("Aturan kompensasi penghematan otomatis telah diaktifkan!");
                }}
                className="primary-button"
                style={{ flex: 1, padding: "8px", fontSize: "11px" }}
              >
                {autoCompensate ? "✓ Kompensasi Penghematan Aktif" : "Aktifkan Aturan Penghematan"}
              </button>
              <button
                type="button"
                onClick={handleToggleCompareCash}
                className="secondary-button"
                style={{ flex: 1, padding: "8px", fontSize: "11px" }}
              >
                {paymentMethod === "tunai"
                  ? "Bandingkan Opsi Cicilan"
                  : "Bandingkan Opsi Bayar Tunai"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tabel Matriks Perbandingan Multi-Skenario */}
      <div className="card">
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
              Matriks Perbandingan Multi-Skenario
            </h2>
            <p className="muted" style={{ fontSize: "11px" }}>
              Uji 3 alternatif strategi untuk &ldquo;{simResult.parameters.scenarioName}&rdquo;
              sebelum membuat komitmen finansial permanen
            </p>
          </div>
          <span className="pill">Model Objektif FIRA</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>PARAMETER EVALUASI</th>
                <th>
                  OPSI A: BAYAR TUNAI{" "}
                  {paymentMethod === "tunai" ? "(TERPILIH)" : "(CASH FULL)"}
                </th>
                <th>
                  OPSI B: CICILAN {simResult.parameters.tenorMonths}X{" "}
                  {paymentMethod === "cicilan12" ? "(TERPILIH)" : ""}
                </th>
                <th>OPSI C: TABUNG 3 BULAN & NABUNG</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Pengeluaran Awal (Upfront)</strong>
                </td>
                <td>
                  <strong style={{ color: "var(--red)" }}>
                    {simResult.comparisonMatrix.optionA_Cash.upfront}
                  </strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionB_Installment.upfront}</strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionC_SaveFirst.upfront}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Beban Bulanan (Next {simResult.parameters.tenorMonths} Mths)</strong>
                </td>
                <td>
                  <strong className="positive">
                    {simResult.comparisonMatrix.optionA_Cash.monthlyLoad}
                  </strong>
                </td>
                <td>
                  <strong>
                    {simResult.comparisonMatrix.optionB_Installment.monthlyLoad}
                  </strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionC_SaveFirst.monthlyLoad}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Dampak Dana Darurat</strong>
                </td>
                <td>
                  <span
                    className={`pill ${
                      simResult.comparisonMatrix.optionA_Cash.emergencySeverity === "danger"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {simResult.comparisonMatrix.optionA_Cash.emergencyImpact}
                  </span>
                </td>
                <td>
                  <span className="pill">
                    {simResult.comparisonMatrix.optionB_Installment.emergencyImpact}
                  </span>
                </td>
                <td>
                  <span className="pill">
                    {simResult.comparisonMatrix.optionC_SaveFirst.emergencyImpact}
                  </span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total Biaya Finansial</strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionA_Cash.totalCost}</strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionB_Installment.totalCost}</strong>
                </td>
                <td>
                  <strong>{simResult.comparisonMatrix.optionC_SaveFirst.totalCost}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Skor Keseimbangan FIRA</strong>
                </td>
                <td>
                  <span className="pill warning">
                    {simResult.comparisonMatrix.optionA_Cash.verdict}
                  </span>
                </td>
                <td>
                  <span
                    className="pill"
                    style={{ background: "var(--green)", color: "#fff" }}
                  >
                    {simResult.comparisonMatrix.optionB_Installment.verdict}
                  </span>
                </td>
                <td>
                  <span className="pill">
                    {simResult.comparisonMatrix.optionC_SaveFirst.verdict}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
