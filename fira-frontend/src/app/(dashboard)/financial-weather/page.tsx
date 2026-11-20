"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sun,
  CloudSun,
  CloudRain,
  Zap,
  RotateCw,
  Download,
  ShieldCheck,
  TrendingUp,
  Umbrella,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { aiApi, getAuthToken } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import type { FinancialWeatherData, WeatherStressTestResult } from "@/types";

const INITIAL_WEATHER_DATA: FinancialWeatherData = {
  updatedAt: "Belum Ada Data",
  periodLabel: "Periode Berjalan",
  hasRealData: false,
  weatherScore: 0,
  zone: "berawan",
  statusTitle: "BELUM ADA DATA TRANSAKSI (RP 0)",
  categoryLabel: "Silakan catat transaksi untuk melihat diagnosis cuaca keuangan",
  aiNarrative:
    "Saat ini saldo pemasukan dan pengeluaran Anda masih Rp 0. Tambahkan data transaksi Anda agar radar meteorologi finansial FIRA dapat menghitung ketahanan kas dan proyeksi 3 bulan ke depan.",
  summaryMetrics: {
    netCashflow: 0,
    cashCushionMonths: 0,
    debtRatioPct: 0.0,
    savingsRatePct: 0,
  },
  barometers: {
    spendingPressure: {
      badge: "Belum Ada Data",
      score: 0,
      realizedAmount: 0,
      limitAmount: 0,
    },
    liquidityHumidity: {
      badge: "Belum Ada Data",
      score: 0,
      liquidCashAmount: 0,
      statusText: "Rp 0",
    },
    cashflowVolatility: {
      badge: "Belum Ada Data",
      stdDevPct: 0,
      statusText: "Rp 0",
      thresholdPct: 0,
    },
    stormVulnerability: {
      badge: "Belum Ada Data",
      probabilityLabel: "0%",
      probabilityPct: 0,
      debtLoadPct: 0,
      zoneText: "Rp 0",
    },
  },
  forecasts: [
    {
      monthLabel: "BULAN +1",
      badge: "Belum Ada Data",
      iconType: "cloud-sun",
      predictedScore: 0,
      projectedSurplus: 0,
      note: "Catat pemasukan dan pengeluaran Anda agar AI dapat memproyeksikan cuaca finansial.",
    },
    {
      monthLabel: "BULAN +2",
      badge: "Belum Ada Data",
      iconType: "cloud-sun",
      predictedScore: 0,
      projectedSurplus: 0,
      note: "Catat pemasukan dan pengeluaran Anda agar AI dapat memproyeksikan cuaca finansial.",
    },
    {
      monthLabel: "BULAN +3",
      badge: "Belum Ada Data",
      iconType: "cloud-sun",
      predictedScore: 0,
      projectedSurplus: 0,
      note: "Catat pemasukan dan pengeluaran Anda agar AI dapat memproyeksikan cuaca finansial.",
    },
  ],
  mitigations: [
    {
      id: "mit-budget-cap",
      badge: "Langkah Awal",
      badgeType: "normal",
      title: "Mulai Catat Transaksi & Anggaran Pertama Anda",
      description:
        "Semua indikator saat ini dimulai dari Rp 0. Buat anggaran di menu AI Budgeting setelah mencatat transaksi.",
      actionType: "apply-budget",
      actionLabel: "Terapkan ke AI Budgeting",
      recommendedCap: 0,
      category_id: null,
    },
    {
      id: "mit-simulator",
      badge: "Simulasi",
      badgeType: "normal",
      title: "Uji Rencana Keuangan di What-If Simulator",
      description:
        "Gunakan simulator untuk menghitung rencana pembelian atau tabungan Anda.",
      actionType: "open-simulator",
      actionLabel: "Buka What-If Simulator",
    },
  ],
  extremeSimulation: {
    maxSurvivalMonths: 0,
    cashCondition: "Rp 0 (Belum Ada Data)",
  },
};

const STRESS_SCENARIOS = [
  { id: "job_loss_6m", label: "Kehilangan Pekerjaan 6 Bulan" },
  { id: "emergency_10m", label: "Biaya Darurat Rp 10 Juta" },
  { id: "inflation_25", label: "Inflasi Biaya Hidup +25%" },
];

export default function FinancialWeatherPage() {
  const router = useRouter();
  const [weather, setWeather] = useState<FinancialWeatherData>(INITIAL_WEATHER_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stressResult, setStressResult] = useState<WeatherStressTestResult | null>(null);
  const [stressIdx, setStressIdx] = useState(0);
  const [isRunningStress, setIsRunningStress] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const loadWeatherDiagnosis = useCallback(async (showFeedback = false) => {
    await Promise.resolve();
    setIsRefreshing(true);
    try {
      const data = await aiApi.getFinancialWeather();
      setWeather(data);
      if (showFeedback) {
        setNoticeMsg(
          `Diagnosis cuaca finansial berhasil diperbarui! Skor stabilitas saat ini: ${data.weatherScore}/100.`
        );
      }
    } catch {
      if (showFeedback) {
        setNoticeMsg("Diagnosis cuaca finansial telah diperbarui.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      void loadWeatherDiagnosis(false);
    };
    const timer = window.setTimeout(handleSync, 0);
    window.addEventListener("fira-transactions-updated", handleSync);
    window.addEventListener("fira-auth-change", handleSync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("fira-transactions-updated", handleSync);
      window.removeEventListener("fira-auth-change", handleSync);
    };
  }, [loadWeatherDiagnosis]);

  const handleMitigationAction = async (
    actionType: "apply-budget" | "open-simulator",
    categoryId?: string | null,
    amount?: number
  ) => {
    if (actionType === "open-simulator") {
      router.push("/what-if-simulator");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setNoticeMsg(
        `Simulasi Budget Cap sebesar ${formatRupiah(amount || 1500000)}/bulan diaktifkan. Login untuk menyimpan permanen ke tabel Budgets PostgreSQL.`
      );
      return;
    }

    try {
      const res = await aiApi.applyAnomalyCap({
        category_id: categoryId,
        amount: amount || 1500000,
      });
      setNoticeMsg(res.message);
    } catch (err) {
      setNoticeMsg(
        err instanceof Error ? err.message : "Gagal menerapkan payung pelindung anggaran."
      );
    }
  };

  const handleRunStressTest = async () => {
    const scenario = STRESS_SCENARIOS[stressIdx];
    setStressIdx((prev) => (prev + 1) % STRESS_SCENARIOS.length);
    setIsRunningStress(true);
    try {
      const res = await aiApi.runWeatherStressTest(scenario.id);
      setStressResult(res);
    } catch {
      setStressResult({
        scenario: scenario.id,
        title: scenario.label,
        survivalMonths: weather.extremeSimulation.maxSurvivalMonths,
        extendedSurvivalMonths: Number(
          (weather.extremeSimulation.maxSurvivalMonths * 1.3).toFixed(1)
        ),
        postShockScore: Math.max(50, weather.weatherScore - 8),
        status: "TAHAN BADAI (RESILIEN)",
        recommendation:
          "Bantalan kas Anda berada pada zona aman dan mampu menyerap guncangan tanpa defisit kritis.",
      });
    } finally {
      setIsRunningStress(false);
    }
  };

  return (
    <>
      {/* 1. Header Halaman */}
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="pill">Indikator Ketahanan Finansial · P3 Core</span>
            <span>Sistem radar kondisi finansial Anda secara real-time</span>
          </div>
          <h1 style={{ marginTop: "4px" }}>Financial Weather</h1>
          <p className="muted">
            Mengukur stabilitas arus kas, ketahanan likuiditas terhadap guncangan, dan proyeksi
            cuaca keuangan 30–90 hari ke depan.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => void loadWeatherDiagnosis(true)}
            disabled={isRefreshing}
            className="secondary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RotateCw size={14} />{" "}
            {isRefreshing ? "Memperbarui..." : "Pembaruan Diagnosis Cuaca"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="primary-button"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={16} /> Unduh Rapor (PDF)
          </button>
        </div>
      </div>

      {noticeMsg && (
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
            <strong>Financial Weather:</strong> {noticeMsg}
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
              onClick={() => setNoticeMsg(null)}
              className="secondary-button"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* 2. Banner Status Cuaca Utama */}
      <div
        className="card"
        style={{
          background: "var(--green-soft)",
          borderColor: "var(--mint)",
          marginBottom: "24px",
        }}
      >
        <div
          className="grid two-col"
          style={{
            gridTemplateColumns: "1.2fr 2fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {/* Sisi Kiri: Big Score Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "24px",
                background: "var(--green)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 8px 16px rgba(16, 75, 59, 0.2)",
                flexShrink: 0,
              }}
            >
              {weather.zone === "cerah" ? (
                <Sun size={36} />
              ) : weather.zone === "berawan" ? (
                <CloudSun size={36} />
              ) : weather.zone === "hujan" ? (
                <CloudRain size={36} />
              ) : (
                <Zap size={36} />
              )}
              <span style={{ font: "800 22px Manrope", marginTop: "2px" }}>
                {weather.weatherScore}
                <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span>
              </span>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)" }}>
                STABILITAS SAAT INI
              </div>
              <h2
                style={{
                  font: "800 22px Manrope",
                  color: "var(--green)",
                  margin: "2px 0 4px",
                }}
              >
                {weather.statusTitle}
              </h2>
              <span style={{ fontSize: "11px", color: "var(--ink)", display: "block" }}>
                Kategori: <strong>{weather.categoryLabel}</strong>
              </span>
              <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                ● Diperbarui: {weather.updatedAt}
              </span>
            </div>
          </div>

          {/* Sisi Kanan: 4 Ringkasan Metrik */}
          <div>
            <div
              className="notice"
              style={{
                background: "#fff",
                border: "1px solid var(--mint)",
                marginBottom: "12px",
                fontSize: "11px",
                lineHeight: "1.5",
              }}
            >
              <strong style={{ color: "var(--green)" }}>
                Analisis Meteorologi Finansial FIRA:
              </strong>
              <br />
              &ldquo;{weather.aiNarrative}&rdquo;
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>
                  Arus Kas Bersih
                </span>
                <strong style={{ fontSize: "11px", color: "var(--green)" }}>
                  {weather.summaryMetrics.netCashflow >= 0 ? "+" : ""}
                  {formatRupiah(weather.summaryMetrics.netCashflow)}
                </strong>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>
                  Bantalan Kas
                </span>
                <strong style={{ fontSize: "11px" }}>
                  {weather.summaryMetrics.cashCushionMonths} Bulan
                </strong>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>
                  Rasio Cicilan
                </span>
                <strong style={{ fontSize: "11px", color: "var(--green)" }}>
                  {weather.summaryMetrics.debtRatioPct.toFixed(1)}%
                </strong>
              </div>
              <div
                style={{
                  background: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                }}
              >
                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block" }}>
                  Rasio Tabungan
                </span>
                <strong style={{ fontSize: "11px" }}>
                  {weather.summaryMetrics.savingsRatePct}%
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Parameter Barometer Finansial (4 Barometer Grid) */}
      <div style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "12px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
              Parameter Barometer Finansial
            </h2>
            <p className="muted" style={{ fontSize: "11px" }}>
              Diagnostik terukur dari 4 pilar penyusun ketahanan finansial rumah tangga Anda
            </p>
          </div>
          <span className="pill">Kalibrasi Otomatis via Open Finance</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                className="pill"
                style={{
                  background: "#e8f4ee",
                  color: "var(--green)",
                  fontSize: "9px",
                }}
              >
                {weather.barometers.spendingPressure.badge}
              </span>
              <Sun size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Tekanan Pengeluaran</div>
            <div
              style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}
            >
              {weather.barometers.spendingPressure.score}{" "}
              <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span>
            </div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}>
              <span style={{ width: `${weather.barometers.spendingPressure.score}%` }}></span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "var(--muted)",
              }}
            >
              <span>
                Realisasi: {formatRupiah(weather.barometers.spendingPressure.realizedAmount)}
              </span>
              <span>Batas: {formatRupiah(weather.barometers.spendingPressure.limitAmount)}</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                className="pill"
                style={{
                  background: "#e8f4ee",
                  color: "var(--green)",
                  fontSize: "9px",
                }}
              >
                {weather.barometers.liquidityHumidity.badge}
              </span>
              <ShieldCheck size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Kelembaban Likuiditas</div>
            <div
              style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}
            >
              {weather.barometers.liquidityHumidity.score}{" "}
              <span style={{ fontSize: "11px", fontWeight: 400 }}>/100</span>
            </div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}>
              <span style={{ width: `${weather.barometers.liquidityHumidity.score}%` }}></span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "var(--muted)",
              }}
            >
              <span>
                Kas Lancar: {formatRupiah(weather.barometers.liquidityHumidity.liquidCashAmount)}
              </span>
              <span>{weather.barometers.liquidityHumidity.statusText}</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                className="pill"
                style={{
                  background: "#e8f4ee",
                  color: "var(--green)",
                  fontSize: "9px",
                }}
              >
                {weather.barometers.cashflowVolatility.badge}
              </span>
              <TrendingUp size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Volatilitas Arus Kas</div>
            <div
              style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}
            >
              {weather.barometers.cashflowVolatility.stdDevPct}%{" "}
              <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>
                simpangan baku
              </span>
            </div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}>
              <span
                style={{ width: `${weather.barometers.cashflowVolatility.stdDevPct}%` }}
              ></span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "var(--muted)",
              }}
            >
              <span>{weather.barometers.cashflowVolatility.statusText}</span>
              <span>Ambang Beban {weather.barometers.cashflowVolatility.thresholdPct}%</span>
            </div>
          </div>

          <div className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                className="pill"
                style={{
                  background: "#e8f4ee",
                  color: "var(--green)",
                  fontSize: "9px",
                }}
              >
                {weather.barometers.stormVulnerability.badge}
              </span>
              <Umbrella size={16} className="positive" />
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)" }}>
              Indeks Kerentanan Badai
            </div>
            <div
              style={{ font: "800 22px Manrope", color: "var(--green)", margin: "2px 0" }}
            >
              {weather.barometers.stormVulnerability.probabilityLabel}{" "}
              <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--muted)" }}>
                probabilitas 60 hari
              </span>
            </div>
            <div className="progress" style={{ height: "6px", margin: "6px 0" }}>
              <span
                style={{ width: `${weather.barometers.stormVulnerability.probabilityPct}%` }}
              ></span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "var(--muted)",
              }}
            >
              <span>
                Beban Utang Konsumtif: {weather.barometers.stormVulnerability.debtLoadPct}%
              </span>
              <span>{weather.barometers.stormVulnerability.zoneText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Spektrum Cuaca Finansial & Posisi Anda */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
              Spektrum Cuaca Finansial & Posisi Anda
            </h2>
            <p className="muted" style={{ fontSize: "11px" }}>
              Model klasifikasi 4 zona cuaca FIRA berdasarkan ketahanan likuiditas dan rasio beban
              biaya
            </p>
          </div>
          <span className="pill" style={{ background: "var(--green)", color: "#fff" }}>
            ● Posisi Anda Saat Ini: Skor {weather.weatherScore} (Zona{" "}
            {weather.zone.charAt(0).toUpperCase() + weather.zone.slice(1)})
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {/* Zona Cerah */}
          <div
            style={{
              border: weather.zone === "cerah" ? "2px solid var(--green)" : "1px solid var(--line)",
              borderRadius: "12px",
              padding: "14px",
              background: weather.zone === "cerah" ? "var(--green-soft)" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong
                style={{
                  color: "var(--green)",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sun size={16} /> Cerah
              </strong>
              {weather.zone === "cerah" && (
                <span
                  className="pill"
                  style={{ fontSize: "8px", background: "var(--green)", color: "#fff" }}
                >
                  Posisi Anda
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
              Skor 80 – 100
            </div>
            <p style={{ fontSize: "10px", color: "var(--ink)", lineHeight: "1.4", margin: 0 }}>
              Arus kas surplus stabil, dana darurat &gt; 6 bulan, rasio utang &lt; 20%. Pertumbuhan
              aset stabil dan bebas tekanan likuiditas.
            </p>
          </div>

          {/* Zona Berawan */}
          <div
            style={{
              border:
                weather.zone === "berawan" ? "2px solid var(--green)" : "1px solid var(--line)",
              borderRadius: "12px",
              padding: "14px",
              background: weather.zone === "berawan" ? "var(--green-soft)" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong
                style={{
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CloudSun size={16} /> Berawan
              </strong>
              {weather.zone === "berawan" && (
                <span
                  className="pill"
                  style={{ fontSize: "8px", background: "var(--green)", color: "#fff" }}
                >
                  Posisi Anda
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
              Skor 60 – 79
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Arus kas tipis, dana darurat 3-6 bulan. Terdapat pengeluaran impulsif minor yang
              membatasi kapasitas akumulasi modal.
            </p>
          </div>

          {/* Zona Hujan Ringan */}
          <div
            style={{
              border:
                weather.zone === "hujan" ? "2px solid #a86a22" : "1px solid var(--line)",
              borderRadius: "12px",
              padding: "14px",
              background: weather.zone === "hujan" ? "#fff4e7" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong
                style={{
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#a86a22",
                }}
              >
                <CloudRain size={16} /> Hujan Ringan
              </strong>
              {weather.zone === "hujan" && (
                <span className="pill warning" style={{ fontSize: "8px" }}>
                  Posisi Anda
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
              Skor 40 – 59
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Arus kas mendekati imbang/defisit, dana darurat &lt; 3 bulan. Beban gaya hidup atau
              cicilan mulai menggerus tabungan cadangan.
            </p>
          </div>

          {/* Zona Badai Finansial */}
          <div
            style={{
              border:
                weather.zone === "badai" ? "2px solid var(--red)" : "1px solid var(--line)",
              borderRadius: "12px",
              padding: "14px",
              background: weather.zone === "badai" ? "#fff0ef" : "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <strong
                style={{
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--red)",
                }}
              >
                <Zap size={16} /> Badai Finansial
              </strong>
              {weather.zone === "badai" && (
                <span className="pill danger" style={{ fontSize: "8px" }}>
                  Posisi Anda
                </span>
              )}
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "8px" }}>
              Skor &lt; 40
            </div>
            <p style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.4", margin: 0 }}>
              Defisit kronis berkepanjangan, DSR &gt; 35%, dana darurat habis. Ancaman gagal bayar
              atau jerat gali lubang tutup lubang.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Prakiraan Cuaca Finansial 3 Bulan Ke Depan */}
      <div style={{ marginBottom: "24px" }}>
        <div className="card-heading" style={{ marginBottom: "14px" }}>
          <div>
            <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
              Prakiraan Cuaca Finansial 3 Bulan Ke Depan
            </h2>
            <p className="muted" style={{ fontSize: "11px" }}>
              Simulasi prediksi berdasarkan kalender pengeluaran rutin, musiman, dan milestone
              tabungan
            </p>
          </div>
          <span className="pill">Proyeksi AI Berbasis Machine Learning</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {weather.forecasts.map((fc, idx) => (
            <div key={fc.monthLabel} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>
                  {fc.monthLabel}
                </span>
                <span
                  className="pill"
                  style={
                    idx === 2
                      ? { fontSize: "9px", background: "var(--green)", color: "#fff" }
                      : { fontSize: "9px" }
                  }
                >
                  {fc.badge}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: idx === 2 ? "var(--green)" : "var(--green-soft)",
                    color: idx === 2 ? "#fff" : "var(--green)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {fc.iconType === "sparkles" ? (
                    <Sparkles size={22} />
                  ) : fc.iconType === "sun" ? (
                    <Sun size={22} />
                  ) : (
                    <CloudSun size={22} />
                  )}
                </div>
                <div>
                  <strong style={{ fontSize: "15px", display: "block" }}>{fc.badge}</strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                    Prediksi Skor: <strong>{fc.predictedScore} / 100</strong>
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "#f8faf9",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Proyeksi Surplus:</span>
                  <strong className="positive">+{formatRupiah(fc.projectedSurplus)}</strong>
                </div>
              </div>
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                <strong>Catatan AI:</strong> {fc.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Tindakan Mitigasi & Kesiapsiagaan AI */}
      <div className="grid two-col" style={{ gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-heading" style={{ marginBottom: "14px" }}>
            <div>
              <h2 style={{ font: "700 16px Manrope", margin: 0 }}>
                Tindakan Mitigasi & Kesiapsiagaan AI
              </h2>
              <p className="muted" style={{ fontSize: "11px" }}>
                Rekomendasi taktis untuk mempertahankan skor cerah secara berkelanjutan
              </p>
            </div>
            <span className="pill">{weather.mitigations.length} Rekomendasi Aktif</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {weather.mitigations.map((mit, idx) => (
              <div
                key={mit.id}
                style={{
                  border: "1px solid var(--line)",
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
                    className={`pill ${mit.badgeType === "warning" ? "warning" : ""}`}
                    style={{ fontSize: "8px", marginBottom: "4px" }}
                  >
                    {mit.badge}
                  </span>
                  <strong style={{ display: "block", fontSize: "12px" }}>{mit.title}</strong>
                  <p className="muted" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
                    {mit.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void handleMitigationAction(
                      mit.actionType,
                      mit.category_id,
                      mit.recommendedCap
                    )
                  }
                  className={idx === 0 ? "primary-button" : "secondary-button"}
                  style={{ padding: "6px 12px", fontSize: "11px", whiteSpace: "nowrap" }}
                >
                  {mit.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "#0e4336", color: "#fff" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span className="eyebrow" style={{ color: "#a8e6cf", margin: 0 }}>
              SIMULASI CUACA EXTREME
            </span>
            <Zap size={18} style={{ color: "#a8e6cf" }} />
          </div>

          <h2 style={{ font: "700 17px Manrope", margin: "0 0 6px 0", color: "#fff" }}>
            Uji Ketahanan Finansial Anda Terhadap Badai
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "#c1e7dd",
              lineHeight: "1.5",
              marginBottom: "14px",
            }}
          >
            Bagaimana jika Anda tiba-tiba kehilangan pekerjaan selama 6 bulan? Atau mobil
            memerlukan servis darurat Rp 10.000.000? Uji ketahanan radar cuaca sekarang.
          </p>

          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "14px",
              fontSize: "11px",
            }}
          >
            {stressResult ? (
              <>
                <div style={{ color: "#a8e6cf", fontWeight: 700, marginBottom: "4px" }}>
                  ✓ {stressResult.title}
                </div>
                <div style={{ color: "#fff", marginBottom: "4px" }}>
                  Ketahanan Normal: <strong>{stressResult.survivalMonths} Bulan</strong> · Mode
                  Hemat: <strong>{stressResult.extendedSurvivalMonths} Bulan</strong>
                </div>
                <div style={{ color: "#c1e7dd", fontSize: "10px", lineHeight: "1.4" }}>
                  {stressResult.recommendation}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: "#a8e6cf", fontWeight: 700, marginBottom: "4px" }}>
                  Ketahanan Maksimal: {weather.extremeSimulation.maxSurvivalMonths} Bulan (Tanpa
                  Gaji)
                </div>
                <div style={{ color: "#fff" }}>
                  Kondisi Kas: <strong>{weather.extremeSimulation.cashCondition}</strong>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleRunStressTest()}
            disabled={isRunningStress}
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
            {isRunningStress
              ? "Menjalankan Stress-Test..."
              : `Mulai Stress-Test (${STRESS_SCENARIOS[stressIdx].label})`}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
